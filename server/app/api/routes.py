from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.services.backup_service import BackupService
from app.api import schema
from app.api.schema import BackupRequest, NFSBackupRequest
from app.infrastructure.nfs_client import NFSClient

from app.services import crud
from app.core.database import SessionLocal
from app.utils.websocket_manager import manager
import asyncio
from typing import List
import json
router = APIRouter()

# Dependency to provide a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_backup_service(db: Session = Depends(get_db)) -> BackupService:
    return BackupService(
        aws_access_key_id="your-access-key",
        aws_secret_access_key="your-secret-key",
        region_name="us-east-1",
        bucket_name="shreylocal",
        db=db
    )


@router.websocket("/ws/backup/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: int, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    print(f"WebSocket connection established for job_id: {job_id}")
    try:
        while True:
            job = crud.get_backup_job_by_id(db, job_id)
            if job:
                progress_data = {
                    "status": job.status,
                    "progress": job.progress,
                    "message": f"Job {job_id} is {job.status}."
                }
                await websocket.send_text(json.dumps(progress_data))
            else:
                await websocket.send_text(json.dumps({
                    "status": "Error",
                    "progress": 0,
                    "message": f"Job {job_id} not found."
                }))
            await asyncio.sleep(1)  # Update frequency (adjust as needed)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for job_id: {job_id}")
        manager.disconnect(websocket)  # No await here since disconnect is not asynchronous
    except Exception as e:
        print(f"Exception in WebSocket for job_id: {job_id}: {e}")
        manager.disconnect(websocket)  # No await here since disconnect is not asynchronous
        raise HTTPException(status_code=500, detail=f"WebSocket error: {e}")


@router.post("/users/", response_model=schema.User)
def create_user(user: schema.UserCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_user(db=db, user=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {e}")

@router.post("/configurations/", response_model=schema.Configuration)
def create_configuration(configuration: schema.ConfigurationCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_configuration(db=db, configuration=configuration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating configuration: {e}")

@router.post("/backup_jobs/", response_model=schema.BackupJob)
def create_backup_job(backup_job: schema.BackupJobCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_backup_job(db=db, backup_job=backup_job)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating backup job: {e}")
    

@router.post("/backup/")
async def create_backup(request: schema.BackupRequest, backup_service: BackupService = Depends(get_backup_service)):
    try:
        job = backup_service.create_backup_job(request.source, request.target)
        await backup_service.start_backup_job(job.id, upload_to_s3=request.upload_to_s3, s3_key=request.s3_key, websocket_manager=manager)
        return {"job_id": job.id, "status": "Backup started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {e}")

@router.post("/backup/nfs/")
async def backup_to_nfs(request: schema.NFSBackupRequest, backup_service: BackupService = Depends(get_backup_service)):
    try:
        job = backup_service.create_backup_job(request.source, request.local_path)
        await backup_service.start_backup_job(job.id, use_nfs=True, nfs_path=request.nfs_path, websocket_manager=manager)
        return {"job_id": job.id, "status": "Backup to NFS started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup to NFS failed: {e}")

@router.get("/backup/{job_id}/status/")
def get_backup_status(job_id: int, backup_service: BackupService = Depends(get_backup_service)):
    job = backup_service.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job.id, "status": job.status, "error_message": job.error_message}

@router.post("/backup_metadata/", response_model=schema.BackupMetadata)
def create_backup_metadata(backup_metadata: schema.BackupMetadataCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_backup_metadata(db=db, backup_metadata=backup_metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating backup metadata: {e}")
