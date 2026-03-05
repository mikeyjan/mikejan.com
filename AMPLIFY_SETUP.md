# AWS Amplify Setup Instructions

This document provides instructions for completing the AWS Amplify backend setup for the personal website.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Amplify CLI installed (version 14.2.5 or later)

## Step 1: Configure AWS Credentials

Before initializing Amplify, configure your AWS credentials:

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

## Step 2: Initialize Amplify

From the `personal-website` directory, run:

```bash
amplify init
```

Accept the default configuration or customize as needed:
- Project name: personalwebsite
- Environment: dev (or your preferred environment name)
- Default editor: Visual Studio Code
- App type: javascript
- Framework: react
- Source directory: src
- Distribution directory: build
- Build command: npm run-script build
- Start command: npm run-script start

## Step 3: Add API (REST)

Create a REST API with Lambda functions:

```bash
amplify add api
```

Select:
- REST API
- Provide a friendly name: personalWebsiteAPI
- Provide a path: /api
- Create a new Lambda function

## Step 4: Add Storage (DynamoDB)

Add DynamoDB tables for data persistence. See [DYNAMODB_SETUP.md](./DYNAMODB_SETUP.md) for detailed instructions.

Quick summary:

```bash
# Add Personal Info table
amplify add storage
# Select: NoSQL Database, name: personalInfo, partition key: id (String)

# Add Cities table
amplify add storage
# Select: NoSQL Database, name: cities, partition key: id (String)
# Add GSI: country-index (partition: country, sort: updatedAt)
```

For complete step-by-step instructions including security configuration, see [DYNAMODB_SETUP.md](./DYNAMODB_SETUP.md).

## Step 5: Add Authentication

Set up admin authentication:

```bash
amplify add auth
```

Select:
- Default configuration
- Username
- No advanced settings (we'll use custom Lambda for password auth)

## Step 6: Add Hosting

Configure Amplify hosting:

```bash
amplify add hosting
```

Select:
- Amplify Console (Managed hosting with CI/CD)
- Manual deployment

## Step 7: Push Changes to AWS

Deploy all resources:

```bash
amplify push
```

Review the changes and confirm. This will:
- Create DynamoDB tables
- Deploy Lambda functions
- Set up API Gateway
- Configure authentication
- Set up hosting

## Step 8: Configure Secrets

After deployment, add secrets to AWS Secrets Manager:

1. Admin password hash (bcrypt)
2. JWT signing secret

Use AWS Console or CLI to add these secrets.

## Lambda Functions to Implement

After Amplify setup, you'll need to implement these Lambda functions:

1. `getPersonalInfo` - Retrieve personal information
2. `getCities` - Retrieve all cities
3. `getCityDetails` - Retrieve specific city details
4. `authenticateAdmin` - Admin authentication
5. `updatePersonalInfo` - Update personal information (admin)
6. `createCity` - Create new city (admin)
7. `updateCity` - Update city (admin)
8. `deleteCity` - Delete city (admin)

## Environment Variables

Configure these environment variables in Lambda functions:
- `PERSONAL_INFO_TABLE` - DynamoDB table name for personal info
- `CITIES_TABLE` - DynamoDB table name for cities
- `JWT_SECRET_ARN` - ARN for JWT secret in Secrets Manager
- `PASSWORD_HASH_ARN` - ARN for password hash in Secrets Manager

## Testing

After setup, test the infrastructure:

```bash
npm test
```

## Deployment

Deploy the React app:

```bash
amplify publish
```

## Notes

- All AWS resources will be created in your configured region
- Ensure IAM roles have appropriate permissions for DynamoDB access
- Enable DynamoDB encryption at rest and point-in-time recovery for production
- Configure CORS in API Gateway for your domain
- Set up CloudWatch alarms for monitoring
