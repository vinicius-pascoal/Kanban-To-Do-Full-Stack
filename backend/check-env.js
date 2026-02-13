const fs = require('fs');
const path = require('path');

console.log('=== Verificação de Variáveis de Ambiente ===\n');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse .env file
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
});

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'ENCRYPTION_KEY',
  'FRONTEND_URL'
];

let allOk = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const status = value ? '✅' : '❌';
  const display = value
    ? (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('DATABASE')
      ? `${value.substring(0, 20)}...`
      : value)
    : 'NÃO CONFIGURADA';

  console.log(`${status} ${varName}: ${display}`);

  if (!value) {
    allOk = false;
  }
});

console.log('\n' + (allOk ? '✅ Todas as variáveis estão configuradas!' : '❌ Algumas variáveis estão faltando!'));

// Test encryption key length
if (envVars.ENCRYPTION_KEY) {
  const key = Buffer.from(envVars.ENCRYPTION_KEY, 'base64');
  console.log(`\n📏 ENCRYPTION_KEY length: ${key.length} bytes ${key.length === 32 ? '✅' : '❌ (deve ter 32 bytes)'}`);
}
