import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

# Supabase config
SUPABASE_URL = "https://flzmjecipfzurnkunyku.supabase.co"
SUPABASE_KEY = "LIPESTE_CHEIA_LEGACY_ANON"  # Cheia de mai devreme

headers = {
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json"
}

def scrape_catena():
    """Scrape produse din Catena.ro"""
    try:
        # Catena are un API internal - incerc sa iau produsele
        url = "https://www.catena.ro/api/products?limit=100"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            produse = response.json()
            print(f"✓ Catena: {len(produse)} produse gasit")
            return produse
        else:
            print(f"✗ Catena: Status {response.status_code}")
            return []
    except Exception as e:
        print(f"✗ Catena error: {str(e)}")
        return []

def save_to_supabase(produs, farmacie_id):
    """Salveaza produs in Supabase"""
    try:
        # Cauta produsul dupa EAN sau nume
        search_url = f"{SUPABASE_URL}/rest/v1/products?name=eq.{produs.get('name')}"
        response = requests.get(search_url, headers=headers)
        
        if response.status_code == 200 and len(response.json()) > 0:
            product_id = response.json()[0]['id']
        else:
            # Creeaza produs nou
            product_data = {
                "name": produs.get('name'),
                "category": produs.get('category', 'OTC'),
                "ean": produs.get('ean'),
                "image_url": produs.get('image')
            }
            create_response = requests.post(
                f"{SUPABASE_URL}/rest/v1/products",
                json=product_data,
                headers=headers
            )
            if create_response.status_code == 201:
                product_id = create_response.json()[0]['id']
            else:
                return False
        
        # Salveaza pretul in listings
        listing_data = {
            "product_id": product_id,
            "pharmacy_id": farmacie_id,
            "price": float(produs.get('price', 0)),
            "in_stock": produs.get('in_stock', True),
            "url": produs.get('url')
        }
        listing_response = requests.post(
            f"{SUPABASE_URL}/rest/v1/listings",
            json=listing_data,
            headers=headers
        )
        return listing_response.status_code == 201
    except Exception as e:
        print(f"Eroare salvare: {str(e)}")
        return False

def main():
    print("🔄 Incepe scraping Catena...")
    
    # Ia ID farmacie Catena din baza
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/pharmacies?name=eq.Catena",
            headers=headers
        )
        if response.status_code == 200 and len(response.json()) > 0:
            catena_id = response.json()[0]['id']
            produse = scrape_catena()
            
            saved = 0
            for produs in produse[:50]:  # Doar primele 50 pentru test
                if save_to_supabase(produs, catena_id):
                    saved += 1
            
            print(f"✓ Salvat {saved} produse din {len(produse)}")
        else:
            print("✗ Farmacie Catena nu gasita in baza")
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    main()
