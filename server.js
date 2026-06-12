const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Servir os arquivos estáticos (HTML, CSS, JS, etc.)
app.use(express.static(__dirname));

// Endpoint para ler as pastas de figurinhas
app.get('/api/selecoes', (req, res) => {
  const dataDir = path.join(__dirname, 'data');
  const result = [];

  try {
    // Ler todos os grupos (pastas A, B, C, ..., _ESPECIAIS)
    const groups = fs.readdirSync(dataDir).filter(item => {
      return fs.statSync(path.join(dataDir, item)).isDirectory();
    });

    for (const group of groups) {
      const groupDir = path.join(dataDir, group);
      
      // Ler países dentro do grupo
      const countries = fs.readdirSync(groupDir).filter(item => {
        return fs.statSync(path.join(groupDir, item)).isDirectory();
      });

      for (const cod of countries) {
        const countryDir = path.join(groupDir, cod);
        
        // Ler info.json
        const infoPath = path.join(countryDir, `${cod}.info.json`);
        let name = cod;
        let color = '#CCCCCC';
        let order = 99;
        if (fs.existsSync(infoPath)) {
          const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
          name = info.name || name;
          color = info.color || color;
          order = info.order !== undefined ? info.order : order;
        }

        // Ler figurinhas faltantes (.fig)
        const missing = [];
        const files = fs.readdirSync(countryDir);
        for (const file of files) {
          if (file.endsWith('.fig')) {
            // file name format: MEX-01.fig
            const match = file.match(/-(\d+)\.fig$/);
            if (match) {
              missing.push(parseInt(match[1], 10));
            }
          }
        }
        
        // Ordenar as faltantes para ficar igual ao JSON
        missing.sort((a, b) => a - b);

        result.push({
          cod: cod,
          name: name,
          missing: missing,
          color: color,
          group: group === '_ESPECIAIS' ? cod : group,
          order: order
        });
      }
    }
    
    // Sort results by group and order
    result.sort((a, b) => {
      // Special logic for FWC and CC to appear at the end
      const groupA = a.group === 'FWC' ? 'Z1' : (a.group === 'CC' ? 'Z2' : a.group);
      const groupB = b.group === 'FWC' ? 'Z1' : (b.group === 'CC' ? 'Z2' : b.group);
      
      if (groupA < groupB) return -1;
      if (groupA > groupB) return 1;
      return a.order - b.order;
    });

    res.json(result);
  } catch (error) {
    console.error("Erro ao ler pastas:", error);
    res.status(500).json({ error: "Erro ao ler as figurinhas" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log("Acesse esta URL no seu navegador para ver o álbum.");
});
