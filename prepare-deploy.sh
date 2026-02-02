#!/bin/bash

# 🚀 Script de Deploy - Kanban Full Stack
# Este script ajuda a preparar o projeto para deploy

echo "🔧 Preparando projeto para deploy..."
echo ""

# Verificar se está na raiz do projeto
if [ ! -f "vercel.json" ]; then
    echo "❌ Execute este script na raiz do projeto!"
    exit 1
fi

echo "✅ Verificando arquivos necessários..."

# Verificar arquivos
files=(
    "vercel.json"
    "backend/.env.example"
    "frontend/.env.example"
    "backend/prisma/schema.prisma"
    "DEPLOY_GUIDE.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file não encontrado!"
    fi
done

echo ""
echo "📦 Instalando dependências..."

# Backend
cd backend
npm install
echo "✅ Backend dependencies instaladas"

# Frontend
cd ../frontend
npm install
echo "✅ Frontend dependencies instaladas"

cd ..

echo ""
echo "🔍 Verificando Prisma schema..."
cd backend
npx prisma validate
if [ $? -eq 0 ]; then
    echo "✅ Prisma schema válido"
else
    echo "❌ Erro no Prisma schema"
    exit 1
fi

cd ..

echo ""
echo "✅ Projeto pronto para deploy!"
echo ""
echo "📋 Próximos passos:"
echo "1. Leia o arquivo DEPLOY_GUIDE.md"
echo "2. Crie conta no Neon (neon.tech)"
echo "3. Crie conta na Vercel (vercel.com)"
echo "4. Configure variáveis de ambiente"
echo "5. Faça git push e deploy!"
echo ""
echo "🚀 Boa sorte!"
