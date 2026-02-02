# 🚀 Script de Deploy - Kanban Full Stack
# Este script ajuda a preparar o projeto para deploy

Write-Host "🔧 Preparando projeto para deploy..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está na raiz do projeto
if (-Not (Test-Path "vercel.json")) {
    Write-Host "❌ Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Verificando arquivos necessários..." -ForegroundColor Green

# Verificar arquivos
$files = @(
    "vercel.json",
    "backend/.env.example",
    "frontend/.env.example",
    "backend/prisma/schema.prisma",
    "DEPLOY_GUIDE.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não encontrado!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan

# Backend
Set-Location backend
npm install
Write-Host "✅ Backend dependencies instaladas" -ForegroundColor Green

# Frontend
Set-Location ../frontend
npm install
Write-Host "✅ Frontend dependencies instaladas" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "🔍 Verificando Prisma schema..." -ForegroundColor Cyan
Set-Location backend
npx prisma validate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma schema válido" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no Prisma schema" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "✅ Projeto pronto para deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Leia o arquivo DEPLOY_GUIDE.md"
Write-Host "2. Crie conta no Neon (neon.tech)"
Write-Host "3. Crie conta na Vercel (vercel.com)"
Write-Host "4. Configure variáveis de ambiente"
Write-Host "5. Faça git push e deploy!"
Write-Host ""
Write-Host "🚀 Boa sorte!" -ForegroundColor Cyan
