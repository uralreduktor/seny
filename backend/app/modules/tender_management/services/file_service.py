import uuid
from datetime import datetime, timezone

from fastapi import UploadFile
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import storage
from app.modules.tender_management.models.tender import TenderFile
from app.modules.tender_management.services.audit_service import AuditService


class FileService:
    @staticmethod
    async def upload(
        db: AsyncSession, tender_id: int, file: UploadFile, category: str, user_id: int
    ) -> TenderFile:

        # 1. Generate unique filename
        file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_filename = f"{tender_id}/{uuid.uuid4()}.{file_ext}"

        # 2. Read content
        content = await file.read()

        # 3. Upload to MinIO
        await storage.upload_file(
            file_data=content,
            filename=unique_filename,
            content_type=file.content_type or "application/octet-stream",
        )

        # 4. Create DB Record
        db_file = TenderFile(
            tender_id=tender_id,
            filename=file.filename,
            file_path=unique_filename,
            category=category,
            uploaded_by_id=user_id,
        )

        db.add(db_file)

        # 5. Log Audit
        await AuditService.log(
            db=db,
            tender_id=tender_id,
            user_id=user_id,
            action="file_uploaded",
            details={"filename": file.filename, "category": category},
        )

        await db.commit()
        await db.refresh(db_file)

        return db_file

    @staticmethod
    async def delete(db: AsyncSession, file_id: int) -> bool:
        result = await db.execute(select(TenderFile).where(TenderFile.id == file_id))
        file_record = result.scalar_one_or_none()

        if not file_record:
            return False

        if file_record.is_archived:
            return True

        # Delete from MinIO storage but keep DB record (soft delete)
        try:
            await storage.delete_file(file_record.file_path)
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Failed to delete file {} from storage: {}", file_record.id, exc
            )

        file_record.is_archived = True
        file_record.archived_at = datetime.now(timezone.utc)

        await AuditService.log(
            db=db,
            tender_id=file_record.tender_id,
            user_id=file_record.uploaded_by_id,
            action="file_deleted",
            details={
                "filename": file_record.filename,
                "file_id": file_record.id,
            },
        )

        db.add(file_record)
        await db.commit()
        await db.refresh(file_record)
        return True

    @staticmethod
    async def get_url(db: AsyncSession, file_id: int) -> str:
        result = await db.execute(select(TenderFile).where(TenderFile.id == file_id))
        file_record = result.scalar_one_or_none()

        if not file_record or file_record.is_archived:
            return None

        return await storage.get_file_url(file_record.file_path)
