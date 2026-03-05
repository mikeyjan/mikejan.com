# DynamoDB Tables Setup Guide

This guide walks through setting up the DynamoDB tables for the Personal Website using AWS Amplify CLI.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured with credentials
3. Amplify CLI installed (version 14.2.5 or later)

## Step 1: Configure AWS Credentials

If not already configured, set up your AWS credentials:

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

## Step 2: Initialize Amplify

From the `personal-website` directory, initialize Amplify:

```bash
amplify init
```

Configuration:
- Project name: `personalwebsite`
- Environment: `dev`
- Default editor: `Visual Studio Code`
- App type: `javascript`
- Framework: `react`
- Source directory: `src`
- Distribution directory: `build`
- Build command: `npm run-script build`
- Start command: `npm run-script start`
- AWS Profile: Use your configured profile

## Step 3: Add Personal Info Table

Add the first DynamoDB table for personal information:

```bash
amplify add storage
```

Configuration:
1. Select: `NoSQL Database`
2. Provide a friendly name: `personalInfo`
3. Provide table name: `personalInfo`
4. Partition key name: `id`
5. Partition key type: `string`
6. Add a sort key? `No`
7. Add global secondary indexes? `No`
8. Add a Lambda Trigger? `No`

## Step 4: Add Cities Table

Add the second DynamoDB table for cities:

```bash
amplify add storage
```

Configuration:
1. Select: `NoSQL Database`
2. Provide a friendly name: `cities`
3. Provide table name: `cities`
4. Partition key name: `id`
5. Partition key type: `string`
6. Add a sort key? `No`
7. Add global secondary indexes? `Yes`
   - GSI name: `country-index`
   - Partition key name: `country`
   - Partition key type: `string`
   - Sort key name: `updatedAt`
   - Sort key type: `string`
   - Add more GSI? `No`
8. Add a Lambda Trigger? `No`

## Step 5: Review Configuration

Check the Amplify status to verify both tables are configured:

```bash
amplify status
```

You should see two storage resources:
- `personalInfo` (NoSQL Database)
- `cities` (NoSQL Database)

## Step 6: Deploy to AWS

Push the configuration to AWS to create the DynamoDB tables:

```bash
amplify push
```

Review the changes and confirm. This will:
- Create both DynamoDB tables in your AWS account
- Set up IAM roles with appropriate permissions
- Generate configuration files for your React app

## Step 7: Enable Security Features

After deployment, enable additional security features in the AWS Console:

### Enable Encryption at Rest

1. Go to AWS Console → DynamoDB → Tables
2. For each table (`personalwebsite-dev-personalInfo-xxxxx` and `personalwebsite-dev-cities-xxxxx`):
   - Click on the table
   - Go to "Additional settings" tab
   - Under "Encryption at rest", ensure it's enabled (should be by default)
   - Optionally switch to AWS managed CMK or customer managed CMK

### Enable Point-in-Time Recovery

1. For each table:
   - Go to "Backups" tab
   - Click "Edit" under "Point-in-time recovery"
   - Enable point-in-time recovery
   - Save changes

## Step 8: Configure IAM Permissions (Least Privilege)

Amplify automatically creates IAM roles, but you should review and restrict them:

1. Go to AWS Console → IAM → Roles
2. Find the Lambda execution role created by Amplify (e.g., `amplify-personalwebsite-dev-xxxxx-authRole`)
3. Review the DynamoDB permissions policy
4. Ensure it follows least privilege:
   - Public Lambda functions: Only `GetItem`, `Query`, `Scan` on tables
   - Admin Lambda functions: Add `PutItem`, `UpdateItem`, `DeleteItem` only for admin functions

## Verification

After setup, verify the tables exist:

```bash
aws dynamodb list-tables
```

You should see:
- `personalwebsite-dev-personalInfo-xxxxx`
- `personalwebsite-dev-cities-xxxxx`

Check table details:

```bash
aws dynamodb describe-table --table-name personalwebsite-dev-personalInfo-xxxxx
aws dynamodb describe-table --table-name personalwebsite-dev-cities-xxxxx
```

## Table Schema Reference

### Personal Info Table
- **Table Name**: `personalInfo` (prefixed by Amplify)
- **Partition Key**: `id` (String)
- **Attributes**:
  - id: String (PK) - Fixed value "personal-info"
  - name: String
  - tagline: String
  - description: String
  - linkedInUrl: String
  - updatedAt: String (ISO 8601)

### Cities Table
- **Table Name**: `cities` (prefixed by Amplify)
- **Partition Key**: `id` (String)
- **Global Secondary Index**: `country-index`
  - Partition Key: `country` (String)
  - Sort Key: `updatedAt` (String)
- **Attributes**:
  - id: String (PK) - UUID
  - name: String
  - country: String
  - latitude: Number
  - longitude: Number
  - googleMapLink: String
  - datesVisited: List<String>
  - beforeYouGo: String
  - overview: String
  - places: Map
    - bars: List<Map { title: String, link: String (optional), notes: String (optional) }>
    - restaurants: List<Map { title: String, link: String (optional), notes: String (optional) }>
    - pointsOfInterest: List<Map { title: String, link: String (optional), notes: String (optional) }>
    - gyms: List<Map { title: String, link: String (optional), notes: String (optional) }>
    - accommodations: List<Map { title: String, link: String (optional), notes: String (optional) }>
  - createdAt: String (ISO 8601)
  - updatedAt: String (ISO 8601)

## Troubleshooting

### "Failed to get profile credentials"
- Run `aws configure` to set up your AWS credentials
- Ensure your IAM user has permissions to create DynamoDB tables

### "Table already exists"
- Check if tables were created in a previous run
- Use `amplify remove storage` to remove existing storage resources
- Or use different table names

### "Insufficient permissions"
- Ensure your IAM user has these permissions:
  - `dynamodb:CreateTable`
  - `dynamodb:DescribeTable`
  - `iam:CreateRole`
  - `iam:PutRolePolicy`

## Next Steps

After completing this setup:
1. Implement Lambda functions to interact with these tables (Task 3.2-3.5)
2. Set up API Gateway endpoints (Task 4)
3. Configure authentication (Task 4.1-4.2)

## Notes

- Amplify automatically prefixes table names with project and environment
- Billing mode is set to PAY_PER_REQUEST (on-demand) by default
- IAM roles are automatically created with basic permissions
- You can modify table settings later using `amplify update storage`
