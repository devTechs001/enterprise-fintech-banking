#!/bin/bash
#
# Install dependencies and print how to run the app.
#
# This is an npm workspaces repository, so there is ONE install at the root rather
# than one per workspace. An earlier revision of this script installed client/ and
# server/ separately and then recommended `npm run dev:all`, a script that has never
# existed in any package.json here.

set -u

echo "🚀 Enterprise Fintech Banking - Setup & Run"
echo "==========================================="

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# A lockfile whose tarballs point at an unreachable registry makes npm crash with an
# opaque "Exit handler never called!". Fail with something useful instead.
if grep -q 'registry.npmmirror.com' package-lock.json 2>/dev/null; then
    echo "❌ package-lock.json pins registry.npmmirror.com, which is unreachable here."
    echo "   Re-point it at https://registry.npmjs.org/ before installing."
    exit 1
fi

echo ""
echo "📦 Installing all workspaces (client, server, shared)..."
if npm install --no-audit --no-fund; then
    echo "✅ Dependencies installed"
else
    echo "❌ npm install failed. If it died with 'Exit handler never called!', run"
    echo "   'make clean' to clear a stale node_modules, then try again."
    exit 1
fi

echo ""
echo "🩺 Verifying the server (57 self-checks, no database needed)..."
(cd server && npm run check) || echo "⚠️  server self-checks reported a problem"

echo ""
echo "==========================================="
echo "✅ Setup complete"
echo "==========================================="
echo ""
echo "📋 Preview the whole product with no database (mock API):"
echo "   cd client && npm run dev:mock        # http://localhost:5173"
echo "   demo@securebank.test / SecureBank!2026"
echo ""
echo "🖥️  Full stack instead (needs PostgreSQL; see README.md):"
echo "   docker-compose up -d postgres redis"
echo "   cd server && cp .env.example .env    # then set DB_*, REDIS_*, JWT_* secrets"
echo "   cd server && npm run dev             # Terminal 1 → http://localhost:3000"
echo "   cd client && npm run dev             # Terminal 2 → http://localhost:5173"
echo ""
echo "🧪 Verify a change:"
echo "   make build && make test && make lint"
echo ""
