import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.core.supabase import supabase_admin

class EmailService:
    @staticmethod
    async def send_email(to: str, subject: str, body: str):
        msg = MIMEMultipart()
        msg["From"] = settings.EMAILS_FROM_EMAIL
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
                
            # Log to Supabase
            supabase_admin.table("email_logs").insert({
                "recipient": to,
                "subject": subject,
                "status": "SUCCESS"
            }).execute()
            return True
        except Exception as e:
            supabase_admin.table("email_logs").insert({
                "recipient": to,
                "subject": subject,
                "status": "FAILED"
            }).execute()
            print(f"Email error: {e}")
            return False

email_service = EmailService()
