mkdir -p public
cat > public/sw.js <<'EOF'
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', () => {});
EOF
