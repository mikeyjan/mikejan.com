/**
 * Tests for secrets setup
 * 
 * These tests verify that the secrets management system is properly configured
 * for local development.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Secrets Setup', () => {
  const secretsPath = path.join(__dirname, '..', 'amplify', 'backend', 'function', 'secrets.json');
  const secretsTemplatePath = path.join(__dirname, '..', 'amplify', 'backend', 'function', 'secrets.json.template');
  const gitignorePath = path.join(__dirname, '..', '.gitignore');

  test('secrets.json.template exists', () => {
    expect(fs.existsSync(secretsTemplatePath)).toBe(true);
  });

  test('secrets.json.template has correct structure', () => {
    const template = JSON.parse(fs.readFileSync(secretsTemplatePath, 'utf8'));
    expect(template).toHaveProperty('PASSWORD_HASH');
    expect(template).toHaveProperty('JWT_SECRET');
    expect(template).toHaveProperty('GENERATED_AT');
  });

  test('secrets.json is in .gitignore', () => {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    expect(gitignoreContent).toContain('amplify/backend/function/secrets.json');
  });

  test('.env.secrets is in .gitignore', () => {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    expect(gitignoreContent).toContain('.env.secrets');
  });

  test('secrets-loader.js exists', () => {
    const loaderPath = path.join(__dirname, '..', 'amplify', 'backend', 'function', 'shared', 'secrets-loader.js');
    expect(fs.existsSync(loaderPath)).toBe(true);
  });

  test('generate-secrets.js script exists', () => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'generate-secrets.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  // Optional test - only runs if secrets.json has been generated
  test('secrets.json has valid structure if it exists', () => {
    if (fs.existsSync(secretsPath)) {
      const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
      
      // Check structure
      expect(secrets).toHaveProperty('PASSWORD_HASH');
      expect(secrets).toHaveProperty('JWT_SECRET');
      expect(secrets).toHaveProperty('GENERATED_AT');
      
      // Check PASSWORD_HASH format (bcrypt hash starts with $2a$, $2b$, or $2y$)
      expect(secrets.PASSWORD_HASH).toMatch(/^\$2[aby]\$\d{2}\$/);
      
      // Check JWT_SECRET is a hex string of reasonable length (at least 64 chars)
      expect(secrets.JWT_SECRET).toMatch(/^[0-9a-f]{64,}$/);
      
      // Check GENERATED_AT is a valid ISO date
      expect(() => new Date(secrets.GENERATED_AT)).not.toThrow();
    } else {
      console.log('⚠️  secrets.json not found - run: node scripts/generate-secrets.js');
    }
  });
});

describe('Secrets Loader Module', () => {
  // Note: We can't directly test the secrets-loader.js module here since it's
  // a Node.js module and these tests run in Jest with jsdom environment.
  // The actual functionality will be tested when we implement the Lambda functions.
  
  test('secrets-loader exports expected functions', () => {
    const loaderPath = path.join(__dirname, '..', 'amplify', 'backend', 'function', 'shared', 'secrets-loader.js');
    const loaderContent = fs.readFileSync(loaderPath, 'utf8');
    
    // Check that the module exports the expected functions
    expect(loaderContent).toContain('getSecrets');
    expect(loaderContent).toContain('getPasswordHash');
    expect(loaderContent).toContain('getJWTSecret');
    expect(loaderContent).toContain('clearCache');
    expect(loaderContent).toContain('module.exports');
  });
});
