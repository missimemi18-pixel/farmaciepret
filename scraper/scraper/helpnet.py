import requests
import os
import json
from datetime import datetime

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json"
}

def get_pharmacy_id(name):
    """Ia ID farmacie din baza"""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/pharmacies?name=eq.{name}",
        headers=headers
    )
    if response.status_code == 200 and len(response.json()) > 0:
        return response.json()[0]['id']
    return None

def scrape_helpnet():
    """Scrape produse din Helpnet.ro"""
    print("🔄 Start Helpnet scraper...")
    
    try:
        # Helpnet API endpoint
        url = "https://www.helpnet.ro/api/v1/products"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            produse = response.json()
            print(f"✓ Helpnet: {len(produse)} produse gasit")
            
            helpnet_id = get_pharmacy_id("Helpnet")
            if not helpnet_id:
                print("✗ Helpnet not found in database")
                return
            
            saved = 0
            for produs in produse[:20]:  # Primele 20
                try:
                    # Cauta sau creeaza produsul
                    product_data = {
                        "name": produs.get('name'),
                        "category": produs.get('category', 'OTC'),
                        "ean": produs.get('ean'),
                        "image_url": produs.get('image')
                    }
                    
                    # Salveaza in listings
                    listing_data = {
                        "product_id": produs.get('id'),
                        "pharmacy_id": helpnet_id,
                        "price": float(produs.get('price', 0)),
                        "in_stock": produs.get('in_stock', True),
                        "url": produs.get('url')
                    }
                    
                    response = requests.post(
                        f"{SUPABASE_URL}/rest/v1/listings",
                        json=listing_data,
                        headers=headers,
                        timeout=5
                    )
                    
                    if response.status_code in [201, 409]:
                        saved += 1
                
                except Exception as e:
                    print(f"  Eroare produs: {str(e)}")
                    continue
            
            print(f"✓ Salvat {saved} produse din Helpnet")
        else:
            print(f"✗ Helpnet API error: {response.status_code}")
    
    except Exception as e:
        print(f"✗ Helpnet error: {str(e)}")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("✗ Missing environment variables")
    else:
        scrape_helpnet()
