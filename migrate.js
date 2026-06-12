const fs = require('fs');
const path = require('path');

const selecoesPath = path.join(__dirname, 'data', 'selecoes.json');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(selecoesPath)) {
  console.error("Erro: arquivo data/selecoes.json não encontrado.");
  process.exit(1);
}

const selecoes = JSON.parse(fs.readFileSync(selecoesPath, 'utf8'));

selecoes.forEach(sel => {
  let grupoPasta = sel.group;
  // Conforme requisito, FWC e CC vão para _ESPECIAIS
  if (grupoPasta === 'FWC' || grupoPasta === 'CC') {
    grupoPasta = '_ESPECIAIS';
  }

  const cod = sel.cod;
  const targetDir = path.join(dataDir, grupoPasta, cod);

  // Criar pastas
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Gravar info.json
  const infoPath = path.join(targetDir, `${cod}.info.json`);
  const infoData = {
    name: sel.name,
    color: sel.color
  };
  fs.writeFileSync(infoPath, JSON.stringify(infoData, null, 2));

  // Gravar arquivos .fig vazios
  if (sel.missing && sel.missing.length > 0) {
    sel.missing.forEach(m => {
      // Formatar numero com dois digitos ex: 01, 02
      const numFormatted = m.toString().padStart(2, '0');
      const figPath = path.join(targetDir, `${cod}-${numFormatted}.fig`);
      fs.writeFileSync(figPath, "");
    });
  }

  console.log(`Migrado: ${cod} para ${grupoPasta}/${cod} (${sel.missing ? sel.missing.length : 0} figurinhas)`);
});

console.log("Migração concluída com sucesso!");
