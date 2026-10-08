const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Dist directory does not exist!');
  process.exit(1);
}

// 1. Criar .nojekyll para o GitHub Pages não ignorar a pasta _expo
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('✓ Created dist/.nojekyll');

// 2. Criar dist/vercel.json para roteamento SPA na Vercel
const vercelConfig = {
  cleanUrls: true,
  headers: [
    {
      source: '/index.html',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
      ],
    },
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
  ],
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ],
};
fs.writeFileSync(path.join(distDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
console.log('✓ Created dist/vercel.json');

// 3. Processar dist/index.html para suporte a caminhos relativos e tema escuro desde o primeiro milissegundo
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Redirecionamento instantâneo se acessado via GitHub Pages para o domínio oficial aurora-studio.vercel.app
  const redirectScript = `
    <script>
      if (window.location.hostname.includes('github.io')) {
        window.location.replace('https://aurora-studio.vercel.app' + window.location.search + window.location.hash);
      }
    </script>
  `;

  // Adicionar base tag relativa se não existir
  if (!html.includes('<base')) {
    html = html.replace('<head>', `<head>${redirectScript}\n    <base href="./" />`);
  } else {
    html = html.replace('<head>', `<head>${redirectScript}`);
  }

  // Viewport com viewport-fit=cover para suporte nativo a safe areas do Safari / iOS
  html = html.replace(
    /name="viewport" content="[^"]*"/,
    'name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"'
  );

  // Garantir que scripts usem caminhos relativos
  html = html.replace(/src="\/_expo\//g, 'src="./_expo/');
  html = html.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');

  // Substituir height 100% por 100dvh e -webkit-fill-available para Safari iOS
  html = html.replace(
    /html,\s*body\s*\{\s*height:\s*100%;?\s*\}/g,
    'html, body { height: 100%; height: 100dvh !important; min-height: -webkit-fill-available; }'
  );
  html = html.replace(
    /#root\s*\{\s*display:\s*flex;\s*height:\s*100%;\s*flex:\s*1;\s*\}/g,
    '#root { display: flex; height: 100%; height: 100dvh !important; min-height: -webkit-fill-available; flex: 1; }'
  );

  const extraStyles = `
    <style>
      *, *::before, *::after {
        box-sizing: border-box;
      }
      html, body {
        background-color: #050811 !important;
        color: #FFFFFF !important;
        height: 100dvh !important;
        overflow: hidden;
      }
      #root {
        background-color: #050811 !important;
        color: #FFFFFF !important;
        height: 100dvh !important;
        overflow: hidden;
      }
    </style>
  `;
  html = html.replace('</head>', `${extraStyles}\n  </head>`);

  fs.writeFileSync(indexPath, html);
  console.log('✓ Patched dist/index.html with relative paths, viewport-fit=cover and 100dvh');

  // 4. Copiar index.html para 404.html (para suporte SPA no GitHub Pages)
  fs.writeFileSync(path.join(distDir, '404.html'), html);
  console.log('✓ Created dist/404.html for GitHub Pages SPA fallback');
}
