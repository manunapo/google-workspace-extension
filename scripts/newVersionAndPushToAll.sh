#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${YELLOW}Usage: $0 [major|minor|patch]${NC}"
    echo "  major: 1.0.0 -> 2.0.0"
    echo "  minor: 1.0.0 -> 1.1.0"
    echo "  patch: 1.0.0 -> 1.0.1"
    echo "  (no argument): Deploy without version bump"
    exit 1
}

# Check if too many arguments are provided
if [ $# -gt 1 ]; then
    echo -e "${RED}Error: Too many arguments${NC}"
    usage
fi

BUMP_TYPE=$1

# If no argument provided, skip version bump
if [ -z "$BUMP_TYPE" ]; then
    echo -e "${BLUE}No version bump requested. Will deploy current version to all configurations.${NC}"
    CURRENT_VERSION=$(grep "export const VERSION" src/constants.ts | sed "s/.*'\(.*\)'.*/\1/")
    echo -e "${BLUE}Current version: $CURRENT_VERSION${NC}"
    
    # Ask for confirmation
    echo -e "${YELLOW}Do you want to proceed and push to all configurations? (y/N)${NC}"
    read -r confirmation
    
    if [[ "$confirmation" != "y" && "$confirmation" != "Y" ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 0
    fi
else
    # Validate bump type
    if [[ "$BUMP_TYPE" != "major" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "patch" ]]; then
        echo -e "${RED}Error: Invalid bump type. Use major, minor, or patch${NC}"
        usage
    fi

    # Get current version from constants.ts
    CURRENT_VERSION=$(grep "export const VERSION" src/constants.ts | sed "s/.*'\(.*\)'.*/\1/")
    echo -e "${BLUE}Current version: $CURRENT_VERSION${NC}"

    # Parse version numbers
    IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

    # Bump version based on type
    case $BUMP_TYPE in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
    esac

    NEW_VERSION="$major.$minor.$patch"
    echo -e "${GREEN}New $BUMP_TYPE version: $NEW_VERSION${NC}"

    # Ask for confirmation
    echo -e "${YELLOW}Do you want to proceed with version $NEW_VERSION and push to all configurations? (y/N)${NC}"
    read -r confirmation

    if [[ "$confirmation" != "y" && "$confirmation" != "Y" ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 0
    fi

    echo -e "${BLUE}Updating version files...${NC}"

    # Update version in constants.ts
    sed -i.bak "s/export const VERSION = '.*';/export const VERSION = '$NEW_VERSION';/" src/constants.ts
    rm src/constants.ts.bak

    # Update version in package.json
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
    rm package.json.bak

    echo -e "${GREEN}Version updated to $NEW_VERSION${NC}"
fi

# Function to deploy to a specific clasp configuration
deploy_to_config() {
    local config_name=$1
    local config_file=$2
    
    echo -e "${BLUE}Deploying to $config_name...${NC}"
    
    # Backup current .clasp.json
    if [ -f .clasp.json ]; then
        cp .clasp.json .clasp.json.backup
    fi
    
    # Copy the specific config to .clasp.json
    cp "$config_file" .clasp.json
    
    # Deploy
    yarn run deploy
    
    echo -e "${GREEN}Successfully deployed to $config_name${NC}"
}

# Deploy to all configurations
echo -e "${BLUE}Starting deployment to all configurations...${NC}"

deploy_to_config "docs" ".clasp-docs.json"
deploy_to_config "sheets" ".clasp-sheets.json" 
deploy_to_config "slides" ".clasp-slides.json"

# Restore the original .clasp.json (slides config)
if [ -f .clasp.json.backup ]; then
    mv .clasp.json.backup .clasp.json
else
    cp .clasp-slides.json .clasp.json
fi

echo -e "${GREEN}🎉 All deployments completed successfully!${NC}"
if [ -n "$BUMP_TYPE" ]; then
    echo -e "${GREEN}Version $NEW_VERSION has been deployed to:${NC}"
else
    echo -e "${GREEN}Version $CURRENT_VERSION has been deployed to:${NC}"
fi
echo -e "  📄 Docs"
echo -e "  📊 Sheets" 
echo -e "  🖼️  Slides"
