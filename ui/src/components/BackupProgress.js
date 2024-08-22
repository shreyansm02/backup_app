import React, { useEffect, useState } from 'react';

const BackupProgress = ({ jobId, onWebSocketReady }) => {
    const [status, setStatus] = useState('Initializing...');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [wsReady, setWsReady] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/backup/${jobId}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setWsReady(true);  // Mark WebSocket as ready
            if (onWebSocketReady) {
                onWebSocketReady();  // Notify parent component that WebSocket is ready
            }
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Message received:', data);
            setProgress(data.progress);
            setStatus(data.status);
            setMessage(data.message);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            ws.close();
        };
    }, [jobId]);

    return (
        <div>
            <h3>Backup Progress for Job ID: {jobId}</h3>
            <p>Status: {status}</p>
            <progress value={progress} max="100"></progress>
            <p>{progress}% completed</p>
            <p>{message}</p>
        </div>
    );
};

export default BackupProgress;
