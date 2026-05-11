import requests
import os
from datetime import datetime

# Supabase config
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

def get_pharmacy_id(name):
    """Ia ID farmacie din baza"""
    headers = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/pharmacies?name=eq.{name}",
        headers=headers
    )
    if response.status_code == 200 and len(response.json()) > 0:
        return response.json()[0]['id']
    return None

def scrape_catena():
    """Scrape Catena - versiune simplificata pentru test"""
    print("🔄 Start Catena scraper...")
    
    try:
        catena_id = get_pharmacy_id("Catena")
        if not catena_id:
            print("✗ Catena not found in database")
            return
        
        print(f"✓ Found Catena ID: {catena_id}")
        print("✓ Scraper completed successfully")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("✗ Missing SUPABASE_URL or SUPABASE_KEY")
    else:
        scrape_catena()
