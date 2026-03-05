#!/bin/bash

# Personal Website - Amplify Storage Setup Script
# This script sets up DynamoDB tables using Amplify CLI

set -e

echo "=========================================="
echo "Personal Website - DynamoDB Setup"
echo "=========================================="
echo ""

# Check if Amplify is initialized
if [ ! -d "amplify" ]; then
  echo "⚠️  Amplify not initialized. Please run 'amplify init' first."
  echo ""
  echo "To initialize Amplify, run:"
  echo "  amplify init"
  echo ""
  echo "Use these settings:"
  echo "  - Project name: personalwebsite"
  echo "  - Environment: dev"
  echo "  - Default editor: Visual Studio Code"
  echo "  - App type: javascript"
  echo "  - Framework: react"
  echo "  - Source directory: src"
  echo "  - Distribution directory: build"
  echo "  - Build command: npm run-script build"
  echo "  - Start command: npm run-script start"
  echo ""
  exit 1
fi

echo "✓ Amplify is initialized"
echo ""

# Add storage for Personal Info table
echo "Adding Personal Info DynamoDB table..."
echo ""
echo "When prompted, use these settings:"
echo "  - Select: NoSQL Database"
echo "  - Resource name: personalInfo"
echo "  - Table name: personalInfo"
echo "  - Partition key: id (String)"
echo "  - Sort key: No"
echo "  - Global secondary indexes: No"
echo "  - Lambda trigger: No"
echo ""

read -p "Press Enter to continue with Personal Info table setup..."

amplify add storage

echo ""
echo "✓ Personal Info table configured"
echo ""

# Add storage for Cities table
echo "Adding Cities DynamoDB table..."
echo ""
echo "When prompted, use these settings:"
echo "  - Select: NoSQL Database"
echo "  - Resource name: cities"
echo "  - Table name: cities"
echo "  - Partition key: id (String)"
echo "  - Sort key: No"
echo "  - Add global secondary indexes: Yes"
echo "    - GSI name: country-index"
echo "    - Partition key: country (String)"
echo "    - Sort key: updatedAt (String)"
echo "  - Lambda trigger: No"
echo ""

read -p "Press Enter to continue with Cities table setup..."

amplify add storage

echo ""
echo "✓ Cities table configured"
echo ""

# Show status
echo "Checking Amplify status..."
amplify status

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Review the configuration with: amplify status"
echo "  2. Deploy to AWS with: amplify push"
echo "  3. After deployment, configure encryption and point-in-time recovery in AWS Console"
echo ""
echo "Note: The actual table names will be prefixed with environment and app name."
echo "      Example: personalwebsite-dev-personalInfo-xxxxx"
echo ""
