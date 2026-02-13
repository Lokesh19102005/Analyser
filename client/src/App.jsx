import { useState } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import ScoreCard from './components/ScoreCard';
import RepoInsights from './components/RepoInsights';
import Suggestions from './components/Suggestions';
import './App.css'

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (profileUrl) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post('http://localhost:5001/api/analyze', { profileUrl });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze profile. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>GitHub Portfolio Analyzer</h1>
        <p>Get a recruiter-ready assessment of your GitHub profile.</p>
      </header>

      <InputForm onAnalyze={handleAnalyze} loading={loading} />

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger-color)' }}>
          <p style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</p>
        </div>
      )}

      {loading && <div className="loading-spinner"></div>}

      {data && (
        <>
          <ScoreCard
            totalScore={data.totalScore}
            breakdown={data.breakdown}
            user={data.user}
          />

          <div className="grid">
            <Suggestions
              strengths={data.strengths}
              redFlags={data.redFlags}
              suggestions={data.actionableSuggestions}
            />
            <RepoInsights
              topRepos={data.topRepositories || []}
              pinnedRepos={data.pinnedRepositories || []}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
