const STICKERS_DATABASE = [
  // --- RETRO GAMING (Games) ---
  {
    id: "games-1",
    name: "Controle Retrô",
    category: "games",
    rarity: "comum",
    emoji: "🎮",
    bg: "var(--accent-color)", // Violet
    shape: "bubble",
    desc: "O clássico controle de 8 bits que começou tudo!"
  },
  {
    id: "games-2",
    name: "Moedinha de Ouro",
    category: "games",
    rarity: "comum",
    emoji: "🪙",
    bg: "var(--tertiary-color)", // Yellow
    shape: "circle",
    desc: "Faz aquele barulho plim-plim inconfundível!"
  },
  {
    id: "games-3",
    name: "Poção de Vida",
    category: "games",
    rarity: "raro",
    emoji: "🧪",
    bg: "var(--secondary-color)", // Pink
    shape: "leaf",
    desc: "Restaura todos os seus pontos de energia vital."
  },
  {
    id: "games-4",
    name: "Espadinha Pixel",
    category: "games",
    rarity: "epico",
    emoji: "⚔️",
    bg: "var(--quaternary-color)", // Mint
    shape: "arch",
    desc: "Forjada em pixels puros para derrotar chefões."
  },
  {
    id: "games-5",
    name: "Fantasminha Pop",
    category: "games",
    rarity: "lendario",
    emoji: "👻",
    bg: "var(--accent-color)",
    shape: "bubble",
    desc: "Ele é tímido quando você olha diretamente!"
  },

  // --- CUTE ANIMALS (Pets) ---
  {
    id: "pets-1",
    name: "Gatinho Miau",
    category: "pets",
    rarity: "comum",
    emoji: "🐱",
    bg: "var(--secondary-color)",
    shape: "circle",
    desc: "Passa 18 horas por dia dormindo e roncando."
  },
  {
    id: "pets-2",
    name: "Cachorrinho Caramelo",
    category: "pets",
    rarity: "comum",
    emoji: "🐶",
    bg: "var(--tertiary-color)",
    shape: "bubble",
    desc: "O verdadeiro patrimônio cultural da nossa nação!"
  },
  {
    id: "pets-3",
    name: "Dino Baby",
    category: "pets",
    rarity: "raro",
    emoji: "🦖",
    bg: "var(--quaternary-color)",
    shape: "leaf",
    desc: "Rugidos ferozes, mas em tom bem baixinho."
  },
  {
    id: "pets-4",
    name: "Raposinha Astuta",
    category: "pets",
    rarity: "epico",
    emoji: "🦊",
    bg: "var(--accent-color)",
    shape: "arch",
    desc: "Sempre planejando a próxima travessura fofa."
  },
  {
    id: "pets-5",
    name: "Unicórnio Estrelar",
    category: "pets",
    rarity: "lendario",
    emoji: "🦄",
    bg: "var(--secondary-color)",
    shape: "bubble",
    desc: "Espalha arco-íris e purpurina por onde passa."
  },

  // --- ABSTRACT GEOMETRY (Geom) ---
  {
    id: "geom-1",
    name: "Splat Colorido",
    category: "geom",
    rarity: "comum",
    emoji: "🎨",
    bg: "var(--quaternary-color)",
    shape: "leaf",
    desc: "Uma explosão orgânica de tinta pura e vibrante."
  },
  {
    id: "geom-2",
    name: "Estrela Brilhante",
    category: "geom",
    rarity: "comum",
    emoji: "⭐",
    bg: "var(--tertiary-color)",
    shape: "circle",
    desc: "Brilha com o otimismo dos anos oitenta."
  },
  {
    id: "geom-3",
    name: "Raio de Energia",
    category: "geom",
    rarity: "raro",
    emoji: "⚡",
    bg: "var(--accent-color)",
    shape: "arch",
    desc: "Cuidado! Alta voltagem de criatividade."
  },
  {
    id: "geom-4",
    name: "Prisma Mágico",
    category: "geom",
    rarity: "epico",
    emoji: "💎",
    bg: "var(--secondary-color)",
    shape: "bubble",
    desc: "Refrata a luz em cores geométricas perfeitas."
  },
  {
    id: "geom-5",
    name: "Espiral Hipnótica",
    category: "geom",
    rarity: "lendario",
    emoji: "🌀",
    bg: "var(--quaternary-color)",
    shape: "circle",
    desc: "Olhe fixamente e sinta a bounciness se espalhar!"
  },

  // --- TECH & POP (Tech) ---
  {
    id: "tech-1",
    name: "Cafezinho Codificador",
    category: "tech",
    rarity: "comum",
    emoji: "☕",
    bg: "var(--accent-color)",
    shape: "bubble",
    desc: "Combustível de foguete para converter cafeína em código."
  },
  {
    id: "tech-2",
    name: "Pizza de Quatro Queijos",
    category: "tech",
    rarity: "comum",
    emoji: "🍕",
    bg: "var(--tertiary-color)",
    shape: "leaf",
    desc: "O lanche oficial das maratonas de programação."
  },
  {
    id: "tech-3",
    name: "Foguete Espacial",
    category: "tech",
    rarity: "raro",
    emoji: "🚀",
    bg: "var(--secondary-color)",
    shape: "arch",
    desc: "Rumo às estrelas e além das órbitas terrestres!"
  },
  {
    id: "tech-4",
    name: "Cérebro Cibernético",
    category: "tech",
    rarity: "epico",
    emoji: "🧠",
    bg: "var(--quaternary-color)",
    shape: "circle",
    desc: "Processamento de inteligência artificial de última geração."
  },
  {
    id: "tech-5",
    name: "Foguinho Estiloso",
    category: "tech",
    rarity: "lendario",
    emoji: "🔥",
    bg: "var(--tertiary-color)",
    shape: "bubble",
    desc: "Tão quente que derrete qualquer visual corporativo entediante."
  }
];

// Category metadata for translation & coloring
const CATEGORIES_METADATA = {
  all: { name: "Todos", color: "var(--fg-color)" },
  games: { name: "Retro Games", color: "var(--accent-color)" },
  pets: { name: "Bichinhos", color: "var(--secondary-color)" },
  geom: { name: "Geométricos", color: "var(--tertiary-color)" },
  tech: { name: "Tech & Pop", color: "var(--quaternary-color)" },
  custom: { name: "Criadas por Mim", color: "var(--secondary-color)" }
};

// Rarity metadata
const RARITY_METADATA = {
  comum: { name: "Comum", color: "var(--muted-fg-color)", weight: 65 },
  raro: { name: "Raro", color: "var(--accent-color)", weight: 20 },
  epico: { name: "Épico", color: "var(--secondary-color)", weight: 10 },
  lendario: { name: "Lendário", color: "var(--tertiary-color)", weight: 5 }
};
