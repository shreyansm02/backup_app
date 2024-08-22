import React, { useState } from 'react';
import { createRegularBackup } from '../api/api'; // Adjust the import path as necessary

const RegularBackupForm = () => {
    const [source, setSource] = useState('');
    const [target, setTarget] = useState('');
    const [uploadToS3, setUploadToS3] = useState(false);
    const [s3Key, setS3Key] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const backupData = {
            source: source,
            target: target,
            upload_to_s3: uploadToS3,
            s3_key: s3Key,
        };

        try {
            const response = await createRegularBackup(backupData);
            console.log('Regular backup created successfully:', response.data);
        } catch (error) {
            console.error('Error creating regular backup:', error);
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
                <label>Target Path:</label>
                <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Upload to S3:</label>
                <input
                    type="checkbox"
                    checked={uploadToS3}
                    onChange={(e) => setUploadToS3(e.target.checked)}
                />
            </div>
            <div>
                <label>S3 Key:</label>
                <input
                    type="text"
                    value={s3Key}
                    onChange={(e) => setS3Key(e.target.value)}
                    required={uploadToS3} // Only required if uploadToS3 is true
                    disabled={!uploadToS3} // Disable input if not uploading to S3
                />
            </div>
            <button type="submit">Create Regular Backup</button>
        </form>
    );
};

export default RegularBackupForm;
