#!/bin/bash

# Script to push code to GitHub
# Make sure to set GITHUB_TOKEN as an environment variable

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set."
  echo "Please set it before running this script."
  exit 1
fi

# Repository URL
REPO_URL="https://github.com/evillemous/rhinoblogV2.git"

# Configure Git
git config --global user.name "Replit AI Agent"
git config --global user.email "no-reply@replit.com"
git config --global credential.helper store

# Initialize Git repository if needed
if [ ! -d ".git" ]; then
  git init
  echo "Git repository initialized."
fi

# Check if the remote origin exists, if not, add it
if ! git remote | grep -q "origin"; then
  git remote add origin "https://x-access-token:$GITHUB_TOKEN@github.com/evillemous/rhinoblogV2.git"
  echo "Remote origin added."
else
  git remote set-url origin "https://x-access-token:$GITHUB_TOKEN@github.com/evillemous/rhinoblogV2.git"
  echo "Remote origin updated."
fi

# Create a README file if it doesn't exist
if [ ! -f "README.md" ]; then
  echo "# RhinoplastyBlogs.com" > README.md
  echo "" >> README.md
  echo "A comprehensive AI-powered platform for rhinoplasty information sharing, leveraging advanced technologies to provide intelligent, user-friendly medical content discovery and exploration." >> README.md
  echo "" >> README.md
  echo "## Key Features" >> README.md
  echo "- Reddit-style community posts for sharing personal rhinoplasty experiences" >> README.md
  echo "- Educational articles written from professional medical perspective" >> README.md
  echo "- Role-based access control system (Superadmin, Admin, Contributor, User, Guest)" >> README.md
  echo "- AI-generated content via OpenAI integration" >> README.md
  echo "- Tagging and topic-based content organization" >> README.md
  echo "" >> README.md
  echo "## Technology Stack" >> README.md
  echo "- TypeScript (full-stack)" >> README.md
  echo "- React with Vite" >> README.md
  echo "- Node.js Express backend" >> README.md
  echo "- OpenAI for content generation" >> README.md
  echo "- Unsplash API for imagery" >> README.md
  echo "" >> README.md
  echo "Last updated: $TIMESTAMP" >> README.md
fi

# Add all files
git add .

# Commit changes
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Update: RBAC implementation - $TIMESTAMP"

# Get current branch name
current_branch=$(git branch --show-current || echo "main")

# If current branch is empty, default to main
if [ -z "$current_branch" ]; then
  current_branch="main"
fi

echo "Pushing to GitHub (using $current_branch branch)..."
git push -u origin $current_branch || {
  echo "Failed with $current_branch, trying with 'main' branch..."
  git push -u origin main || {
    echo "Failed with main, trying with 'master' branch..."
    git push -u origin master
  }
}

echo "Code pushed to GitHub successfully!"