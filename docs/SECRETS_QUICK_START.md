# Secrets Quick Start Guide

## First Time Setup

1. **Generate secrets** (only needed once):
   ```bash
   node scripts/generate-secrets.js
   ```
   
   You'll be prompted to enter:
   - Admin password (required)
   - OpenCage API key (optional - for geocoding)
   
   This will generate:
   - `.env.secrets` - Environment variables format
   - `amplify/backend/function/secrets.json` - JSON format for Lambda functions

2. **Verify setup**:
   ```bash
   npm test -- secretsSetup.test.ts --watchAll=false
   ```

## Using Secrets in Lambda Functions

```javascript
const { getPasswordHash, getJWTSecret } = require('../shared/secrets-loader');

exports.handler = async (event) => {
  const passwordHash = await getPasswordHash();
  const jwtSecret = await getJWTSecret();
  
  // Use secrets...
};
```

For geocoding in Python Lambda functions:
```python
from geocoding import get_geocoding_api_key, geocode_with_cache

# Get API key
api_key = get_geocoding_api_key()

# Geocode with caching
lat, lng = geocode_with_cache('city-id', 'London', 'UK', 'table-name')
```

## Important Notes

✅ **DO**:
- Run `node scripts/generate-secrets.js` before starting development
- Keep secrets files secure and never commit them
- Use the secrets-loader module in Lambda functions
- Test locally with `amplify mock`

❌ **DON'T**:
- Commit `.env.secrets` or `secrets.json` to git (they're in .gitignore)
- Push to AWS (per project guidelines - local development only)
- Hardcode passwords or secrets in code
- Share secrets in chat, email, or documentation

## Files Overview

| File | Purpose | Committed? |
|------|---------|------------|
| `scripts/generate-secrets.js` | Generates secrets | ✅ Yes |
| `.env.secrets` | Secrets in env format | ❌ No (gitignored) |
| `amplify/backend/function/secrets.json` | Secrets for Lambda | ❌ No (gitignored) |
| `amplify/backend/function/secrets.json.template` | Template showing structure | ✅ Yes |
| `amplify/backend/function/shared/secrets-loader.js` | Loader utility | ✅ Yes |
| `amplify/backend/function/shared/geocoding.py` | Geocoding utility | ✅ Yes |

## Troubleshooting

**Error: "Secrets not configured"**
- Run: `node scripts/generate-secrets.js`

**Tests failing**
- Ensure secrets.json exists: `ls amplify/backend/function/secrets.json`
- Regenerate if needed: `node scripts/generate-secrets.js`

**Need to change password**
- Simply run `node scripts/generate-secrets.js` again
- It will overwrite the existing secrets

## Next Steps

After setting up secrets, you can:
1. Implement the `authenticateAdmin` Lambda function (Task 4.2)
2. Test authentication locally with `amplify mock`
3. Implement JWT verification middleware (Task 4.4)
4. Use geocoding in city management functions (Task 5.3)

See `SECRETS_SETUP.md` for detailed documentation.
