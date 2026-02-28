import os 
from dotenv import load_dotenv

load_dotenv()


#ONLY GOOGLE (gmail) API FOR NOW
class Config:
   #CONFIGURATION CREDS FOR ALL THE SERVICES WE WILL USE HERE
    #google 
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')

    #supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    


