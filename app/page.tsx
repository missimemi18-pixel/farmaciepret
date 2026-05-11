'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

const supabase = createClient(
  'https://flzmjecipfzurnkunyku.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [produse, setProduse] = useState<any[]>([])
  const [cautare, setCautare] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalProduse, setTotalProduse] = useState(0)

  async function getProduse(query: string) {
    setLoading(true)
    
    if (query) {
      const searchPattern = '%' + query + '%'
      const { data } = await supabase
        .from('products')
        .select('*, listings (price, in_stock, url, pharmacies (name, color))')
        .ilike('name', searchPattern)
        .limit(50)
      setProduse(data || [])
    } else {
      const { data } = await supabase
        .from('products')
        .select('*, listings!inner (price, in_stock, url, pharmacies (name, color))')
        .limit(30)
      setProduse(data || [])
    }
    setLoading(false)
  }

  async function getTotal() {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    setTotalProduse(count || 0)
  }

  useEffect(() => {
    getProduse('')
    getTotal()
  }, [])

  function handleCautare() { getProduse(cautare) }
  function handleKeyDown(e: any) { if (e.key === 'Enter') handleCautare() }
  function resetCautare() {
    setCautare('')
    getProduse('')
  }

  function getColor(price: number, min: number, max: number) {
    if (price === min) return '#0F6E56'
    if (price === max && min !== max) return '#A32D2D'
    return '#333'
  }

  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto'}}>
      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '52px'}}>
        <a href="/" style={{fontSize: '17px', fontWeight: '500', color: '#0F6E56', textDecoration: 'none'}}>farmacie<span style={{color: '#000'}}>pret</span>.ro</a>
      </nav>

      <div style={{background: '#E1F5EE', padding: '1.5rem', borderBottom: '1px solid #9FE1CB'}}>
        <h1 style={{fontSize: '22px', fontWeight: '500', color: '#085041', marginBottom: '4px'}}>Compara preturi din toate farmaciile online</h1>
        <p style={{fontSize: '13px', color: '#0F6E56', marginBottom: '1rem'}}>{totalProduse.toLocaleString()} medicamente disponibile pentru cautare</p>
        <div style={{display: 'flex', gap: '8px', maxWidth: '560px'}}>
          <input
            type="text"
            placeholder="ex: Paracetamol, Nurofen, Aspenter..."
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{flex: 1, padding: '10px 14px', border: '1px solid #5DCAA5', borderRadius: '8px', fontSize: '14px'}}
          />
          <button
            onClick={handleCautare}
            style={{padding: '10px 20px', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer'}}
          >Cauta</button>
          {cautare && (
            <button
              onClick={resetCautare}
              style={{padding: '10px 16px', background: '#fff', color: '#0F6E56', border: '1px solid #5DCAA5', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'}}
            >Resetare</button>
          )}
        </div>
      </div>

      <div style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0.6rem 1.5rem', display: 'flex', gap: '2rem'}}>
        <span style={{fontSize: '12px', color: '#666'}}><strong>6</strong> farmacii</span>
        <span style={{fontSize: '12px', color: '#666'}}><strong>{totalProduse.toLocaleString()}</strong> medicamente</span>
        <span style={{fontSize: '12px', color: '#666'}}>Actualizat azi</span>
      </div>

      {!cautare && (
        <div style={{padding: '1rem 1.5rem', background: '#FAEEDA', borderBottom: '1px solid #FAC775'}}>
          <p style={{fontSize: '13px', color: '#633806', margin: 0}}>
            Mai jos vezi produsele cu preturi comparate. Pentru restul medicamentelor, foloseste cautarea sus.
          </p>
        </div>
      )}

      {loading ? (
        <div style={{padding: '3rem', textAlign: 'center', color: '#666'}}>Se incarca...</div>
      ) : produse.length === 0 ? (
        <div style={{padding: '3rem', textAlign: 'center', color: '#666'}}>Niciun produs gasit pentru: {cautare}</div>
      ) : (
        <div style={{padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px'}}>
          {produse.map((produs: any) => {
            const preturi = produs.listings || []
            const arePreturi = preturi.length > 0
            const pretMin = arePreturi ? Math.min(...preturi.map((l: any) => l.price)) : 0
            const pretMax = arePreturi ? Math.max(...preturi.map((l: any) => l.price)) : 0
            const linkProdus = '/produs/' + produs.id
            return (
              <a key={produs.id} href={linkProdus} style={{textDecoration: 'none', color: 'inherit'}}>
                <div style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '14px', cursor: 'pointer', height: '100%'}}>
                  <div style={{width: '100%', height: '60px', background: '#E1F5EE', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>Rx</div>
                  <div style={{fontSize: '10px', color: '#0F6E56', background: '#E1F5EE', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '6px'}}>{produs.category}</div>
                  <div style={{fontSize: '12px', fontWeight: '500', marginBottom: '4px', lineHeight: '1.3'}}>{produs.name}</div>
                  {arePreturi ? (
                    <div>
                      <div style={{fontSize: '16px', fontWeight: '500', color: '#0F6E56', marginBottom: '8px'}}>{pretMin.toFixed(2)} lei</div>
                      <div style={{borderTop: '1px solid #eee', paddingTop: '8px'}}>
                        {preturi.slice(0, 4).map((listing: any, idx: number) => (
                          <div key={idx} style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0'}}>
                            <span style={{color: '#666', display: 'flex', alignItems: 'center', gap: '4px'}}>
                              <span style={{width: '6px', height: '6px', borderRadius: '50%', background: listing.pharmacies?.color, display: 'inline-block'}}></span>
                              {listing.pharmacies?.name}
                            </span>
                            <span style={{fontWeight: listing.price === pretMin ? '600' : '400', color: getColor(listing.price, pretMin, pretMax)}}>
                              {listing.price.toFixed(2)} lei
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{padding: '8px 0', fontSize: '11px', color: '#888', fontStyle: 'italic'}}>Preturi nedisponibile</div>
                  )}
                  <div style={{marginTop: '8px', textAlign: 'center', fontSize: '11px', color: '#0F6E56'}}>Vezi detalii</div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}