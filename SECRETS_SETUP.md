# Secrets Setup for Local Development

This document explains how to set up secrets (password hash and JWT secret) for local development with AWS Amplify.

## Overview

For authentication, the application requires:
1. **Password Hash**: A bcrypt hash of the admin password
2. **JWT Secret**: A secure random string for signing JWT tokens

## Local Development Setup

### Step 1: Generate Secrets

Run the secrets generation script:

```bash
node scripts/generate-secrets.js
```

This will:
- Prompt you for an admin password
- Generate a bcrypt hash of the password
- Generate a secure JWT secret (128 random hex characters)
- Save both to `.env.secrets` and `amplify/backend/function/secrets.json`

### Step 2: Configure Lambda Functions

The secrets are stored in `amplify/backend/function/secrets.json` and can be loaded by Lambda functions during local testing with `amplify mock`.

Each Lambda function that needs authentication should:
1. Read the secrets from the secrets.json file
2. Use the PASSWORD_HASH for password verification
3. Use the JWT_SECRET for token signing/verification

### Files Created

- `.env.secrets` - Environment variables format (for reference)
- `amplify/backend/function/secrets.json` - JSON format (used by Lambda functions)

**⚠️ IMPORTANT**: These files are automatically added to `.gitignore` and should NEVER be committed to version control.

## Production Deployment

When deploying to production (outside of local development):

1. Use AWS Secrets Manager to store the password hash and JWT secret
2. Update Lambda function IAM roles to grant access to Secrets Manager
3. Modify Lambda functions to retrieve secrets from AWS Secrets Manager instead of local files
4. Use environment variables to specify the Secrets Manager secret ARN

Example production setup:
```javascript
// In Lambda function
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecrets() {
  const response = await secretsManager.getSecretValue({
    SecretId: process.env.SECRETS_ARN
  }).promise();
  
  return JSON.parse(response.SecretString);
}
```

## Security Notes

- The password hash uses bcrypt with 10 salt rounds
- The JWT secret is 128 hex characters (512 bits of entropy)
- Secrets are stored locally only for development
- Never commit secrets to version control
- Rotate secrets regularly in production
- Use AWS Secrets Manager for production deployments

## Regenerating Secrets

To regenerate secrets (e.g., if compromised or for testing):

```bash
node scripts/generate-secrets.js
```

This will overwrite the existing secrets files.

## Requirements Satisfied

This setup satisfies requirements 6.1-6.5:
- 6.1: Password authentication required for admin access
- 6.2: Valid password grants access
- 6.3: Invalid password denies access
- 6.4: Authentication state maintained during session (via JWT)
- 6.5: Logout revokes access (by discarding JWT)
