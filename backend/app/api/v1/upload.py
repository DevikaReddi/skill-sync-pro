"""File upload endpoints."""
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Depends
from typing import Optional
from app.services.pdf_parser import DocumentProcessor, PDFParser
from app.core.auth import get_current_active_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/upload",
    tags=["upload"],
)

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Upload and parse resume document."""
    
    # Validate file size (max 10MB)
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10MB limit"
        )
    
    # Check file type
    processor = DocumentProcessor()
    if not processor.is_supported_format(file.content_type):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Supported: PDF, TXT"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Process document
        extracted_text = processor.process_document(content, file.content_type)
        
        if not extracted_text:
            # Return 422 instead of raising an exception that causes 500
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract text from document. Please ensure the file is not corrupted."
            )
        
        # Validate if it's a resume (but don't fail if it's not)
        if file.content_type == 'application/pdf':
            parser = PDFParser()
            validation = parser.validate_resume_content(extracted_text)
            
            if not validation["is_valid"]:
                logger.warning(f"Document may not be a resume: {validation['issues']}")
        
        return {
            "success": True,
            "filename": file.filename,
            "content_type": file.content_type,
            "text": extracted_text,
            "character_count": len(extracted_text)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing file upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error processing file: {str(e)}"
        )

@router.post("/job-description")
async def upload_job_description(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """Upload and parse job description document."""
    
    # Similar validation as resume
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 5MB limit"
        )
    
    processor = DocumentProcessor()
    if not processor.is_supported_format(file.content_type):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}"
        )
    
    try:
        content = await file.read()
        extracted_text = processor.process_document(content, file.content_type)
        
        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract text from document"
            )
        
        return {
            "success": True,
            "filename": file.filename,
            "text": extracted_text,
            "character_count": len(extracted_text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing job description: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error processing file: {str(e)}"
        )