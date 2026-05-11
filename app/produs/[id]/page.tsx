'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { useParams } from 'next/navigation'

const supabase = createClient(
  'https://flzmjecipfzurnkunyku.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProdusDetail() {
  const params = useParams()
  const id = params.id as string
  
  const [produs, setProdus] = useState<any>(null)
  const [istoric, setIstoric] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [emailAlerta, setEmailAlerta] = useState('')
  const [pretTinta, setPretTinta] = useState('')
  const [mesajAlerta, setMesajAlerta] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data: produsData } = await supabase
        .from('products')
        .select('*, listings (id, price, in_stock, url, pharmacies (name, color))')
        .eq('id', id)
        .single()
      
      setProdus(produsData)
      
      if (produsData && produsData.listings) {
        const listingIds = produsData.listings.map((l: any) => l.id)
        const { data: history } = await supabase
          .from('price_history')
          .select('*')
          .in('listing_id', listingIds)
          .order('recorded_at', { ascending: true })
        
        const grouped: any = {}
        if (history) {
          history.forEach((h: any) => {
            const data = new Date(h.recorded_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
            const listing = produsData.listings.find((l: any) => l.id === h.listing_id)
            const farmacie = listing && listing.pharmacies ? listing.pharmacies.name : null
            
            if (!grouped[data]) grouped[data] = { data }
            if (farmacie) grouped[data][farmacie] = parseFloat(h.price)
          })
        }
        
        setIstoric(Object.values(grouped))
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [id])

  async function salveazaAlerta() {
    if (!emailAlerta || !pretTinta) {
      setMesajAlerta('Completeaza emailul si pretul tinta!')
      return
    }
    
    const { error } = await supabase.from('price_alerts').insert([{
      user_email: emailAlerta,
      product_id: id,
      target_price: parseFloat(pretTinta),
      active: true
    }])
    
    if (error) {
      setMesajAlerta('Eroare la salvare')
    } else {
      setMesajAlerta('Alerta creata! Te vom anunta cand pretul scade.')
      setEmailAlerta('')
      setPretTinta('')
    }
  }

  if (loading) {
    return <div style={{padding: '3rem', textAlign: 'center'}}>Se incarca...</div>
  }
  
  if (!produs) {
    return <div style={{padding: '3rem', textAlign: 'center'}}>Produs negasit</div>
  }

  const preturi = produs.listings || []
  const pretMin = preturi.length > 0 ? Math.min(...preturi.map((l: any) => l.price)) : 0
  const farmaciiList = preturi.map((l: any) => l.pharmacies && l.pharmacies.name).filter(Boolean)
  const preturiSortate = [...preturi].sort((a: any, b: any) => a.price - b.price)

  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto'}}>
      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0 1.5rem', height: '52px', display: 'flex', alignItems: 'center'}}>
        <a href="/" style={{fontSize: '17px', fontWeight: '500', color: '#0F6E56', textDecoration: 'none'}}>farmaciepret.ro</a>
      </nav>

      <div style={{padding: '1.5rem'}}>
        <a href="/" style={{color: '#0F6E56', fontSize: '13px', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem'}}>Inapoi la produse</a>

        <div style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem'}}>
          <div style={{fontSize: '12px', color: '#0F6E56', background: '#E1F5EE', padding: '2px 10px', borderRadius: '12px', display: 'inline-block', marginBottom: '8px'}}>{produs.category}</div>
          <h1 style={{fontSize: '22px', fontWeight: '500', marginBottom: '4px'}}>{produs.name}</h1>
          <div style={{fontSize: '13px', color: '#666', marginBottom: '1rem'}}>{produs.brand}</div>
          <div style={{fontSize: '32px', fontWeight: '500', color: '#0F6E56'}}>de la {pretMin.toFixed(2)} lei</div>
        </div>

        <div style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem'}}>
          <h2 style={{fontSize: '16px', marginBottom: '1rem', color: '#085041'}}>Preturi in farmacii</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {preturiSortate.map((listing: any) => (
              <div key={listing.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f9f9f9', borderRadius: '8px'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'}}>
                  <span style={{width: '10px', height: '10px', borderRadius: '50%', background: listing.pharmacies && listing.pharmacies.color}}></span>
                  <strong>{listing.pharmacies && listing.pharmacies.name}</strong>
                </span>
                <span style={{fontSize: '16px', fontWeight: '500', color: listing.price === pretMin ? '#0F6E56' : '#333'}}>
                  {listing.price.toFixed(2)} lei
                </span>
              </div>
            ))}
          </div>
        </div>

        {istoric.length > 0 && (
          <div style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem'}}>
            <h2 style={{fontSize: '16px', marginBottom: '1rem', color: '#085041'}}>Evolutie pret - ultimele 30 zile</h2>
            <div style={{width: '100%', height: '300px'}}>
              <ResponsiveContainer>
                <LineChart data={istoric}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="data" style={{fontSize: '11px'}} />
                  <YAxis style={{fontSize: '11px'}} />
                  <Tooltip />
                  <Legend />
                  {farmaciiList.map((nume: string) => {
                    const listing = preturi.find((l: any) => l.pharmacies && l.pharmacies.name === nume)
                    const color = listing && listing.pharmacies ? listing.pharmacies.color : '#0F6E56'
                    return (
                      <Line key={nume} type="monotone" dataKey={nume} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={{background: '#E1F5EE', border: '1px solid #5DCAA5', borderRadius: '12px', padding: '1.5rem'}}>
          <h2 style={{fontSize: '16px', marginBottom: '8px', color: '#085041'}}>Alerta pret</h2>
          <p style={{fontSize: '13px', color: '#0F6E56', marginBottom: '1rem'}}>Primeste email cand pretul scade sub valoarea dorita.</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px'}}>
            <input
              type="email"
              placeholder="Email-ul tau"
              value={emailAlerta}
              onChange={(e) => setEmailAlerta(e.target.value)}
              style={{padding: '10px 12px', border: '1px solid #5DCAA5', borderRadius: '8px', fontSize: '14px', background: '#fff'}}
            />
            <input
              type="number"
              step="0.01"
              placeholder={'Pret tinta (curent: ' + pretMin.toFixed(2) + ' lei)'}
              value={pretTinta}
              onChange={(e) => setPretTinta(e.target.value)}
              style={{padding: '10px 12px', border: '1px solid #5DCAA5', borderRadius: '8px', fontSize: '14px', background: '#fff'}}
            />
            <button
              onClick={salveazaAlerta}
              style={{padding: '10px', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer'}}
            >Seteaza alerta</button>
          </div>
          
          {mesajAlerta && (
            <div style={{marginTop: '10px', padding: '10px', background: '#fff', borderRadius: '8px', fontSize: '13px'}}>
              {mesajAlerta}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}