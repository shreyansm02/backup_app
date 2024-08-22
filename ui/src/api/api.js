import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Change this if your backend URL is different

export const createUser = (userData) => {
    return axios.post(`${API_BASE_URL}/users/`, userData);
};

export const createConfiguration = (configData) => {
    return axios.post(`${API_BASE_URL}/configurations/`, configData);
};

export const createBackupJob = (backupJobData) => {
    return axios.post(`${API_BASE_URL}/backup_jobs/`, backupJobData);
};

export const getBackupStatus = (jobId) => {
    return axios.get(`${API_BASE_URL}/backup/${jobId}/status/`);
};

// export const getBackupJobs = () => {
//     return axios.get(`${API_BASE_URL}/backup_jobs/`);
// };

export const createRegularBackup = (backupData) => {
    return axios.post(`${API_BASE_URL}/backup/`, backupData);
};

// New API for NFS Backup
export const createNfsBackup = (backupData) => {
    return axios.post(`${API_BASE_URL}/backup/nfs/`, backupData);
};

