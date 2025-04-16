// This is a simple script to run the standalone generator with proper environment variables
import { execSync } from 'child_process';

console.log('Starting content generation script...');
const result = execSync('NODE_ENV=development npx tsx scripts/generate-standalone.ts', { 
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

console.log('Content generation completed.');