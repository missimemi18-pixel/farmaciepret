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

  async function getProduse(query = '') {
    setLoading(true)
    let request = supabase
      .from('products')
      .select(`*, listings (price, old_price, in_stock, url, pharmacies (name, color))`)

    if (query) request = request.ilike('name', `%${query}%`)

    const { data } = await request
    setProduse(data || [])
    setLoading(false)
  }

  useEffect(() => { getProduse() }, [])

  function handleCautare() { getProduse(cautare) }
  function handleKeyDown(e: any) { if (e.key === 'Enter') handleCautare() }

  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto'}}>
      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '52px'}}>
        <div style={{fontSize: '17px', fontWeight: '500', color: '#0F6E56'}}>farmacie<span style={{color: '#000'}}>pret</span>.ro</div>
      </nav>

      <div style={{background: '#E1F5EE', padding: '1.5rem', borderBottom: '1px solid #9FE1CB'}}>
        <h1 style={{fontSize: '22px', fontWeight: '500', color: '#085041', marginBottom: '4px'}}>Compară prețuri din toate farmaciile online</h1>
        <p style={{fontSize: '13px', color: '#0F6E56', marginBottom: '1rem'}}>Catena, Helpnet, Dona, Dr. Max, Tei și altele — toate într-un singur loc</p>
        <div style={{display: 'flex', gap: '8px', maxWidth: '560px'}}>
          <input
            type="text"
            placeholder="ex: Paracetamol 500mg..."
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{flex: 1, padding: '10px 14px', border: '1px solid #5DCAA5', borderRadius: '8px', fontSize: '14px'}}
          />
          <button
            onClick={handleCautare}
            style={{padding: '10px 20px', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer'}}
          >Caută</button>
        </div>
      </div>

      <div style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0.6rem 1.5rem', display: 'flex', gap: '2rem'}}>
        <span style={{fontSize: '12px', color: '#666'}}>🏪 <strong>6</strong> farmacii comparate</span>
        <span style={{fontSize: '12px', color: '#666'}}>💊 <strong>{produse.length}</strong> produse</span>
        <span style={{fontSize: '12px', color: '#666'}}>🔄 Actualizat azi</span>
        <span style={{fontSize: '12px', color: '#666'}}>💰 Economie medie <strong>23%</strong></span>
      </div>

      {loading ? (
        <div style={{padding: '3rem', textAlign: 'center', color: '#666'}}>Se încarcă...</div>
      ) : produse.length === 0 ? (
        <div style={{padding: '3rem', textAlign: 'center', color: '#666'}}>Niciun produs găsit pentru "<strong>{cautare}</strong>"</div>
      ) : (
        <div style={{padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px'}}>
          {produse.map((produs: any) => {
            const preturi = produs.listings || []
            const pretMin = preturi.length > 0 ? Math.min(...preturi.map((l: any) => l.price)) : 0
            const pretMax = preturi.length > 0 ? Math.max(...preturi.map((l: any) => l.price)) : 0
            return (
              
                key={produs.id}
                href={`/produs/${produs.id}`}
                style={{textDecoration: 'none', color: 'inherit'}}
              >
                <div style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'border-color 0.15s'}}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5DCAA5'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#eee'}
                >
                  <div style={{width: '100%', height: '80px', background: '#E1F5EE', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>💊</div>
                  <div style={{fontSize: '11px', color: '#0F6E56', background: '#E1F5EE', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '6px'}}>{produs.category}</div>
                  <div style={{fontSize: '13px', fontWeight: '500', marginBottom: '4px', lineHeight: '1.3'}}>{produs.name}</div>
                  <div style={{fontSize: '18px', fontWeight: '500', color: '#0F6E56', marginBottom: '8px'}}>{pretMin.toFixed(2)} lei</div>
                  <div style={{borderTop: '1px solid #eee', paddingTop: '8px'}}>
                    {preturi.map((listing: any) => (
                      <div key={listing.pharmacies?.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0'}}>
                        <span style={{color: '#666', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <span style={{width: '6px', height: '6px', borderRadius: '50%', background: listing.pharmacies?.color, display: 'inline-block'}}></span>
                          {listing.pharmacies?.name}
                        </span>
                        <span style={{fontWeight: listing.price === pretMin ? '600' : '400', color: listing.price === pretMin ? '#0F6E56' : listing.price === pretMax ? '#A32D2D' : '#333'}}>
                          {listing.price.toFixed(2)} lei
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop: '8px', textAlign: 'center', fontSize: '11px', color: '#0F6E56'}}>Vezi detalii →</div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}