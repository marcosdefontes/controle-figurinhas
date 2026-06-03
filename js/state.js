// --- STATE STATE STORE ---

class FigurinhasState {
  constructor() {
    this.listeners = [];
    this.resetToDefaults();
    this.loadFromStorage();
    this.generateMarketTrades();
  }

  resetToDefaults() {
    this.state = {
      // Maps stickerId -> { count: number, pasted: boolean }
      owned: {},
      packs: 3,
      customList: [], // Custom stickers created by user
      trades: [],     // Market trade proposals
      totalPastedCount: 0,
      activityLog: []
    };
  }

  // Pub/Sub pattern
  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveToStorage();
    this.listeners.forEach(listener => listener(this.state));
  }

  // Persistence
  saveToStorage() {
    try {
      localStorage.setItem("figurinhas_pop_state_v1", JSON.stringify(this.state));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem("figurinhas_pop_state_v1");
      if (data) {
        const parsed = JSON.parse(data);
        // Clean merge with fallback
        this.state = {
          owned: parsed.owned || {},
          packs: typeof parsed.packs === 'number' ? parsed.packs : 3,
          customList: parsed.customList || [],
          trades: parsed.trades || [],
          totalPastedCount: parsed.totalPastedCount || 0,
          activityLog: parsed.activityLog || []
        };
      } else {
        // Pre-fill some starting owned stickers for better visual onboarding
        // Let's give them 2 random starter stickers!
        this.addStickerToCollection("games-1", false);
        this.addStickerToCollection("pets-1", false);
        this.logActivity("Boas-vindas! Você recebeu o Álbum de Figurinhas Pop.");
      }
    } catch (e) {
      console.error("Erro ao carregar do localStorage", e);
      this.resetToDefaults();
    }
  }

  // --- ACTIONS ---

  // Adds a sticker to the owned library
  addStickerToCollection(id, isPasted = false) {
    if (!this.state.owned[id]) {
      this.state.owned[id] = { count: 0, pasted: isPasted };
    }
    this.state.owned[id].count += 1;
    if (isPasted && !this.state.owned[id].pasted) {
      this.state.owned[id].pasted = true;
      this.state.totalPastedCount += 1;
    }
    this.notify();
  }

  // Paste a sticker into the album
  pasteSticker(id) {
    const item = this.state.owned[id];
    if (item && item.count > 0 && !item.pasted) {
      item.pasted = true;
      this.state.totalPastedCount = this.calculatePastedCount();
      this.logActivity(`Você colou a figurinha no álbum! 🎉`);
      this.notify();
      return true;
    }
    return false;
  }

  calculatePastedCount() {
    let count = 0;
    // Count standard pasted stickers
    STICKERS_DATABASE.forEach(st => {
      if (this.state.owned[st.id]?.pasted) count++;
    });
    // Count custom pasted stickers
    this.state.customList.forEach(st => {
      if (this.state.owned[st.id]?.pasted) count++;
    });
    return count;
  }

  // Get album statistics
  getStats() {
    const totalStandard = STICKERS_DATABASE.length;
    const pastedStandard = STICKERS_DATABASE.filter(st => this.state.owned[st.id]?.pasted).length;
    
    const totalCustom = this.state.customList.length;
    const pastedCustom = this.state.customList.filter(st => this.state.owned[st.id]?.pasted).length;

    const totalStickersInAlbum = totalStandard + totalCustom;
    const totalPasted = pastedStandard + pastedCustom;
    const percentage = totalStickersInAlbum > 0 ? Math.round((totalPasted / totalStickersInAlbum) * 100) : 0;

    // Count duplicates
    let duplicates = 0;
    Object.keys(this.state.owned).forEach(id => {
      const ownedItem = this.state.owned[id];
      if (ownedItem.count > 1) {
        duplicates += (ownedItem.count - (ownedItem.pasted ? 1 : 0));
      } else if (ownedItem.count === 1 && !ownedItem.pasted) {
        // Technically not a duplicate, but an unpasted sticker in hand
      }
    });

    return {
      totalStandard,
      pastedStandard,
      totalCustom,
      pastedCustom,
      totalPasted,
      totalStickersInAlbum,
      percentage,
      duplicates,
      packs: this.state.packs
    };
  }

  // Claim free pack booster
  claimFreePack() {
    this.state.packs += 1;
    this.logActivity("Você resgatou um Pacotinho Grátis! 📦");
    this.notify();
  }

  // Creates a customized sticker
  createCustomSticker(name, emoji, bg, shape) {
    const id = `custom-${Date.now()}`;
    const newSticker = {
      id,
      name: name || "Sticker Pop",
      category: "custom",
      rarity: "epico", // Custom stickers are epic by default!
      emoji: emoji || "✨",
      bg: bg || "var(--accent-color)",
      shape: shape || "bubble",
      desc: "Uma obra de arte única criada por você!"
    };

    // Add to custom list
    this.state.customList.push(newSticker);
    // Add to owned & instantly pasted!
    this.state.owned[id] = { count: 1, pasted: true };
    this.state.totalPastedCount = this.calculatePastedCount();
    
    this.logActivity(`Você criou a figurinha customizada: ${newSticker.name}! 🎨`);
    this.notify();
    return newSticker;
  }

  // Opens a pack, picks 3 random stickers
  openPack() {
    if (this.state.packs <= 0) return null;
    
    this.state.packs -= 1;
    const selectedStickers = [];

    for (let i = 0; i < 3; i++) {
      const selected = this.rollRandomSticker();
      selectedStickers.push(selected);
      // Add to user inventory
      this.addStickerToCollection(selected.id, false);
    }

    this.logActivity("Você abriu um pacotinho e ganhou 3 figurinhas!");
    this.generateMarketTrades(); // Refresh trades when duplicates change
    this.notify();

    return selectedStickers;
  }

  rollRandomSticker() {
    // 1. Determine rarity based on weights
    const roll = Math.random() * 100;
    let selectedRarity = "comum";
    
    let cumulative = 0;
    for (const [rarity, meta] of Object.entries(RARITY_METADATA)) {
      cumulative += meta.weight;
      if (roll <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }

    // 2. Filter stickers of that rarity
    let pool = STICKERS_DATABASE.filter(st => st.rarity === selectedRarity);
    
    // Fallback if rarity pool is empty (shouldn't be)
    if (pool.length === 0) {
      pool = STICKERS_DATABASE;
    }

    // 3. Select random
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  // --- MARKET TRADING LOGIC ---

  generateMarketTrades() {
    // Generates 3 mock trades based on characters offering to swap
    const dealers = [
      { name: "Ana Clara 🐾", avatar: "👩‍🦰" },
      { name: "Pedro Pixel 👾", avatar: "🧑‍💻" },
      { name: "Beatriz Geom 📐", avatar: "👩‍🎨" },
      { name: "Lucas Gamer 🕹️", avatar: "🧑‍🚀" }
    ];

    // Find stickers the user is missing
    const missingStandard = STICKERS_DATABASE.filter(st => !this.state.owned[st.id]?.pasted);
    
    // Find user duplicates
    const userDuplicates = STICKERS_DATABASE.filter(st => {
      const ownedItem = this.state.owned[st.id];
      if (!ownedItem) return false;
      const available = ownedItem.count - (ownedItem.pasted ? 1 : 0);
      return available > 0;
    });

    const mockTrades = [];

    // Deal 1: Fixed starter trades if user has no duplicates yet
    if (userDuplicates.length === 0) {
      // Character offers a common or rare sticker in exchange for standard commons
      // Let's create an offer: Ana offers "Cachorrinho Caramelo" (pets-2) for "Controle Retrô" (games-1)
      mockTrades.push({
        id: "trade-starter-1",
        dealer: dealers[0],
        offered: STICKERS_DATABASE.find(st => st.id === "pets-2"),
        wanted: STICKERS_DATABASE.find(st => st.id === "games-1"),
        description: "Adoro colecionar jogos retro, troca comigo?"
      });

      mockTrades.push({
        id: "trade-starter-2",
        dealer: dealers[1],
        offered: STICKERS_DATABASE.find(st => st.id === "games-3"), // Poção (rare)
        wanted: STICKERS_DATABASE.find(st => st.id === "pets-1"), // Gatinho (common)
        description: "Dou uma poção rara pelo gatinho fofo!"
      });
    } else {
      // Generate trades dynamically based on user duplicates and missing stickers
      const limit = Math.min(3, userDuplicates.length);
      
      for (let i = 0; i < limit; i++) {
        const userSticker = userDuplicates[i];
        
        // Find a suitable offering sticker from missing list, or a random one of similar/higher rarity
        let offeredSticker = null;
        if (missingStandard.length > 0) {
          // Try to offer a missing one!
          const idx = Math.min(i, missingStandard.length - 1);
          offeredSticker = missingStandard[idx];
        } else {
          // If user has all, pick a random legendary/epic
          offeredSticker = STICKERS_DATABASE.find(st => st.rarity === "lendario" || st.rarity === "epico");
        }

        if (offeredSticker && offeredSticker.id !== userSticker.id) {
          const dealer = dealers[(i + 2) % dealers.length];
          mockTrades.push({
            id: `trade-dynamic-${i}-${Date.now()}`,
            dealer,
            offered: offeredSticker,
            wanted: userSticker,
            description: `Você tem figurinha duplicada da ${userSticker.name}! Troca pela minha ${offeredSticker.name}?`
          });
        }
      }
      
      // Pad with a static epic trade if dynamic trades are sparse
      if (mockTrades.length < 2) {
        mockTrades.push({
          id: "trade-static-pad",
          dealer: dealers[2],
          offered: STICKERS_DATABASE.find(st => st.id === "geom-3"), // Raio (rare)
          wanted: STICKERS_DATABASE.find(st => st.id === "tech-1"), // Café (common)
          description: "Estou precisando de café para terminar meu projeto geométrico!"
        });
      }
    }

    this.state.trades = mockTrades;
  }

  // Execute a swap transaction
  executeTrade(tradeId) {
    const trade = this.state.trades.find(t => t.id === tradeId);
    if (!trade) return { success: false, message: "Troca não encontrada." };

    const wantedId = trade.wanted.id;
    const offeredId = trade.offered.id;

    // Check if user owns wanted sticker and has an unpasted copy available
    const ownedWanted = this.state.owned[wantedId];
    const available = ownedWanted ? ownedWanted.count - (ownedWanted.pasted ? 1 : 0) : 0;

    if (available <= 0) {
      return { 
        success: false, 
        message: `Ops! Você precisa ter a figurinha "${trade.wanted.name}" livre (não colada) para realizar esta troca.` 
      };
    }

    // Deduct wanted sticker from user inventory
    ownedWanted.count -= 1;
    if (ownedWanted.count === 0 && !ownedWanted.pasted) {
      delete this.state.owned[wantedId];
    }

    // Add offered sticker to user inventory
    this.addStickerToCollection(offeredId, false);

    // Remove trade from active list
    this.state.trades = this.state.trades.filter(t => t.id !== tradeId);

    // Regenerate/refresh remaining trades
    this.generateMarketTrades();

    this.logActivity(`Troca concluída com ${trade.dealer.name}! 🤝`);
    this.notify();

    return { 
      success: true, 
      message: `Troca concluída! Você enviou "${trade.wanted.name}" e recebeu "${trade.offered.name}".` 
    };
  }

  // Log audit
  logActivity(text) {
    this.state.activityLog.unshift({
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text
    });
    if (this.state.activityLog.length > 20) {
      this.state.activityLog.pop();
    }
  }
}

// Global Singleton
const appState = new FigurinhasState();
