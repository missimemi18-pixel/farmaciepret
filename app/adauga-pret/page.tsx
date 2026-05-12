'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

const supabase = createClient(
  'https://flzmjecipfzurnkunyku.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdaugaPret() {
  const [orase, setOrase] = useState<string[]>([])
  const [orasSelectat, setOrasSelectat] = useState('Sibiu')
  const [farmacii, setFarmacii] = useState<any[]>([])
  const [produseGasite, setProduseGasite] = useState<any[]>([])
  const [cautareProdus, setCautareProdus] = useState('')
  const [produsSelectat, setProdusSelectat] = useState<any>(null)
  const [farmacieSelectata, setFarmacieSelectata] = useState('')
  const [pret, setPret] = useState('')
  const [emailUser, setEmailUser] = useState('')
  const [inStock, setInStock] = useState(true)
  const [mesaj, setMesaj] = useState('')

  useEffect(() => {
    supabase.from('pharmacy_locations').select('city').then(({ data }) => {
      const uniqueCities = [...new Set((data || []).map((d: any) => d.city))]
      setOrase(uniqueCities)
    })
  }, [])

  useEffect(() => {
    if (orasSelectat) {
      supabase
        .from('pharmacy_locations')
        .select('*')
        .eq('city', orasSelectat)
        .then(({ data }) => setFarmacii(data || []))
    }
  }, [orasSelectat])

  async function cautaProduse() {
    if (cautareProdus.length < 3) return
    const searchPattern = '%' + cautareProdus + '%'
    const { data } = await supabase
      .from('products')
      .select('id, name, brand, category')
      .ilike('name', searchPattern)
      .limit(10)
    setProduseGasite(data || [])
  }

  async function salveazaPret() {
    if (!produsSelectat || !farmacieSelectata || !pret) {
      setMesaj('Completeaza toate campurile!')
      return
    }

    const { error } = await supabase.from('local_prices').insert([{
      product_id: produsSelectat.id,
      location_id: farmacieSelectata,
      price: parseFloat(pret),
      in_stock: inStock,
      submitted_by_email: emailUser || null,
      verified: false
    }])

    if (error) {
      setMesaj('Eroare la salvare')
    } else {
      setMesaj('Mulțumim! Pretul a fost salvat si va ajuta multa lume.')
      setProdusSelectat(null)
      setCautareProdus('')
      setProduseGasite([])
      setFarmacieSelectata('')
      setPret('')
      setTimeout(() => setMesaj(''), 5000)
    }
  }

  const inputStyle: any = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '12px'
  }

  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto'}}>
      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '52px'}}>
        <a href="/" style={{fontSize: '17px', fontWeight: '500', color: '#0F6E56', textDecoration: 'none'}}>farmacie<span style={{color: '#000'}}>pret</span>.ro</a>
      </nav>

      <div style={{padding: '1.5rem'}}>
        <a href="/" style={{color: '#0F6E56', fontSize: '13px', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem'}}>← Inapoi</a>

        <h1 style={{fontSize: '22px', marginBottom: '8px', color: '#085041'}}>📸 Adauga un pret vazut in farmacie</h1>
        <p style={{fontSize: '13px', color: '#666', marginBottom: '1.5rem'}}>Ajuta comunitatea sa stie unde gasesc cel mai bun pret la medicamente in orasul tau!</p>

        {mesaj && (
          <div style={{padding: '12px', background: '#E1F5EE', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px', color: '#085041'}}>
            {mesaj}
          </div>
        )}

        <label style={{display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px'}}>1. Oras</label>
        <select value={orasSelectat} onChange={(e) => setOrasSelectat(e.target.value)} style={inputStyle}>
          {orase.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <label style={{display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px'}}>2. Cauta produsul</label>
        <input
          type="text"
          placeholder="ex: Paracetamol, Nurofen..."
          value={cautareProdus}
          onChange={(e) => {
            setCautareProdus(e.target.value)
            if (e.target.value.length >= 3) cautaProduse()
            else setProduseGasite([])
          }}
          style={inputStyle}
        />

        {produseGasite.length > 0 && !produsSelectat && (
          <div style={{maxHeight: '200px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '12px'}}>
            {produseGasite.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setProdusSelectat(p)
                  setProduseGasite([])
                  setCautareProdus(p.name)
                }}
                style={{padding: '8px 12px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '13px'}}
              >
                <strong>{p.name}</strong>
                <div style={{fontSize: '11px', color: '#666'}}>{p.brand} · {p.category}</div>
              </div>
            ))}
          </div>
        )}

        {produsSelectat && (
          <div style={{padding: '10px', background: '#E1F5EE', borderRadius: '8px', marginBottom: '12px', fontSize: '13px'}}>
            ✓ Selectat: <strong>{produsSelectat.name}</strong>
            <button onClick={() => { setProdusSelectat(null); setCautareProdus(''); }} style={{marginLeft: '8px', background: 'none', border: 'none', color: '#0F6E56', cursor: 'pointer', fontSize: '12px'}}>schimba</button>
          </div>
        )}

        <label style={{display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px'}}>3. Farmacia</label>
        <select value={farmacieSelectata} onChange={(e) => setFarmacieSelectata(e.target.value)} style={inputStyle}>
          <option value="">Selecteaza farmacia...</option>
          {farmacii.map(f => <option key={f.id} value={f.id}>{f.name} - {f.address}</option>)}
        </select>

        <label style={{display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px'}}>4. Pret vazut (lei)</label>
        <input
          type="number"
          step="0.01"
          placeholder="ex: 12.50"
          value={pret}
          onChange={(e) => setPret(e.target.value)}
          style={inputStyle}
        />

        <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px'}}>
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          Produsul era in stoc
        </label>

        <label style={{display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px'}}>5. Email-ul tau (optional)</label>
        <input
          type="email"
          placeholder="pentru a-ti multumi prin email"
          value={emailUser}
          onChange={(e) => setEmailUser(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={salveazaPret}
          style={{width: '100%', padding: '12px', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer'}}
        >Trimite pretul</button>
      </div>
    </main>
  )
}