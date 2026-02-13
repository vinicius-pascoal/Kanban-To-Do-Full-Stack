const fs = require('fs');
const path = require('path');

console.log('=== Verificação de Variáveis de Ambiente - Frontend ===\n');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse .env.local file
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
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_BACKEND_URL',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

let allOk = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const status = value ? '✅' : '❌';
  const display = value
    ? (varName.includes('SECRET')
      ? `${value.substring(0, 20)}...`
      : value)
    : 'NÃO CONFIGURADA';

  console.log(`${status} ${varName}: ${display}`);

  if (!value) {
    allOk = false;
  }
});

console.log('\n' + (allOk ? '✅ Todas as variáveis estão configuradas!' : '❌ Algumas variáveis estão faltando!'));

// Verify NEXTAUTH_SECRET length
if (envVars.NEXTAUTH_SECRET) {
  const minLength = 32;
  const length = envVars.NEXTAUTH_SECRET.length;
  console.log(`\n📏 NEXTAUTH_SECRET length: ${length} chars ${length >= minLength ? '✅' : `❌ (deve ter pelo menos ${minLength} chars)`}`);
}
