import React, { useState } from 'react';
import './styles/App.css';
import UserForm from './components/UserForm';
import CreateBackupJob from './components/CreateBackupJob';
import ConfigurationForm from './components/ConfigurationForm';
import BackupProgress from './components/BackupProgress';
import BackupStatus from './components/BackupStatus';
import RegularBackupForm from './components/RegularBackupForm';
import NfsBackupForm from './components/NfsBackupForm';

import { createNfsBackup } from './api/api';

const App = () => {
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [wsReady, setWsReady] = useState(false);

    const handleJobSelection = (jobId) => {
        setSelectedJobId(jobId);
    };

    const handleJobCreated = (jobId) => {
        console.log('Job created with ID:', jobId); // Debug log
        setSelectedJobId(jobId);
    };

    const handleWebSocketReady = () => {
        setWsReady(true);
    };

    const handleNfsBackup = (backupData) => {
        if (wsReady) {
            createNfsBackup(backupData)
                .then(response => console.log(response.data))
                .catch(error => console.error(error));
        } else {
            console.error('WebSocket is not ready');
        }
    };

    return (
        <div className="container">
            <h1>Backup Application</h1>
            <UserForm />
            <ConfigurationForm />
            <CreateBackupJob />
            <RegularBackupForm />
            <NfsBackupForm onJobCreated={handleJobCreated} onBackup={handleNfsBackup} /> {/* Pass handler to NfsBackupForm */}
            <BackupStatus />
            {selectedJobId && <BackupProgress jobId={selectedJobId} onWebSocketReady={handleWebSocketReady} />}
            <p>Selected Job ID: {selectedJobId}</p> {/* Debug display */}
        </div>
    );
};

export default App;
