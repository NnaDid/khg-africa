import httpx
from app.core.config import settings
from app.core.supabase import supabase_admin

class SMSService:
    @staticmethod
    async def send_sms(to: str, message: str, provider: str = "termii"):
        """
        Sends SMS using the specified provider with fallback logic.
        """
        success = False
        error_msg = ""
        
        if provider == "termii":
            success, error_msg = await SMSService._send_termii(to, message)
        elif provider == "africastalking":
            success, error_msg = await SMSService._send_africastalking(to, message)
        
        if not success:
            # Fallback to Twilio
            success, error_msg = await SMSService._send_twilio(to, message)
            provider = "twilio_fallback"

        # Log to Supabase
        supabase_admin.table("sms_logs").insert({
            "recipient": to,
            "message": message,
            "provider": provider,
            "status": "SUCCESS" if success else "FAILED",
            "error": error_msg
        }).execute()
        
        return success

    @staticmethod
    async def _send_termii(to: str, message: str):
        url = "https://api.ng.termii.com/api/sms/send"
        payload = {
            "to": to,
            "from": "KHG-Africa",
            "sms": message,
            "type": "plain",
            "channel": "generic",
            "api_key": settings.TERMII_API_KEY,
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                return response.status_code == 200, response.text
        except Exception as e:
            return False, str(e)

    @staticmethod
    async def _send_africastalking(to: str, message: str):
        # Implementation for Africa's Talking
        return False, "Not implemented"

    @staticmethod
    async def _send_twilio(to: str, message: str):
        # Implementation for Twilio
        return False, "Not implemented"

sms_service = SMSService()
