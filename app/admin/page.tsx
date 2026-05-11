'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

const supabase = createClient(
  'https://flzmjecipfzurnkunyku.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PAROLA_ADMIN = "farmacie2025"

export default function Admin() {
  const [parolaInput, setParolaInput] = useState('')
  const [autentificat, setAutentificat] = useState(false)
  const [farmacii, setFarmacii] = useState<any[]>([])
  const [mesaj, setMesaj] = useState('')
  
  const [produs, setProdus] = useState({
    name: '',
    brand: '',
    category: '',
    ean: '',
    image_url: ''
  })
  const [preturi, setPreturi] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (autentificat) {
      supabase.from('pharmacies').select('*').then(({ data }) => {
        setFarmacii(data || [])
      })
    }
  }, [autentificat])

  function verificaParola() {
    if (parolaInput === PAROLA_ADMIN) {
      setAutentificat(true)
    } else {
      alert('Parola greșită!')
    }
  }

  async function salveaza() {
    setMesaj('Se salvează...')
    
    // 1. Adaugă produsul
    const { data: produsNou, error: err1 } = await supabase
      .from('products')
      .insert([produs])
      .select()
      .single()
    
    if (err1 || !produsNou) {
      setMesaj('❌ Eroare la salvare produs')
      return
    }

    // 2. Adaugă prețurile
    const listings = Object.entries(preturi)
      .filter(([_, price]) => price && parseFloat(price) > 0)
      .map(([pharmacy_id, price]) => ({
        product_id: produsNou.id,
        pharmacy_id,
        price: parseFloat(price),
        in_stock: true
      }))

    if (listings.length > 0) {
      const { error: err2 } = await supabase.from('listings').insert(listings)
      if (err2) {
        setMesaj('⚠️ Produs salvat dar prețurile au eșuat')
        return
      }
    }

    setMesaj(`✅ ${produs.name} salvat cu ${listings.length} prețuri!`)
    
    // Reset formular
    setProdus({ name: '', brand: '', category: '', ean: '', image_url: '' })
    setPreturi({})
    
    setTimeout(() => setMesaj(''), 5000)
  }

  if (!autentificat) {
    return (
      <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '400px', margin: '4rem auto', padding: '2rem'}}>
        <h1 style={{fontSize: '20px', marginBottom: '1rem'}}>🔒 Admin farmaciepret.ro</h1>
        <input
          type="password"
          placeholder="Parolă"
          value={parolaInput}
          onChange={(e) => setParolaInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && verificaParola()}
          style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '8px', fontSize: '14px'}}
        />
        <button
          onClick={verificaParola}
          style={{width: '100%', padding: '10px', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer'}}
        >Intră</button>
      </main>
    )
  }

  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '2rem auto', padding: '0 1rem'}}>
      <h1 style={{fontSize: '22px', marginBottom: '1.5rem', color: '#0F6E56'}}>📦 Adaugă produs nou</h1>

      {mesaj && (
        <div style={{padding: '10px', background: '#E1F5EE', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px'}}>
          {mesaj}
        </div>
      )}

      <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem'}}>
        <input placeholder="Nume produs (ex: Paracetamol 500mg)" value={produs.name} onChange={(e) => setProdus({...produs, name: e.target.value})} style={inputStyle} />
        <input placeholder="Brand (ex: Zentiva)" value={produs.brand} onChange={(e) => setProdus({...produs, brand: e.target.value})} style={inputStyle} />
        <select value={produs.category} onChange={(e) => setProdus({...produs, category: e.target.value})} style={inputStyle}>
          <option value="">Selectează categorie</option>
          <option value="Analgezice">Analgezice</option>
          <option value="Suplimente">Suplimente</option>
          <option value="OTC">OTC</option>
          <option value="Cosmetice">Cosmetice</option>
          <option value="Mamă & copil">Mamă & copil</option>
          <option value="Cardiovascular">Cardiovascular</option>
          <option value="Antivirale">Antivirale</option>
        </select>
        <input placeholder="EAN / Cod de bare (opțional)" value={produs.ean} onChange={(e) => setProdus({...produs, ean: e.target.value})} style={inputStyle} />
        <input placeholder="URL imagine (opțional)" value={produs.image_url} onChange={(e) => setProdus({...produs, image_url: e.target.value})} style={inputStyle} />
      </div>

      <h2 style={{fontSize: '16px', marginBottom: '10px', color: '#085041'}}>💰 Prețuri în farmacii</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem'}}>
        {farmacii.map((f) => (
          <div key={f.id} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{minWidth: '100px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <span style={{width: '8px', height: '8px', borderRadius: '50%', background: f.color}}></span>
              {f.name}
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00 lei"
              value={preturi[f.id] || ''}
              onChange={(e) => setPreturi({...preturi, [f.id]: e.target.value})}
              style={{...inputStyle, flex: 1}}
            />
          </div>
        ))}
      </div>

      <button
        onClick={salveaza}
        disabled={!produs.name}
        style={{width: '100%', padding: '12px', background: produs.name ? '#0F6E56' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: produs.name ? 'pointer' : 'not-allowed'}}
      >Salvează produs + prețuri</button>

      <a href="/" style={{display: 'block', textAlign: 'center', marginTop: '1rem', color: '#0F6E56', fontSize: '13px', textDecoration: 'none'}}>← Înapoi la site</a>
    </main>
  )
}

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  width: '100%'
}