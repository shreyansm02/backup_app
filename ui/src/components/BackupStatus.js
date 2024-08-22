import React, { useState } from 'react';
import { getBackupStatus } from '../api/api';

const BackupStatus = () => {
    const [jobId, setJobId] = useState('');
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await getBackupStatus(jobId);
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching backup status:', error);
        }
    };

    return (
        <div>
            <h2>Check Backup Status</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Job ID</label>
                    <input type="text" className="form-control" value={jobId} onChange={(e) => setJobId(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Check Status</button>
            </form>

            {status && (
                <div>
                    <h3>Status for Job ID: {jobId}</h3>
                    <p>Status: {status.status}</p>
                    <p>Progress: {status.progress}%</p>
                    {status.error_message && <p>Error: {status.error_message}</p>}
                </div>
            )}
        </div>
    );
};

export default BackupStatus;
