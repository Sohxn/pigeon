from google.cloud import pubsub_v1
from googleapiclient.discovery import build

class GmailPushService:
    def __init__(self, gmail_service):
        self.gmail_service = gmail_service
        
    def watch_inbox(self, user_email, access_token, refresh_token):
        service = self.gmail_service.get_gmail_service(access_token, refresh_token)

        request = {
            'labelIds': ['INBOX'],
            'topicName': 'projects/YOUR_PROJECT/topics/gmail-push'  # You create this once
        }

        result = service.users().watch(userId='me', body=request).execute()

        return 