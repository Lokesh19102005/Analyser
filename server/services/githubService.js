const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

const getHeaders = () => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
};

// Define fetchPinnedRepos first so it can be used
const fetchPinnedRepos = async (username, token) => {
    if (!token) return [];
    try {
        const query = `
            query {
                user(login: "${username}") {
                    pinnedItems(first: 6, types: REPOSITORY) {
                        nodes {
                            ... on Repository {
                                name
                                description
                                stargazers {
                                    totalCount
                                }
                                primaryLanguage {
                                    name
                                    color
                                }
                                languages(first: 5) {
                                    nodes {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;
        const response = await axios.post(
            'https://api.github.com/graphql',
            { query },
            { headers: { Authorization: `bearer ${token}` } }
        );

        return response.data?.data?.user?.pinnedItems?.nodes.map(repo => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers.totalCount,
            language: repo.primaryLanguage?.name,
            languages: repo.languages?.nodes?.reduce((acc, lang) => ({ ...acc, [lang.name]: 1 }), {}),
            isPinned: true
        })) || [];
    } catch (e) {
        // console.error("Error fetching pinned repos", e.message);
        return [];
    }
};

const fetchProfileData = async (username) => {
    try {
        const headers = getHeaders();

        // 1. Fetch User Profile
        const userRes = await axios.get(`${GITHUB_API_BASE}/users/${username}`, { headers });
        const user = userRes.data;

        // 2. Fetch Repositories
        const reposRes = await axios.get(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated&type=owner`, { headers });
        const repos = reposRes.data;

        // 3. Detailed analysis for top repositories
        const targetRepos = repos.filter(r => !r.fork).slice(0, 15);

        // Fetch Pinned Repos concurrently
        const token = process.env.GITHUB_TOKEN;
        const pinnedReposPromise = fetchPinnedRepos(username, token);

        const repoDetailsPromise = Promise.all(targetRepos.map(async (repo) => {
            try {
                // Fetch README
                let readme = null;
                try {
                    const readmeRes = await axios.get(`${GITHUB_API_BASE}/repos/${username}/${repo.name}/readme`, { headers });
                    if (readmeRes.data.content) {
                        readme = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
                    }
                } catch (e) { }

                // Fetch Commit Activity
                let commitActivity = [];
                try {
                    const statsRes = await axios.get(`${GITHUB_API_BASE}/repos/${username}/${repo.name}/stats/participation`, { headers });
                    if (statsRes.data && statsRes.data.owner) {
                        commitActivity = statsRes.data.owner;
                    }
                } catch (e) { }

                // Fetch Languages
                let languages = {};
                try {
                    const langRes = await axios.get(repo.languages_url, { headers });
                    languages = langRes.data;
                } catch (e) { }

                // Basic contents check
                let fileStructure = [];
                try {
                    const contentsRes = await axios.get(`${GITHUB_API_BASE}/repos/${username}/${repo.name}/contents`, { headers });
                    fileStructure = contentsRes.data.map(f => f.name);
                } catch (e) { }

                return {
                    ...repo,
                    readmeContent: readme,
                    weeklyCommits: commitActivity,
                    languages: languages,
                    files: fileStructure
                };
            } catch (err) {
                console.error(`Error processing repo ${repo.name}:`, err.message);
                return repo;
            }
        }));

        const [pinnedRepos, repoDetails] = await Promise.all([pinnedReposPromise, repoDetailsPromise]);

        // Global stats
        let prCount = 0;
        try {
            const searchRes = await axios.get(`${GITHUB_API_BASE}/search/issues?q=type:pr+author:${username}`, { headers });
            prCount = searchRes.data.total_count;
        } catch (e) { console.error("Error fetching PR count", e.message); }

        return {
            user,
            repos: repoDetails,
            totalRepos: repos.length,
            prCount: prCount,
            allRepos: repos,
            pinnedRepos: pinnedRepos
        };

    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                throw new Error('User not found on GitHub.');
            }
            if (error.response.status === 403 || error.response.status === 429) {
                throw new Error('GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your server .env file.');
            }
        }
        throw new Error(error.message || 'Failed to fetch GitHub data');
    }
};

module.exports = {
    fetchProfileData,
    fetchPinnedRepos
};
