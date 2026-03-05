#!/usr/bin/env node

/**
 * Generate secrets for local development
 * This script generates a bcrypt password hash and JWT secret
 * and stores them in environment variable files for Lambda functions
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a secure JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Prompt for password
function promptPassword() {
  return new Promise((resolve) => {
    rl.question('Enter admin password: ', (password) => {
      resolve(password);
    });
  });
}

// Prompt for geocoding API key
function promptGeocodingApiKey() {
  return new Promise((resolve) => {
    rl.question('Enter OpenCage API key (or press Enter to skip): ', (apiKey) => {
      resolve(apiKey || '');
    });
  });
}

// Generate bcrypt hash (using a simple implementation for local dev)
// Note: In production, you'd use the bcrypt library
function generatePasswordHash(password) {
  // For local development, we'll use a simple hash
  // In production Lambda functions, we'll use bcrypt
  const bcrypt = require('bcryptjs');
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

async function main() {
  console.log('🔐 Generating secrets for local development...\n');
  
  // Generate JWT secret
  const jwtSecret = generateJWTSecret();
  console.log('✅ Generated JWT secret');
  
  // Get password from user
  const password = await promptPassword();
  
  // Get geocoding API key from user
  const geocodingApiKey = await promptGeocodingApiKey();
  rl.close();
  
  // Generate password hash
  const passwordHash = generatePasswordHash(password);
  console.log('✅ Generated password hash');
  
  if (geocodingApiKey) {
    console.log('✅ Geocoding API key configured');
  } else {
    console.log('⚠️  Geocoding API key skipped (can be added later)');
  }
  
  // Create secrets object
  const secrets = {
    PASSWORD_HASH: passwordHash,
    JWT_SECRET: jwtSecret,
    GEOCODING_API_KEY: geocodingApiKey,
    GENERATED_AT: new Date().toISOString()
  };
  
  // Save to .env file for local development
  const envPath = path.join(__dirname, '..', '.env.secrets');
  const envContent = `# Generated secrets for local development
# DO NOT COMMIT THIS FILE TO VERSION CONTROL
# Generated at: ${secrets.GENERATED_AT}

PASSWORD_HASH=${secrets.PASSWORD_HASH}
JWT_SECRET=${secrets.JWT_SECRET}
GEOCODING_API_KEY=${secrets.GEOCODING_API_KEY}
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Secrets saved to .env.secrets`);
  
  // Also save to a JSON file for Lambda function configuration
  const secretsJsonPath = path.join(__dirname, '..', 'amplify', 'backend', 'function', 'secrets.json');
  fs.writeFileSync(secretsJsonPath, JSON.stringify(secrets, null, 2));
  console.log(`✅ Secrets saved to amplify/backend/function/secrets.json`);
  
  console.log('\n✨ Secrets generated successfully!');
  console.log('\n⚠️  IMPORTANT: These files contain sensitive information.');
  console.log('   Make sure .env.secrets and secrets.json are in .gitignore');
  console.log('\n📝 Next steps:');
  console.log('   1. Update Lambda function environment variables to use these secrets');
  console.log('   2. For production, migrate to AWS Secrets Manager');
  if (!geocodingApiKey) {
    console.log('   3. Add GEOCODING_API_KEY to secrets.json when ready to use geocoding');
  }
}

main().catch(console.error);
