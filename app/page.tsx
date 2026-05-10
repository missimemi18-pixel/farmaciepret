export default function Home() {
  return (
    <main style={{fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '0'}}>
      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '52px'}}>
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
        <span style={{fontSize: '12px', color: '#666'}}>💊 <strong>48.200+</strong> produse</span>
        <span style={{fontSize: '12px', color: '#666'}}>🔄 Actualizat acum <strong>14 min</strong></span>
        <span style={{fontSize: '12px', color: '#666'}}>💰 Economie medie <strong>23%</strong></span>
      </div>

      <div style={{padding: '1rem 1.5rem', color: '#666', fontSize: '14px'}}>
        Produsele se vor afișa aici după conectarea la baza de date.
      </div>
    </main>
  );
}