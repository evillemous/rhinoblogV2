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

# Initialize Git repository if needed
if [ ! -d ".git" ]; then
  git init
  echo "Git repository initialized."
fi

# Check if the remote origin exists, if not, add it
if ! git remote | grep -q "origin"; then
  git remote add origin "https://$GITHUB_TOKEN@github.com/evillemous/rhinoblogV2.git"
  echo "Remote origin added."
else
  git remote set-url origin "https://$GITHUB_TOKEN@github.com/evillemous/rhinoblogV2.git"
  echo "Remote origin updated."
fi

# Add all files
git add .

# Commit changes
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Update: RBAC implementation - $TIMESTAMP"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Code pushed to GitHub successfully!"