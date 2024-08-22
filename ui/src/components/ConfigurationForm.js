import React, { useState } from 'react';
import { createConfiguration } from '../api/api';

const ConfigurationForm = () => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createConfiguration({ key, value });
            console.log('Configuration created:', response.data);
        } catch (error) {
            console.error('Error creating configuration:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Key</label>
                <input type="text" className="form-control" value={key} onChange={(e) => setKey(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Value</label>
                <input type="text" className="form-control" value={value} onChange={(e) => setValue(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Create Configuration</button>
        </form>
    );
};

export default ConfigurationForm;
