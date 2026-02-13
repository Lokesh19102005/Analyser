function ScoreCard({ totalScore, breakdown, user }) {

    const getScoreColor = (score) => {
        if (score >= 80) return '#3fb950'; // Green
        if (score >= 50) return '#d29922'; // Orange
        return '#f85149'; // Red
    };

    // Mapping for display labels if keys differ, or just use keys directly if they match
    // Brief Keys: 
    // documentationQuality -> Documentation Quality
    // codeStructure -> Code Structure & Best Practices
    // activityConsistency -> Activity Consistency
    // repositoryOrganization -> Repository Organization
    // projectImpact -> Project Impact & Real-World Relevance
    // technicalDepth -> Technical Depth

    const labels = {
        documentationQuality: "Documentation Quality",
        codeStructure: "Code Structure & Best Practices",
        activityConsistency: "Activity Consistency",
        repositoryOrganization: "Repository Organization",
        projectImpact: "Project Impact & Real-World Relevance",
        technicalDepth: "Technical Depth"
    };

    const maxScores = {
        documentationQuality: 20,
        codeStructure: 15,
        activityConsistency: 20,
        repositoryOrganization: 15,
        projectImpact: 15,
        technicalDepth: 15
    };

    return (
        <div className="card score-display">
            {user && (
                <div style={{ marginBottom: '1rem' }}>
                    <img
                        src={user.avatar_url}
                        alt={user.login}
                        style={{ width: '64px', height: '64px', borderRadius: '50%' }}
                    />
                    <h2>{user.name || user.login}</h2>
                </div>
            )}

            <div className="total-score" style={{ color: getScoreColor(totalScore) }}>
                {totalScore}
            </div>
            <div className="score-label">Overall Portfolio Score</div>

            <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                <div className="grid">
                    {Object.entries(breakdown).map(([key, value]) => (
                        <div key={key} className="score-item">
                            <div className="metric-item">
                                <span>{labels[key] || key}</span>
                                <span>{Math.round(value)} / {maxScores[key]}</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${(value / maxScores[key]) * 100}%`,
                                        backgroundColor: getScoreColor((value / maxScores[key]) * 100)
                                    }}
                                ></div>
                            </div>
                            {key === 'documentationQuality' && (
                                <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '0.25rem' }}>
                                    Documentation score is based on presence and structure of README sections such as Installation, Usage and Features.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ScoreCard;
