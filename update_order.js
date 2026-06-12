const fs = require('fs');
const path = require('path');

const selecoesPath = path.join(__dirname, 'data', 'selecoes.json.bak');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(selecoesPath)) {
  console.error("Erro: arquivo data/selecoes.json.bak não encontrado.");
  process.exit(1);
}

const selecoes = JSON.parse(fs.readFileSync(selecoesPath, 'utf8'));

const groupCounts = {};

selecoes.forEach(sel => {
  let grupoPasta = sel.group;
  if (grupoPasta === 'FWC' || grupoPasta === 'CC') {
    grupoPasta = '_ESPECIAIS';
  }

  const originalGroup = sel.group;
  if (!groupCounts[originalGroup]) {
    groupCounts[originalGroup] = 1;
  } else {
    groupCounts[originalGroup]++;
  }

  const order = groupCounts[originalGroup];
  const cod = sel.cod;
  
  const infoPath = path.join(dataDir, grupoPasta, cod, `${cod}.info.json`);
  
  if (fs.existsSync(infoPath)) {
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    info.order = order;
    fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
    console.log(`Atualizado ${cod} com order: ${order}`);
  } else {
    console.warn(`Arquivo não encontrado: ${infoPath}`);
  }
});

console.log("Atualização de order concluída!");
