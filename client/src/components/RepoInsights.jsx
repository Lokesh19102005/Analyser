function RepoInsights({ topRepos, pinnedRepos }) {
    return (
        <div className="card">
            {/* Pinned Repos Section */}
            {pinnedRepos && pinnedRepos.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3>Pinned Repositories</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pinnedRepos.map((repo) => (
                            <RepoItem key={repo.name} repo={repo} isPinned={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Top Repos Section */}
            <h3>Top Repositories Analyzed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topRepos && topRepos.length > 0 ? (
                    topRepos.map((repo) => (
                        <RepoItem key={repo.name} repo={repo} />
                    ))
                ) : (
                    <p style={{ color: '#8b949e' }}>No repositories analyzed.</p>
                )}
            </div>
        </div>
    );
}

function RepoItem({ repo, isPinned }) {
    return (
        <div style={{
            padding: '1rem',
            backgroundColor: '#0d1117',
            borderRadius: '6px',
            border: isPinned ? '1px solid #30363d' : '1px solid #21262d', // distinct border for pinned?
            boxShadow: isPinned ? '0 0 0 1px #30363d' : 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isPinned && <span title="Pinned">📌</span>}
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{repo.name}</h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>★ {repo.stars}</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#8b949e', margin: '0.5rem 0' }}>
                {repo.description || 'No description provided'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {repo.primaryLanguage ? (
                    <span style={{
                        fontSize: '0.8rem',
                        color: '#c9d1d9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: '#58a6ff',
                            display: 'inline-block'
                        }}></span>
                        {repo.primaryLanguage}
                    </span>
                ) : <span></span>}

                {repo.insight && (
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: repo.insight === 'Active repository' || repo.insight === 'Pinned Repository' ? 'rgba(56, 139, 253, 0.15)' : 'rgba(218, 54, 51, 0.15)',
                        color: repo.insight === 'Active repository' || repo.insight === 'Pinned Repository' ? '#58a6ff' : '#ff7b72'
                    }}>
                        {repo.insight}
                    </span>
                )}
            </div>
        </div>
    );
}

export default RepoInsights;
