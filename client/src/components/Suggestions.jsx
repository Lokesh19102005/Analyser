function Suggestions({ strengths, redFlags, suggestions }) {
    return (
        <div className="card">
            <h3>Analysis Report</h3>

            {/* Strengths */}
            {strengths.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4>Strengths</h4>
                    <div>
                        {strengths.map((s, idx) => (
                            <span key={idx} className="badge badge-success">
                                {typeof s === 'string' ? s : s.message}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Red Flags */}
            {redFlags.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4>Red Flags</h4>
                    <ul className="suggestions-list" style={{ listStyle: 'none', padding: 0 }}>
                        {redFlags.map((flag, idx) => (
                            <li key={idx} style={{ marginBottom: '1rem', borderLeft: '3px solid #da3633', paddingLeft: '1rem', backgroundColor: 'rgba(218, 54, 51, 0.05)', padding: '0.5rem 1rem' }}>
                                <div style={{ color: '#f85149', fontWeight: 'bold' }}>{flag.message}</div>
                                {flag.affectedRepos && flag.affectedRepos.length > 0 && (
                                    <div style={{ fontSize: '0.9rem', color: '#8b949e', marginTop: '0.25rem' }}>
                                        Affected: {flag.affectedRepos.join(', ')}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actionable Suggestions */}
            {suggestions.length > 0 && (
                <div>
                    <h4>Actionable Suggestions ({suggestions.length})</h4>
                    <ul className="suggestions-list">
                        {suggestions.map((s, idx) => (
                            <li key={idx}>
                                <span style={{ fontWeight: '600', color: '#58a6ff' }}>[{s.repo}]</span> {s.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Suggestions;
