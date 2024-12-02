#!/bin/bash

# Exit script on errors
set -e

# Function to check outdated packages in a workspace
check_outdated() {
  local workspace_dir=$1

  echo "Checking outdated packages in $workspace_dir"
  
  # Navigate to the workspace directory
  cd "$workspace_dir"

  # Check outdated packages using bun
  if [ -f "package.json" ]; then
    bun outdated
    bun update
  else
    echo "No package.json found in $workspace_dir, skipping..."
  fi

  # Navigate back to the monorepo root
  cd - > /dev/null
}

# Locate the root of the monorepo
MONOREPO_ROOT=$(pwd)

# Detect workspaces defined in package.json or bun-workspace.json
WORKSPACES=$(node -e "
const fs = require('fs');
const path = './package.json';
const packageJson = fs.existsSync(path) ? require(path) : {};
const workspaces = packageJson.workspaces || [];
console.log(workspaces.join('\n'));
")

if [ -z "$WORKSPACES" ]; then
  echo "No workspaces detected. Ensure workspaces are defined in package.json or bun-workspace.json."
  exit 1
fi

# Loop through each workspace and check for outdated packages
for workspace in $WORKSPACES; do
  workspace_path="$MONOREPO_ROOT/$workspace"
  if [ -d "$workspace_path" ]; then
    check_outdated "$workspace_path"
  else
    echo "Workspace directory $workspace_path does not exist, skipping..."
  fi
done

echo "Finished checking outdated packages in all workspaces."
