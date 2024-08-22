import React, { useState } from 'react';
import { createNfsBackup } from '../api/api'; // Adjust the import path as necessary

const NfsBackupForm = ({ onJobCreated }) => { // Destructure onJobCreated from props
    const [source, setSource] = useState('');
    const [localPath, setLocalPath] = useState('');
    const [nfsPath, setNfsPath] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const backupData = {
            source: source,
            local_path: localPath,
            nfs_path: nfsPath,
        };

        try {
            const response = await createNfsBackup(backupData);
            console.log('NFS backup created successfully:', response.data);
            const jobId = response.data.job_id; // Assuming the API response contains job_id
            if (onJobCreated) {
                onJobCreated(jobId); // Pass the jobId to the parent component
            }
        } catch (error) {
            console.error('Error creating NFS backup:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Source Path:</label>
                <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Local Path:</label>
                <input
                    type="text"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>NFS Path:</label>
                <input
                    type="text"
                    value={nfsPath}
                    onChange={(e) => setNfsPath(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Create NFS Backup</button>
        </form>
    );
};

export default NfsBackupForm;
