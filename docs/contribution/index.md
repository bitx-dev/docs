# Fork-Based Workflow Guide

## Overview

We've implemented a fork-based workflow for our repository to improve code quality and security. This means:

- You'll work on your **personal fork** of the repository
- The main repository's `main` branch is **protected**
- All changes must go through **Pull Requests (PRs)**
- Direct pushes to the main branch are no longer allowed

## Initial Setup (One-Time)

### 1. Fork the Repository

1. Go to the main repository: `https://github.com/[ORGANIZATION]/[REPO-NAME]`
2. Click the **"Fork"** button in the top-right corner
3. This creates a copy under your personal GitHub account

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/[REPO-NAME].git
cd [REPO-NAME]
```

### 3. Add Upstream Remote

This keeps your fork connected to the main repository:

```bash
git remote add upstream https://github.com/[ORGANIZATION]/[REPO-NAME].git
```

Verify your remotes:

```bash
git remote -v
```

You should see:
- `origin` - your fork (where you push)
- `upstream` - main repository (where you pull updates)

## Daily Workflow

### Starting New Work

#### 1. Sync Your Fork with Latest Changes

```bash
# Fetch latest changes from main repository
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push updates to your fork
git push origin main
```

#### 2. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - new features
- `fix/` - bug fixes
- `docs/` - documentation updates
- `refactor/` - code refactoring

#### 3. Make Your Changes

```bash
# Make your code changes
# Then stage your changes
git add .

# Or add specific files
git add path/to/file

# Commit with a descriptive message
git commit -m "Add feature: description of what you did"
```

**Commit message tips:**
- Use clear, descriptive messages
- Start with a verb (Add, Fix, Update, Remove)
- Keep it concise but informative

#### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

#### 5. Create a Pull Request

1. Go to the main repository on GitHub
2. You'll see a prompt: **"Compare & pull request"** - click it
3. Fill in the PR template:
   - **Title**: Clear summary of your changes
   - **Description**: Explain what and why
   - Link any related issues
4. Click **"Create pull request"**

#### 6. Address Review Feedback

If reviewers request changes:

```bash
# Make the requested changes
git add .
git commit -m "Address review feedback: description"
git push origin feature/your-feature-name
```

The PR will automatically update with your new commits.

### After PR is Merged

```bash
# Switch back to main
git checkout main

# Pull the latest changes (including your merged PR)
git fetch upstream
git merge upstream/main

# Push to your fork
git push origin main

# Delete the feature branch locally
git branch -d feature/your-feature-name

# Delete the feature branch from your fork
git push origin --delete feature/your-feature-name
```

## Common Scenarios

### Your Branch is Behind Main

If your feature branch is behind the main branch:

```bash
# Switch to your feature branch
git checkout feature/your-feature-name

# Fetch latest changes
git fetch upstream

# Rebase on top of main
git rebase upstream/main

# If there are conflicts, resolve them, then:
git add .
git rebase --continue

# Force push to your fork (only for your feature branches!)
git push origin feature/your-feature-name --force
```

### You Made Changes Directly on Main (By Mistake)

```bash
# Create a new branch with your changes
git checkout -b feature/accidental-changes

# Push to your fork
git push origin feature/accidental-changes

# Reset your main to match upstream
git checkout main
git reset --hard upstream/main
git push origin main --force

# Now create a PR from the feature branch
```

## Best Practices

### Do's ✅

- Always work on feature branches, never on `main`
- Keep commits atomic (one logical change per commit)
- Write clear commit messages
- Sync your fork regularly
- Pull latest changes before starting new work
- Ask for help if you're unsure about git commands

### Don'ts ❌

- Don't force push to `main`
- Don't commit directly to `main`
- Don't work on multiple unrelated features in one branch
- Don't use `git push --force` on branches others are using
- Don't forget to sync before starting new work

## Troubleshooting

### "Permission denied" when pushing

You're trying to push to the main repository. Make sure you're pushing to `origin` (your fork), not `upstream`.

### Merge conflicts

```bash
# Fetch latest changes
git fetch upstream

# Try to merge
git merge upstream/main

# If conflicts occur, git will tell you which files
# Open the files and resolve conflicts manually
# Look for markers: <<<<<<<, =======, >>>>>>>

# After resolving:
git add .
git commit -m "Resolve merge conflicts"
```

### Lost or confused about branches

```bash
# See all branches
git branch -a

# See current branch
git branch

# Switch to a different branch
git checkout branch-name
```

## Quick Reference Commands

```bash
# Sync fork with upstream
git fetch upstream && git checkout main && git merge upstream/main && git push origin main

# Create new feature branch
git checkout -b feature/name

# Stage and commit changes
git add . && git commit -m "Your message"

# Push to your fork
git push origin branch-name

# Update feature branch with latest main
git checkout feature/name && git rebase upstream/main
```

## Getting Help

- If you're stuck with git, ask in the team chat
- For PR reviews, tag the relevant team members
- Check GitHub's documentation: https://docs.github.com

## Resources

- [GitHub Fork Documentation](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [About Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Questions?** Reach out to [Your Name/Team Lead] or ask in [Team Channel]