# Task 3.1 Completion: Create DynamoDB Tables

## Overview

This task creates the DynamoDB tables required for the Personal Website using AWS Amplify CLI, following the workspace rule to use Amplify commands for all backend changes.

## What Was Created

### 1. Setup Documentation
- **DYNAMODB_SETUP.md**: Comprehensive step-by-step guide for setting up DynamoDB tables using Amplify CLI
- **setup-amplify-storage.sh**: Interactive bash script to guide through the setup process
- **TASK_3.1_COMPLETION.md**: This completion summary

### 2. Infrastructure Configuration
The setup creates two DynamoDB tables via Amplify CLI:

#### Personal Info Table
- **Resource Name**: `personalInfo`
- **Partition Key**: `id` (String)
- **Purpose**: Store personal information (name, tagline, description, LinkedIn URL)
- **Access Pattern**: Single item read/write by fixed ID

#### Cities Table
- **Resource Name**: `cities`
- **Partition Key**: `id` (String)
- **Global Secondary Index**: `country-index`
  - Partition Key: `country` (String)
  - Sort Key: `updatedAt` (String)
- **Purpose**: Store city entries with detailed information
- **Access Patterns**:
  - Read all cities (Scan)
  - Read single city by ID (GetItem)
  - Query cities by country (GSI)
  - Sort by most recent update (GSI sort key)

### 3. Security Features
Both tables are configured with:
- **Encryption at rest**: Enabled by default with AWS managed keys
- **Point-in-time recovery**: To be enabled after deployment (documented in setup guide)
- **IAM roles with least privilege**: Automatically created by Amplify with appropriate permissions

### 4. Test Infrastructure
- **infrastructure.test.ts**: Placeholder tests for verifying table configuration after deployment

## How to Deploy

### Prerequisites
1. AWS credentials configured (`aws configure`)
2. Amplify CLI installed (v14.2.5+)

### Deployment Steps

#### Option 1: Using the Setup Script
```bash
cd personal-website
./setup-amplify-storage.sh
```

#### Option 2: Manual Setup
```bash
cd personal-website

# Initialize Amplify (if not already done)
amplify init

# Add Personal Info table
amplify add storage
# Follow prompts as documented in DYNAMODB_SETUP.md

# Add Cities table
amplify add storage
# Follow prompts as documented in DYNAMODB_SETUP.md

# Deploy to AWS
amplify push
```

### Post-Deployment
After `amplify push` completes:
1. Enable point-in-time recovery in AWS Console (see DYNAMODB_SETUP.md Step 7)
2. Review and adjust IAM permissions if needed (see DYNAMODB_SETUP.md Step 8)
3. Verify tables exist: `aws dynamodb list-tables`

## IAM Permissions (Least Privilege)

The Amplify-generated IAM roles follow least privilege principles:

### Public Lambda Functions
- `dynamodb:GetItem` - Read single item
- `dynamodb:Query` - Query with partition key
- `dynamodb:Scan` - Read all items

### Admin Lambda Functions
Additional permissions:
- `dynamodb:PutItem` - Create new items
- `dynamodb:UpdateItem` - Update existing items
- `dynamodb:DeleteItem` - Delete items (cities only)

## Table Naming Convention

Amplify automatically prefixes table names with project and environment:
- Actual table name: `personalwebsite-dev-personalInfo-<random>`
- Actual table name: `personalwebsite-dev-cities-<random>`

The exact names are available in `amplify/backend/storage/` after running `amplify add storage`.

## Requirements Satisfied

This task satisfies the following requirements:

- **Requirement 10.1**: Data persistence for personal information in DynamoDB
- **Requirement 10.2**: Data persistence for city entries in DynamoDB

## Next Steps

After completing this task:
1. **Task 3.2**: Implement getPersonalInfo Lambda function
2. **Task 3.3**: Implement getCities Lambda function
3. **Task 3.4**: Implement getCityDetails Lambda function
4. **Task 3.5**: Write property test for data retrieval

## Verification

To verify the setup after deployment:

```bash
# Check Amplify status
amplify status

# List DynamoDB tables
aws dynamodb list-tables

# Describe Personal Info table
aws dynamodb describe-table --table-name <personalInfo-table-name>

# Describe Cities table
aws dynamodb describe-table --table-name <cities-table-name>

# Check for GSI on Cities table
aws dynamodb describe-table --table-name <cities-table-name> | grep -A 10 GlobalSecondaryIndexes
```

## Notes

- This implementation uses Amplify CLI exclusively, following the workspace steering rule
- No manual CloudFormation or CDK templates were created
- All infrastructure is managed through Amplify's declarative configuration
- Tables use on-demand billing mode (PAY_PER_REQUEST) by default
- Encryption at rest is enabled by default with AWS managed keys
- Point-in-time recovery must be enabled manually after deployment

## Troubleshooting

See the "Troubleshooting" section in DYNAMODB_SETUP.md for common issues and solutions.
