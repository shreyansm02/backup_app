from app.core.models import BackupJob
from app.infrastructure.s3_storage import S3Storage
from app.infrastructure.nfs_client import NFSClient, MockNFSClient
import os
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from sqlalchemy.orm import Session
from fastapi import WebSocket
from . import crud
from app.api.schema import BackupJobCreate
# from app.api.routes import ConnectionManager
from app.utils.websocket_manager import ConnectionManager
import asyncio
import json

class BackupService:
    def __init__(self, db: Session, aws_access_key_id: str, aws_secret_access_key: str, region_name: str, bucket_name: str):
        self.db = db
        self.s3_storage = S3Storage(aws_access_key_id, aws_secret_access_key, region_name, bucket_name)
        # self.nfs_client = NFSClient()
        self.nfs_client = MockNFSClient()  # Use MockNFSClient for testing

    def create_backup_job(self, source: str, target: str) -> BackupJob:
        owner_id = crud.get_owner_id(self.db)
        print(f"Owner ID: {owner_id}")
        backup_job = BackupJobCreate(
            source_path=source,
            target_path=target,
            status='pending',
            owner_id=owner_id
            )
        return crud.create_backup_job(self.db, backup_job)

    async def start_backup_job(self, job_id: int, upload_to_s3: bool = False, 
                           s3_key: str = None, use_nfs: bool = False, nfs_path: str = None, websocket_manager: ConnectionManager = None):
        job = crud.get_backup_job_by_id(self.db, job_id)
        if not job:
            raise ValueError("Job not found")

        async def backup():
            try:
                # Wait for WebSocket connection to stabilize
                # await asyncio.sleep(10)  # Adjust the delay as needed

                job.status = 'in_progress'
                if websocket_manager:
                    await websocket_manager.broadcast(json.dumps({
                        "status": job.status,
                        "progress": job.progress,
                        "message": f"Job {job_id} is in progress."
                    }))
                    
                # if websocket_manager:
                #     await websocket_manager.broadcast(f"Job {job_id} started")

                # if websocket_manager:
                #     for i in range(1, 11):
                #         await websocket_manager.broadcast(json.dumps({
                #             "status": job.status,
                #             "progress": i * 10,
                #             "message": f"Progress: {i * 10}%"
                #         }))
                #         await asyncio.sleep(1)  # Simulate some work being done
                    
                # Backup to NFS if specified
                if use_nfs and nfs_path:
                    local_mount_path = job.target_path
                    self.nfs_client.mount(nfs_path, local_mount_path)
                    await self.backup_directory(job_id, job.source_path, local_mount_path, websocket_manager)
                    self.nfs_client.unmount(local_mount_path)
                else:
                    # Simulate local file copy (if needed)
                    if not upload_to_s3:
                        destination = os.path.join(job.target_path, os.path.basename(job.source_path))
                        shutil.copy2(job.source_path, destination)

                # Optionally upload to S3
                if upload_to_s3 and s3_key:
                    self.s3_storage.upload_file(job.source_path, s3_key)

                job.status = 'completed'
                if websocket_manager:
                    await websocket_manager.broadcast(f"Job {job_id} completed")
            except Exception as e:
                job.status = 'failed'
                job.error_message = str(e)
                if websocket_manager:
                    await websocket_manager.broadcast(f"Job {job_id} failed: {str(e)}")

            self.db.commit()

        await backup()

    async def backup_directory(self, job_id: int, source: str, target: str, websocket_manager: ConnectionManager = None):
        """Backup a directory to an NFS share."""
        files_to_copy = []
        for root, dirs, files in os.walk(source):
            for name in files:
                file_path = os.path.join(root, name)
                relative_path = os.path.relpath(file_path, source)
                target_path = os.path.join(target, relative_path)
                files_to_copy.append((file_path, target_path))

        with ThreadPoolExecutor() as executor, tqdm(total=len(files_to_copy), desc="Copying files", unit="file") as progress_bar:
            futures = {executor.submit(self.nfs_client.copy_file, src, tgt): (src, tgt) for src, tgt in files_to_copy}

            for future in as_completed(futures):
                try:
                    future.result()
                    progress_bar.update(1)
                    job = crud.get_backup_job_by_id(self.db, job_id)
                    if job:
                        job.progress = (progress_bar.n / progress_bar.total) * 100
                        self.db.commit()
                        if websocket_manager:
                            await websocket_manager.broadcast(json.dumps({
                                "status": job.status,
                                "progress": job.progress,
                                "message": f"Copied {progress_bar.n}/{progress_bar.total} files"
                            }))
                except Exception as e:
                    print(f"Error during backup: {e}")
                    job = crud.get_backup_job_by_id(self.db, job_id)
                    job.status = 'failed'
                    job.error_message = str(e)
                    self.db.commit()

  

    def get_job_status(self, job_id: int) -> BackupJob:
        return crud.get_backup_job_by_id(self.db, job_id)