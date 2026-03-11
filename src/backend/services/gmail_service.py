from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re
from email.utils import parsedate_to_datetime
from html2text import html2text


class GmailService:
    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
    
    def exchange_code_for_tokens(self, auth_code):
        """Exchange authorization code for access + refresh tokens"""

        print(f"~Backend redirect_uri: {self.redirect_uri}")
        print(f"~Backend client_id: {self.client_id}")
        print(f"~Auth code received: {auth_code[:20]}...")


        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uris": [self.redirect_uri],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },


            #updated scopes
            #added openid
            scopes=[
                'openid',
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/gmail.compose',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.labels',
                'https://www.googleapis.com/auth/userinfo.email',
            ]
        )
        

        flow.redirect_uri = self.redirect_uri

        print(f"~Flow redirect_uri: {flow.redirect_uri}")
        
        try:
            flow.fetch_token(code=auth_code)
            credentials = flow.credentials
            
            # Get user's email
            service = build('gmail', 'v1', credentials=credentials)
            profile = service.users().getProfile(userId='me').execute()
            
            return {
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expiry': credentials.expiry.isoformat() if credentials.expiry else None,
                'gmail_email': profile['emailAddress']
            }
        except Exception as e:
            print(f"!!! Token exchange error: {e}")
            raise


    
    def get_gmail_service(self, access_token, refresh_token):
        """Create Gmail API service"""
        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        return build('gmail', 'v1', credentials=credentials)
    
    def fetch_emails(self, access_token, refresh_token, max_results=50, page_token=None, query='in:inbox'):
        """Fetch emails from Gmail"""
        try:
            service = self.get_gmail_service(access_token, refresh_token)
            
            results = service.users().messages().list(
                userId='me',
                maxResults=max_results,
                pageToken=page_token,
                q=query
            ).execute()
            
            messages = results.get('messages', [])
            next_page_token = results.get('nextPageToken')
            
            emails = []
            for msg in messages:
                email_data = self._get_email_details(service, msg['id'])
                if email_data:
                    emails.append(email_data)
            
            return {
                'emails': emails,
                'next_page_token': next_page_token
            }
            
        except HttpError as error:
            print(f'Gmail API error: {error}')
            return {'emails': [], 'next_page_token': None}
    
    def _get_email_details(self, service, msg_id):
        """Get full email details"""
        try:
            message = service.users().messages().get(
                userId='me',
                id=msg_id,
                format='full'
            ).execute()
            
            headers = message['payload']['headers']
            
            def get_header(name):
                for h in headers:
                    if h['name'].lower() == name.lower():
                        return h['value']
                return None
            
            body = self._get_email_body(message['payload'])
            
            return {
                'gmail_id': message['id'],
                'thread_id': message['threadId'],
                'subject': get_header('Subject') or '(No Subject)',
                'from_email': self._extract_email(get_header('From')),
                'from_name': self._extract_name(get_header('From')),
                'to_email': self._parse_email_list(get_header('To')),
                'cc_email': self._parse_email_list(get_header('Cc')),
                'received_at': self._parse_date(get_header('Date')),
                'body_text': body['text'],
                'body_html': body['html'],
                'snippet': message.get('snippet', ''),
                'labels': message.get('labelIds', []),
                'is_read': 'UNREAD' not in message.get('labelIds', []),
                'is_starred': 'STARRED' in message.get('labelIds', []),
            }
        except Exception as e:
            print(f'Error fetching email {msg_id}: {e}')
            return None
    
    def _get_email_body(self, payload):
        """Extract text and HTML body"""
        body = {'text': '', 'html': ''}
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain' and 'data' in part['body']:
                    body['text'] = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                elif part['mimeType'] == 'text/html' and 'data' in part['body']:
                    body['html'] = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                elif 'parts' in part:
                    nested = self._get_email_body(part)
                    body['text'] = body['text'] or nested['text']
                    body['html'] = body['html'] or nested['html']
        elif 'body' in payload and 'data' in payload['body']:
            decoded = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
            if payload['mimeType'] == 'text/plain':
                body['text'] = decoded
            elif payload['mimeType'] == 'text/html':
                body['html'] = decoded
        
        # Fallback: convert HTML to text
        if not body['text'] and body['html']:
            body['text'] = html2text(body['html'])
        
        return body
    
    def _extract_email(self, from_header):
        """Extract email from 'Name <email@example.com>'"""
        if not from_header:
            return ''
        match = re.search(r'<(.+?)>', from_header)
        return match.group(1) if match else from_header.strip()
    
    def _extract_name(self, from_header):
        """Extract name from 'Name <email@example.com>'"""
        if not from_header:
            return ''
        match = re.match(r'^(.+?)\s*<.+?>$', from_header)
        return match.group(1).strip('"') if match else self._extract_email(from_header)
    
    def _parse_email_list(self, email_str):
        """Parse comma-separated email list"""
        if not email_str:
            return []
        emails = re.findall(r'[\w\.-]+@[\w\.-]+', email_str)
        return emails
    
    def _parse_date(self, date_str):
        """Parse email date to ISO format"""
        try:
            dt = parsedate_to_datetime(date_str)
            return dt.isoformat()
        except:
            return None
    
    def send_email(self, access_token, refresh_token, to, subject, body):
        """Send an email"""
        service = self.get_gmail_service(access_token, refresh_token)
        
        message = MIMEText(body)
        message['to'] = to
        message['subject'] = subject
        
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        try:
            sent = service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            return {'success': True, 'message_id': sent['id']}
        except HttpError as error:
            return {'success': False, 'error': str(error)}