from supabase import create_client, Client

class SupabaseService:
    #CONSTRUCTOR TO INITIALISE SUPA CLIENT 
    def __init__(self, url, key):
        self.client: Client = create_client(url, key)
    

    #TOKENS GENERATED DURING AUTH 
    def save_gmail_tokens(self, user_id, tokens):
        """Save Gmail OAuth tokens"""
        data = {
            'user_id': user_id,
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'token_expiry': tokens['token_expiry'],
            'gmail_email': tokens.get('gmail_email'),
            'is_connected': True,
            'last_sync': 'NOW()'
        }
        
        result = self.client.table('user_gmail_tokens').upsert(data).execute()
        return result.data
    
    def get_gmail_tokens(self, user_id):
        """Get user's Gmail tokens"""
        result = self.client.table('user_gmail_tokens')\
                            .select('*')\
                            .eq('user_id', user_id).single().execute()
        return result.data
    

    #AFTER AUTH
    def save_email(self, email_data):
        """Save email to database"""
        result = self.client.table('emails').upsert(email_data).execute()
        
        return result.data
    

    #FETCHING EMAILS FROM DATABASE
    def get_emails(self, user_id, limit=50):
        """Get user's emails"""
        result = self.client.table('emails')\
            .select('*').eq('user_id', user_id).order('received_at', desc=True).limit(limit).execute()
        
        return result.data
    
    
    def update_email_status(self, email_id, updates):
        """Update email status"""
        result = self.client.table('emails')\
            .update(updates)\
            .eq('id', email_id)\
            .execute()
        return result.data

    
    #multi account structure 
    def get_user_email_accounts(self, user_id):
        """Get all email accounts for a user"""
        result = self.client.table('email_accounts')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('is_connected', True)\
            .execute()
        return result.data
    
    def get_email_account(self, account_id):
        """Get specific email account"""
        result = self.client.table('email_accounts')\
            .select('*')\
            .eq('id', account_id)\
            .single()\
            .execute()
        return result.data
    
    def get_emails_by_account(self, account_id, limit=50):
        """Get emails from specific account"""
        result = self.client.table('emails')\
            .select('*')\
            .eq('account_id', account_id)\
            .order('received_at', desc=True)\
            .limit(limit)\
            .execute()
        return result.data