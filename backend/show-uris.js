const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🔍 URIs Configurados na Aplicação');
console.log('═══════════════════════════════════════════════════════════════\n');

// Read backend .env
const backendEnvPath = path.join(__dirname, '.env');
const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
const backendVars = {};

backendEnv.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      backendVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
});

// Read frontend .env.local
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');
const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
const frontendVars = {};

frontendEnv.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      frontendVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
});

console.log('📍 ADICIONE ESTES URIs NO GOOGLE CLOUD CONSOLE:\n');
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ Seção: Origens JavaScript autorizadas                      │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│                                                             │');

const frontendUrl = frontendVars.NEXTAUTH_URL || frontendVars.NEXT_PUBLIC_API_URL?.replace(':3001', ':3000') || 'http://localhost:3000';
const backendUrl = backendVars.GOOGLE_REDIRECT_URI?.split('/api')[0] || 'http://localhost:3001';

console.log(`│  ${frontendUrl.padEnd(60)}│`);
console.log(`│  ${backendUrl.padEnd(60)}│`);
console.log('│                                                             │');
console.log('└─────────────────────────────────────────────────────────────┘');

console.log('\n┌─────────────────────────────────────────────────────────────┐');
console.log('│ Seção: URIs de redirecionamento autorizados                │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│                                                             │');

const calendarCallback = backendVars.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/google-calendar/callback';
const nextAuthCallback = `${frontendUrl}/api/auth/callback/google`;

console.log(`│  ${calendarCallback.padEnd(60)}│`);
console.log(`│  ${nextAuthCallback.padEnd(60)}│`);
console.log('│                                                             │');
console.log('└─────────────────────────────────────────────────────────────┘\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 INSTRUÇÕES:');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. Acesse: https://console.cloud.google.com/apis/credentials');
console.log('2. Clique no seu OAuth Client ID');
console.log('3. Adicione os URIs acima EXATAMENTE como mostrado');
console.log('4. Clique em SALVAR');
console.log('5. Aguarde 30 segundos');
console.log('6. Teste novamente\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔑 SUAS CREDENCIAIS:');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`Client ID: ${backendVars.GOOGLE_CLIENT_ID || '❌ NÃO CONFIGURADO'}`);
console.log(`Client Secret: ${backendVars.GOOGLE_CLIENT_SECRET ? backendVars.GOOGLE_CLIENT_SECRET.substring(0, 20) + '...' : '❌ NÃO CONFIGURADO'}`);

console.log('\n═══════════════════════════════════════════════════════════════\n');
