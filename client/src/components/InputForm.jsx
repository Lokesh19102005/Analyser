import { useState } from 'react';

function InputForm({ onAnalyze, loading }) {
    const [url, setUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim()) {
            onAnalyze(url);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="input-group">
                <input
                    type="text"
                    placeholder="https://github.com/username"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    disabled={loading}
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze Profile'}
                </button>
            </div>
        </form>
    );
}

export default InputForm;
