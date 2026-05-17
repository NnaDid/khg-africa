import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

class CloudinaryService:
    @staticmethod
    def upload_image(file_path: str, folder: str = "khg-africa/reports"):
        try:
            response = cloudinary.uploader.upload(file_path, folder=folder)
            return response.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            return None

    @staticmethod
    def upload_audio(file_path: str, folder: str = "khg-africa/voice-notes"):
        try:
            response = cloudinary.uploader.upload(file_path, folder=folder, resource_type="video") # Audio is treated as video
            return response.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            return None

cloudinary_service = CloudinaryService()
