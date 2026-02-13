const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const scoringService = require('../services/scoringService');

router.post('/analyze', async (req, res) => {
    try {
        const { profileUrl } = req.body;

        if (!profileUrl) {
            return res.status(400).json({ error: 'Profile URL is required' });
        }

        // Extract username from URL
        // Supports formats: https://github.com/username, github.com/username, username
        let username = profileUrl.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\/$/, '');

        // Removing any query parameters or hash
        username = username.split('?')[0].split('#')[0];

        if (!username) {
            return res.status(400).json({ error: 'Invalid GitHub profile URL' });
        }

        console.log(`Analyzing profile: ${username}`);

        // Fetch GitHub Data
        const githubData = await githubService.fetchProfileData(username);

        // Calculate Score
        const analysisResult = scoringService.calculateScore(githubData);

        res.json(analysisResult);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
