import asyncio
import io
from datetime import timedelta

from loguru import logger
from minio import Minio
from minio.error import S3Error

from app.core.config import settings


class StorageClient:
    def __init__(self):
        self.client = Minio(
            endpoint=f"{settings.MINIO_ENDPOINT}:{settings.MINIO_PORT}",
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_SSL,
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(bucket_name=self.bucket_name):
                self.client.make_bucket(bucket_name=self.bucket_name)
        except S3Error as exc:
            logger.error("MinIO bucket error: {}", exc)
        except Exception as exc:  # noqa: BLE001
            logger.exception("MinIO connection error: {}", exc)

    async def upload_file(
        self, file_data: bytes, filename: str, content_type: str
    ) -> str:
        """Uploads file to MinIO in a background thread and returns object name."""
        return await asyncio.to_thread(
            self._upload_file_sync,
            file_data,
            filename,
            content_type,
        )

    def _upload_file_sync(
        self, file_data: bytes, filename: str, content_type: str
    ) -> str:
        try:
            file_stream = io.BytesIO(file_data)
            self.client.put_object(
                self.bucket_name,
                filename,
                file_stream,
                length=len(file_data),
                content_type=content_type,
            )
            return filename
        except S3Error as exc:
            logger.error("MinIO upload error: {}", exc)
            raise

    async def get_file_url(self, filename: str, expires_hours: int = 1) -> str:
        """Generates a presigned URL for the file."""
        return await asyncio.to_thread(
            self._get_file_url_sync,
            filename,
            expires_hours,
        )

    def _get_file_url_sync(self, filename: str, expires_hours: int) -> str:
        try:
            return self.client.presigned_get_object(
                self.bucket_name,
                filename,
                expires=timedelta(hours=expires_hours),
            )
        except Exception as exc:  # noqa: BLE001
            logger.error("MinIO presigned URL error: {}", exc)
            return ""

    async def download_file(self, filename: str):
        """Get file content stream via background thread."""
        return await asyncio.to_thread(self._download_file_sync, filename)

    def _download_file_sync(self, filename: str):
        try:
            return self.client.get_object(self.bucket_name, filename)
        except Exception as exc:  # noqa: BLE001
            logger.exception("MinIO download error for {}: {}", filename, exc)
            raise

    async def delete_file(self, filename: str):
        """Delete file from MinIO asynchronously."""
        await asyncio.to_thread(self._delete_file_sync, filename)

    def _delete_file_sync(self, filename: str):
        try:
            self.client.remove_object(self.bucket_name, filename)
        except Exception as exc:  # noqa: BLE001
            logger.exception("MinIO delete error for {}: {}", filename, exc)
            raise


storage = StorageClient()
