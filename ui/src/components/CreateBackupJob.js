import React, { useState } from 'react';
import { createBackupJob } from '../api/api'; // Assuming you have this function defined

const BackupJobForm = () => {
    const [sourcePath, setSourcePath] = useState('');
    const [targetPath, setTargetPath] = useState('');
    const [status, setStatus] = useState('');
    const [ownerId, setOwnerId] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const backupJobData = {
            source_path: sourcePath,
            target_path: targetPath,
            status: status,
            owner_id: ownerId
        };

        try {
            const response = await createBackupJob(backupJobData);
            console.log('Backup job created successfully:', response.data);
        } catch (error) {
            console.error('Error creating backup job:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Source Path:</label>
                <input
                    type="text"
                    value={sourcePath}
                    onChange={(e) => setSourcePath(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Target Path:</label>
                <input
                    type="text"
                    value={targetPath}
                    onChange={(e) => setTargetPath(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Status:</label>
                <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Owner ID:</label>
                <input
                    type="number"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Create Backup Job</button>
        </form>
    );
};

export default BackupJobForm;

