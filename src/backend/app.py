from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.gmail_service import GmailService
from services.supa_auth import SupabaseService

app = Flask(__name__)
CORS(app)

gmail_service = GmailService(
    Config.google_client_id,
    Config.google_client_secret,
    Config.redirect_uri
)
supabase_service = SupabaseService(
    Config.supabase_url,
    Config.supabase_key
)


# ── HEALTH ────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'pigeon-backend'})


# ── OAUTH CALLBACK ────────────────────────────────────────────────────────

@app.route('/api/gmail/oauth/callback', methods=['POST'])
def gmail_oauth_callback():
    """Exchange OAuth code for tokens and create/update email_account row."""
    try:
        data = request.json
        code = data['code']
        user_id = data['user_id']

        tokens = gmail_service.exchange_code_for_tokens(code)

        existing = supabase_service.client.table('email_accounts')\
            .select('id')\
            .eq('user_id', user_id)\
            .execute()

        is_first = len(existing.data) == 0
        print("first account — marking as primary" if is_first else "additional account")

        account_data = {
            'user_id': user_id,
            'email_address': tokens['gmail_email'],
            'provider': 'gmail',
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'token_expiry': tokens['token_expiry'],
            'is_primary': is_first,
            'is_connected': True,
            'last_history_id': str(tokens['history_id']) if tokens.get('history_id') else None,
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


# ── SYNC ──────────────────────────────────────────────────────────────────

@app.route('/api/gmail/sync', methods=['POST'])
def sync_gmail():
    """
    Smart sync per account:
      - Has last_history_id  ->  incremental (only new emails, ~1 s)
      - No history_id or history expired  ->  full sync of last 50 emails

    All emails saved in ONE batch upsert per account.
    """
    try:
        data = request.json
        user_id = data['user_id']
        account_id = data.get('account_id')

        accounts = (
            [supabase_service.get_email_account(account_id)]
            if account_id
            else supabase_service.get_user_email_accounts(user_id)
        )

        total_saved = 0

        for account in accounts:
            email_address = account.get('email_address', account['id'])
            history_id = account.get('last_history_id')

            # ── Choose sync strategy ──────────────────────────────────────
            if history_id:
                result = gmail_service.fetch_emails_incremental(
                    access_token=account['access_token'],
                    refresh_token=account['refresh_token'],
                    start_history_id=history_id
                )
                if result is None:
                    print(f"{email_address}: history expired, falling back to full sync")
                    result = gmail_service.fetch_emails_full(
                        access_token=account['access_token'],
                        refresh_token=account['refresh_token'],
                        max_results=50
                    )
            else:
                print(f"{email_address}: first sync — full fetch")
                result = gmail_service.fetch_emails_full(
                    access_token=account['access_token'],
                    refresh_token=account['refresh_token'],
                    max_results=50
                )

            # ── Stamp each email with user/account IDs ────────────────────
            emails_to_save = []
            for email_data in result['emails']:
                email_data['user_id'] = user_id
                email_data['account_id'] = account['id']
                emails_to_save.append(email_data)

            # ── ONE batch upsert — not N individual requests ──────────────
            if emails_to_save:
                saved = supabase_service.save_emails_batch(emails_to_save)
                total_saved += len(saved) if saved else 0

            # ── Persist new history_id for next incremental sync ──────────
            if result.get('history_id'):
                supabase_service.update_account_history_id(
                    account['id'],
                    result['history_id'],
                    email_address=email_address
                )

            sync_type = "full" if result.get('is_full_sync') else "incremental"
            print(
                f"{email_address}: {sync_type} sync — "
                f"{len(emails_to_save)} emails, historyId={result.get('history_id')}"
            )

        return jsonify({
            'success': True,
            'synced': total_saved,
            'accounts_synced': len(accounts)
        })

    except Exception as e:
        print(f'Sync error: {e}')
        return jsonify({'error': str(e)}), 500


# ── GET EMAILS ────────────────────────────────────────────────────────────

@app.route('/api/emails', methods=['GET'])
def get_emails():
    """Return emails from the database — fast, no Gmail API call."""
    try:
        user_id = request.args.get('user_id')
        account_id = request.args.get('account_id')
        limit = int(request.args.get('limit', 100))

        emails = (
            supabase_service.get_emails_by_account(account_id, limit)
            if account_id
            else supabase_service.get_emails(user_id, limit)
        )
        return jsonify({'success': True, 'emails': emails})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── SEND EMAIL ────────────────────────────────────────────────────────────

@app.route('/api/gmail/send', methods=['POST'])
def send_email():
    """Send an email via Gmail API."""
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
    app.run(debug=True, port=5000)