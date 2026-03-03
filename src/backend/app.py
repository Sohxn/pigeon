from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.gmail_service import GmailService
from services.supa_auth import SupabaseService
from datetime import datetime

app = Flask(__name__)
CORS(app)

#INITIALISE THE SERVICES WE ARE USING
gmail_service = GmailService(
    Config.google_client_id,
    Config.google_client_secret,
    Config.redirect_uri
)
supabase_service = SupabaseService(
    Config.supabase_url,
    Config.supabase_key
)


#TEST ROUTE 
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'pigeon-backend'})


# production endpoints

#callback during auth 
#flow: 
@app.route('/api/gmail/oauth/callback', methods=['POST'])
def gmail_oauth_callback():
    """Handle Gmail OAuth callback - now creates email_account"""
    try:
        data = request.json
        code = data['code']
        user_id = data['user_id']
        
        # Exchange code for tokens
        tokens = gmail_service.exchange_code_for_tokens(code)
        
        # Check if this is first account (make it primary)
        existing_accounts = supabase_service.client.table('email_accounts')\
            .select('id')\
            .eq('user_id', user_id)\
            .execute()
        
        is_first_account = len(existing_accounts.data) == 0
        

        #logging
        if(is_first_account):
            print("first account using this as primary")
        else:
            print("not a primary account")
        
        # Create email account record
        account_data = {
            'user_id': user_id,
            'email_address': tokens['gmail_email'],
            'provider': 'gmail',
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'token_expiry': tokens['token_expiry'],
            'is_primary': is_first_account,
            'is_connected': True,
        }
        
        result = supabase_service.client.table('email_accounts')\
            .upsert(account_data, on_conflict='user_id,email_address')\
            .execute()
        
        return jsonify({
            'success': True,
            'gmail_email': tokens['gmail_email'],
            'account_id': result.data[0]['id']
        })
        
    except Exception as e:
        print(f'OAuth error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 400



#synchronise mails using GMAIL API 
#flow: 
@app.route('/api/gmail/sync', methods=['POST'])
def sync_gmail():
    """Sync emails - now supports specific account or all accounts"""
    try:
        data = request.json
        user_id = data['user_id']
        account_id = data.get('account_id')  # Optional - sync specific account
        
        if account_id:
            # Sync specific account
            accounts = [supabase_service.get_email_account(account_id)]
        else:
            # Sync all accounts
            accounts = supabase_service.get_user_email_accounts(user_id)
        
        total_synced = 0
        
        for account in accounts:
            # Fetch emails from Gmail
            result = gmail_service.fetch_emails(
                access_token=account['access_token'],
                refresh_token=account['refresh_token'],
                max_results=50
            )
            
            # Save emails with account_id
            for email_data in result['emails']:
                email_data['user_id'] = user_id
                email_data['account_id'] = account['id']
                
                try:
                    supabase_service.save_email(email_data)
                    total_synced += 1
                except Exception as e:
                    print(f'Error saving email: {e}')
            
            # Update last_sync
            supabase_service.client.table('email_accounts')\
                .update({'last_sync': 'NOW()'})\
                .eq('id', account['id'])\
                .execute()
        
        return jsonify({
            'success': True,
            'synced': total_synced,
            'accounts_synced': len(accounts)
        })
        
    except Exception as e:
        print(f'Sync error: {e}')
        return jsonify({'error': str(e)}), 500




@app.route('/api/emails', methods=['GET'])
def get_emails():
    """Get emails - now returns from all accounts by default"""
    try:
        user_id = request.args.get('user_id')
        account_id = request.args.get('account_id')  # Optional filter
        limit = int(request.args.get('limit', 50))
        
        if account_id:
            # Get emails from specific account
            emails = supabase_service.get_emails_by_account(account_id, limit)
        else:
            # Get emails from all user's accounts (unified inbox)
            emails = supabase_service.get_emails(user_id, limit)
        
        return jsonify({
            'success': True,
            'emails': emails
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# send mails 
# flow: 
@app.route('/api/gmail/send', methods=['POST'])
def send_email():
    """Send an email"""
    try:
        data = request.json
        user_id = data['user_id']
        
        tokens = supabase_service.get_gmail_tokens(user_id)
        
        result = gmail_service.send_email(
            access_token=tokens['access_token'],
            refresh_token=tokens['refresh_token'],
            to=data['to'],
            subject=data['subject'],
            body=data['body']
        )
         
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    #development mode
    app.run(debug=True, port=5000)