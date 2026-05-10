import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://flzmjecipfzurnkunyku.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsem1qZWNpcGZ6dXJua3VueWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTU1NzQsImV4cCI6MjA5Mzk5MTU3NH0.D_bztbWV6gV57Z8ZDZOTILM2g_Tky-ybSQzIyKv6SJU'
)

async function getProduse() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      listings (
        price,
        old_price,
        in_stock,
        url,
        pharmacies ( name, color )
      )
    `)
  
  console.log('Produse:', JSON.stringify(data))
  console.log('Eroare:', JSON.stringify(error))
  return data || []
}

export default async function Home() {
  const produse = await getProduse()

  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto'}}>
      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '52px'}}>
        <div style={{fontSize: '17px', fontWeight: '500', color: '#0F6E56'}}>farmacie<span style={{color: '#000'}}>pret</span>.ro</div>
      </nav>

      <div style={{background: '#E1F5EE', padding: '1.5rem', borderBottom: '1px solid #9FE1CB'}}>
        <h1 style={{fontSize: '22px', fontWeight: '500', color: '#085041', marginBottom: '4px'}}>Compară prețuri din toate farmaciile online</h1>
        <p style={{fontSize: '13px', color: '#0F6E56', marginBottom: '1rem'}}>Catena, Helpnet, Dona, Dr. Max, Tei și altele — toate într-un singur loc</p>
        <div style={{display: 'flex', gap: '8px', maxWidth: '560px'}}>
          <input type="text" placeholder="ex: Paracetamol 500mg..." style={{flex: 1, padding: '10px 14px', border: '1px solid #5DCAA5', borderRadius: '8px', fontSize: '14px'}} />
          <button style={{padding: '10px 20px', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer'}}>Caută</button>
        </div>
      </div>

      <div style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0.6rem 1.5rem', display: 'flex', gap: '2rem'}}>
        <span style={{fontSize: '12px', color: '#666'}}>🏪 <strong>12</strong> farmacii comparate</span>
        <span style={{fontSize: '12px', color: '#666'}}>💊 <strong>{produse.length}+</strong> produse</span>
        <span style={{fontSize: '12px', color: '#666'}}>🔄 Actualizat azi</span>
        <span style={{fontSize: '12px', color: '#666'}}>💰 Economie medie <strong>23%</strong></span>
      </div>

      <div style={{padding: '1rem', background: '#fff', margin: '1rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '12px', color: '#666'}}>
        Debug: {produse.length} produse găsite
      </div>

      <div style={{padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px'}}>
        {produse.map((produs: any) => {
          const preturi = produs.listings || []
          const pretMin = preturi.length > 0 ? Math.min(...preturi.map((l: any) => l.price)) : 0
          const pretMax = preturi.length > 0 ? Math.max(...preturi.map((l: any) => l.price)) : 0
          return (
            <div key={produs.id} style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '14px'}}>
              <img src={produs.image_url} alt={produs.name} style={{width: '100%', height: '80px', objectFit: 'contain', marginBottom: '8px'}} />
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
            </div>
          )
        })}
      </div>
    </main>
  )
}