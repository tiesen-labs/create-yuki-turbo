#!/bin/bash

# Base directories
BASE_DIRS=("apps" "packages" "tooling")

# Iterate over each base directory
for BASE_DIR in "${BASE_DIRS[@]}"; do
  # Find all package.json files within the base directory
  find "$BASE_DIR" -name "package.json" | while read -r PACKAGE_JSON; do
    # Get the directory of the package.json file
    PACKAGE_DIR=$(dirname "$PACKAGE_JSON")

    # Check if the package is in the packages/ui directory
    if [[ "$PACKAGE_DIR" == *"packages/ui"* ]]; then
      echo "Updating $PACKAGE_DIR with bun update --latest"
      (cd "$PACKAGE_DIR" && bun update --latest)
    else
      echo "Updating $PACKAGE_DIR with bun update"
      (cd "$PACKAGE_DIR" && bun update)
    fi
  done
done
