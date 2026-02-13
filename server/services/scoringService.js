const calculateScore = (data) => {
    const { user, repos, prCount, allRepos, pinnedRepos } = data; // pinnedRepos might be empty if no token

    // 6 Strict Dimensions
    let scores = {
        documentationQuality: 0,        // 20
        codeStructure: 0,               // 15
        activityConsistency: 0,         // 20
        repositoryOrganization: 0,      // 15
        projectImpact: 0,               // 15
        technicalDepth: 0               // 15
    };

    const strengths = [];
    const redFlags = [];
    const suggestions = []; // Objects: { message, repo }

    // Helper to generate repo insight
    const generateInsight = (repo) => {
        if (!repo.description) return "Missing description";
        if (repo.readmeContent && repo.readmeContent.length < 100) return "README too short";
        if (!repo.readmeContent) return "Missing README";
        if (repo.weeklyCommits) {
            const last13 = repo.weeklyCommits.slice(-13);
            const commits = last13.reduce((a, b) => a + b, 0);
            if (commits === 0) return "No commits in last 90 days";
        }
        return "Active repository";
    };

    // --- 1. Documentation Quality (20) ---
    // Criteria: README presence, length, sections (Install, Usage)
    let readmeScore = 0;

    // Analyze pinned first (higher weight) or top repos
    // We prioritize `pinnedRepos` if available, else `repos` (top 15)
    // For this implementation, we use `repos` (which are detailed) for strict file checks.

    let docsIssues = 0;
    if (repos) {
        repos.forEach(repo => {
            let score = 0;
            if (repo.readmeContent) {
                score += 2;
                const content = repo.readmeContent.toLowerCase();
                if (content.length > 300) score += 2;
                if (content.includes('installation') || content.includes('setup')) score += 3;
                if (content.includes('usage') || content.includes('getting started')) score += 3;
            } else {
                docsIssues++;
                suggestions.push({
                    message: `Add a README file to repository '${repo.name}' to explain what it does.`,
                    repo: repo.name
                });
            }

            // Actionable: Check strict sections
            if (repo.readmeContent) {
                const content = repo.readmeContent.toLowerCase();
                const missing = [];
                if (!content.includes('installation') && !content.includes('setup')) missing.push('Installation');
                if (!content.includes('usage') && !content.includes('getting started')) missing.push('Usage');

                if (missing.length > 0) {
                    suggestions.push({
                        message: `Add ${missing.join(' and ')} section(s) in README of repository '${repo.name}'.`,
                        repo: repo.name
                    });
                }
            }
            readmeScore += score; // Max 10 per repo? 
        });
    }

    // Normalize to 20
    scores.documentationQuality = Math.min(20, Math.round((readmeScore / ((repos && repos.length) || 1)) * 2)); // rough scaling

    if (scores.documentationQuality < 10 && repos) {
        const poorRepos = repos.filter(r => !r.readmeContent || r.readmeContent.length < 200).map(r => r.name);
        redFlags.push({
            message: "Low documentation quality across repositories.",
            affectedRepos: poorRepos
        });
    }

    // --- 2. Code Structure & Best Practices (15) ---
    let structureScore = 0;
    if (repos) {
        repos.forEach(repo => {
            const files = repo.files || [];
            const hasConfig = files.some(f => /package\.json|requirements\.txt|pom\.xml|build\.gradle|go\.mod|cargo\.toml|composer\.json|makefile/i.test(f));
            if (hasConfig) structureScore++;
            else {
                suggestions.push({
                    message: `Add a standard config file (package.json, requirements.txt, etc.) to '${repo.name}'.`,
                    repo: repo.name
                });
            }
        });
    }
    scores.codeStructure = Math.min(15, Math.round((structureScore / ((repos && repos.length) || 1)) * 15));

    // --- 3. Activity Consistency (20) ---
    let totalCommits = 0;
    let inactiveRepos = [];
    if (repos) {
        repos.forEach(repo => {
            if (repo.weeklyCommits) {
                const last13 = repo.weeklyCommits.slice(-13);
                const c = last13.reduce((a, b) => a + b, 0);
                totalCommits += c;
                if (c === 0) inactiveRepos.push(repo.name);
            }
        });
    }

    if (totalCommits > 50) scores.activityConsistency = 20;
    else scores.activityConsistency = Math.min(20, Math.round(totalCommits / 2.5));

    if (inactiveRepos.length > 0) {
        redFlags.push({
            message: "Repositories with no commits in last 90 days.",
            affectedRepos: inactiveRepos
        });
        // Suggestion for specific repo
        suggestions.push({
            message: `Resume activity on '${inactiveRepos[0]}' or consider archiving it.`,
            repo: inactiveRepos[0]
        });
    }

    // --- 4. Repository Organization (15) ---
    let orgScore = 0;
    let missingDesc = [];
    if (repos) {
        repos.forEach(repo => {
            if (repo.description) orgScore += 1;
            else {
                missingDesc.push(repo.name);
                suggestions.push({
                    message: `Add a short description to repository '${repo.name}'.`,
                    repo: repo.name
                });
            }

            if (repo.topics && repo.topics.length > 0) orgScore += 1;
            else {
                suggestions.push({
                    message: `Add topics (tags) to repository '${repo.name}' for better discoverability.`,
                    repo: repo.name
                });
            }
        });
    }

    // Normalize
    scores.repositoryOrganization = Math.min(15, Math.round((orgScore / (((repos && repos.length) || 1) * 2)) * 15));

    if (missingDesc.length > 0) {
        redFlags.push({
            message: "Repositories without description.",
            affectedRepos: missingDesc
        });
    }

    // --- 5. Project Impact & Real-World Relevance (15) ---
    const totalStars = allRepos ? allRepos.reduce((sum, r) => sum + r.stargazers_count, 0) : 0;
    const totalForks = allRepos ? allRepos.reduce((sum, r) => sum + r.forks_count, 0) : 0;

    let impactScore = 0;
    if (totalStars > 50) impactScore += 10; else impactScore += (totalStars / 5);
    if (totalForks > 10) impactScore += 5; else impactScore += (totalForks / 2);

    scores.projectImpact = Math.min(15, Math.round(impactScore));
    if (totalStars > 100) strengths.push({ message: "Strong project impact (High Stars)", affectedRepos: [] });

    // --- 6. Technical Depth (15) ---
    const langs = new Set();
    if (repos) {
        repos.forEach(r => {
            if (r.languages) Object.keys(r.languages).forEach(l => langs.add(l));
        });
    }
    scores.technicalDepth = Math.min(15, langs.size * 3);

    // --- Final Polish ---
    // Enforce 3 suggestions
    const uniqueSuggestions = [];
    const seen = new Set();
    suggestions.forEach(s => {
        // Safety check
        if (!s || !s.repo || !s.message) return;

        const key = s.message + s.repo;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueSuggestions.push(s);
        }
    });



    // Fallbacks
    if (uniqueSuggestions.length < 3) {
        if (repos && repos.length > 0) {
            uniqueSuggestions.push({
                message: `Consider adding a CI/CD pipeline (GitHub Actions) to '${repos[0].name}'.`,
                repo: repos[0].name
            });
            uniqueSuggestions.push({
                message: `Add a license file to '${repos[0].name}' if missing.`,
                repo: repos[0].name
            });
            uniqueSuggestions.push({
                message: `Create a comprehensive 'CONTRIBUTING.md' for '${repos[0].name}'.`,
                repo: repos[0].name
            });
        }
    }

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    const result = {
        totalScore: Math.round(totalScore),
        breakdown: scores,
        strengths,
        redFlags,
        actionableSuggestions: uniqueSuggestions.slice(0, 5), // Limit to top 5
        topRepositories: repos ? repos.slice(0, 5).map(r => ({
            name: r.name,
            description: r.description,
            stars: r.stargazers_count,
            primaryLanguage: r.language,
            insight: generateInsight(r)
        })) : [],
        pinnedRepositories: pinnedRepos ? pinnedRepos.map(r => ({
            name: r.name,
            description: r.description,
            stars: r.stars, // Pinned object structure
            primaryLanguage: r.language,
            insight: "Pinned Repository"
        })) : []
    };

    return result;
};

module.exports = { calculateScore };
