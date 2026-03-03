from supabase import create_client, Client

class SupabaseService:
    # CONSTRUCTOR TO INITIALISE SUPA CLIENT 
    def __init__(self, url, key):
        self.client: Client = create_client(url, key)
    

    # EMAIL ACCOUNTS (New multi-account structure)
    def save_email_account(self, account_data):
        """Save email account"""
        result = self.client.table('email_accounts').upsert(account_data).execute()
        return result.data
    
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
    
    def get_primary_account(self, user_id):
        """Get user's primary email account"""
        result = self.client.table('email_accounts')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('is_primary', True)\
            .single()\
            .execute()
        return result.data if result.data else None
    

    # EMAILS
    def save_email(self, email_data):
        """Save email to database"""
        result = self.client.table('emails').upsert(email_data).execute()
        return result.data
    

    # FETCHING EMAILS FROM DATABASE
    def get_emails(self, user_id, limit=50):
        """Get user's emails from all accounts"""
        result = self.client.table('emails')\
            .select('*, email_accounts(email_address, provider)')\
            .eq('user_id', user_id)\
            .order('received_at', desc=True)\
            .limit(limit)\
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
    
    
    def update_email_status(self, email_id, updates):
        """Update email status"""
        result = self.client.table('emails')\
            .update(updates)\
            .eq('id', email_id)\
            .execute()
        return result.data


    # LEGACY SUPPORT (for send_email route that still uses get_gmail_tokens)
    def get_gmail_tokens(self, user_id):
        """Get user's primary Gmail account tokens (for sending)"""
        account = self.get_primary_account(user_id)
        if not account:
            # If no primary, get first account
            accounts = self.get_user_email_accounts(user_id)
            account = accounts[0] if accounts else None
        
        if not account:
            raise Exception("No email account connected")
        
        return {
            'access_token': account['access_token'],
            'refresh_token': account['refresh_token'],
            'token_expiry': account.get('token_expiry')
        }