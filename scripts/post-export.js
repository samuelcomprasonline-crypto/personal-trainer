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

  // Adicionar base tag relativa se não existir
  if (!html.includes('<base')) {
    html = html.replace('<head>', '<head>\n    <base href="./" />');
  }

  // Garantir que scripts usem caminhos relativos
  html = html.replace(/src="\/_expo\//g, 'src="./_expo/');
  html = html.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');

  // Adicionar estilo escuro padrão no reset para evitar qualquer flash branco
  const darkStyle = `
      html, body, #root {
        background-color: #050811 !important;
        color: #FFFFFF !important;
      }
  `;
  html = html.replace('/* These styles make the body full-height */', `${darkStyle}\n      /* These styles make the body full-height */`);

  fs.writeFileSync(indexPath, html);
  console.log('✓ Patched dist/index.html with relative paths and dark background');

  // 4. Copiar index.html para 404.html (para suporte SPA no GitHub Pages)
  fs.writeFileSync(path.join(distDir, '404.html'), html);
  console.log('✓ Created dist/404.html for GitHub Pages SPA fallback');
}
