# GitHub Portfolio Analyzer & Enhancer

A full-stack application that analyzes GitHub profiles using the GitHub REST API and provides a comprehensive portfolio score, breakdown, and actionable suggestions to improve your developer presence.

## Features

- **Portfolio Scoring (0-100)**: Based on recruiter-friendly metrics.
- **Detailed Breakdown**:
  - Documentation Quality
  - Code Structure & Best Practices
  - Activity Consistency
  - Repository Organization
  - Project Impact
  - Technical Depth
- **Actionable Insights**: Concrete suggestions to improve your score.
- **Repository Highlights**: Analysis of top projects.

## Tech Stack

- **Frontend**: React (Vite), Vanilla CSS
- **Backend**: Node.js, Express
- **API**: GitHub REST API

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- NPM

### Installation

1. **Clone the repository** (if not already local).

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create .env file based on .env.example
   # cp .env.example .env
   # Add your GITHUB_TOKEN in .env to avoid rate limits!
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Usage**
   - Open browser at `http://localhost:5173`
   - Enter a GitHub profile URL (e.g., `https://github.com/torvalds`)
   - Click "Analyze Profile"

## How Scoring Works

The scoring engine evaluates 6 dimensions:

1. **Documentation (20pts)**: Checks for README existence, length, and key sections (Installation, Usage).
2. **Code Structure (15pts)**: Checks for standard config files (`package.json`, `requirements.txt`).
3. **Activity (20pts)**: Analyzes commit frequency in the last 90 days.
4. **Organization (15pts)**: Checks for descriptions and topics.
5. **Impact (15pts)**: Based on stars, forks, and PR activity.
6. **Technical Depth (15pts)**: Diversity of languages (Backend/Frontend/Scripting).

## Demo Flow

1. Enter a valid GitHub URL.
2. The system fetches public data (profile, repos, activity).
3. A score is calculated instantly.
4. Review the "Red Flags" and "Suggestions" to improve your profile.
