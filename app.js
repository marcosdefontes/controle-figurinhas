// --- FIGURINHAS POP MAIN APP CONTROLLER ---

document.addEventListener("DOMContentLoaded", () => {
  // Global State Reference
  const state = appState;
  
  // Navigation & Router Elements
  const navButtons = document.querySelectorAll(".nav-button");
  const viewSections = document.querySelectorAll(".view-section");
  const statProgress = document.getElementById("nav-stat-progress");
  const statDuplicates = document.getElementById("nav-stat-duplicates");
  const statPacks = document.getElementById("nav-stat-packs");

  // Hero Actions
  const heroBtnAlbum = document.getElementById("hero-btn-album");
  const heroBtnCustom = document.getElementById("hero-btn-custom");

  // Dashboard & Activity Log
  const activityLogContainer = document.getElementById("activity-log-container");
  const dashboardPackTrigger = document.getElementById("dashboard-pack-trigger");
  const btnOpenPack = document.getElementById("btn-open-pack");
  const btnClaimPack = document.getElementById("btn-claim-pack");
  const packCounterPill = document.getElementById("pack-counter-pill");

  // Album Elements
  const albumCategoryFilters = document.getElementById("album-category-filters");
  const albumStickersGrid = document.getElementById("album-stickers-grid");
  const albumProgressBar = document.getElementById("album-progress-bar");
  const albumProgressText = document.getElementById("album-progress-text");

  // Market Elements
  const marketDuplicatesGrid = document.getElementById("market-duplicates-grid");
  const marketDuplicatesEmpty = document.getElementById("market-duplicates-empty");
  const marketTradesList = document.getElementById("market-trades-list");

  // Customizer Elements
  const customPreviewCard = document.getElementById("custom-preview-card");
  const customPreviewShape = document.getElementById("custom-preview-shape");
  const customPreviewEmoji = document.getElementById("custom-preview-emoji");
  const customPreviewName = document.getElementById("custom-preview-name");
  
  const customInputName = document.getElementById("custom-input-name");
  const customColorPicker = document.getElementById("custom-color-picker");
  const customShapePicker = document.getElementById("custom-shape-picker");
  const customEmojiPicker = document.getElementById("custom-emoji-picker");
  const btnCreateSticker = document.getElementById("btn-create-sticker");

  // Modal Pack Opener Elements
  const modalPackOpener = document.getElementById("modal-pack-opener");
  const modalPackClose = document.getElementById("modal-pack-close");
  const packEnvelopeInteractive = document.getElementById("pack-envelope-interactive");
  const revealedCardsTray = document.getElementById("revealed-cards-tray");
  const packOpeningFooter = document.getElementById("pack-opening-footer");
  const packOpeningPrompt = document.getElementById("pack-opening-prompt");
  const btnPackFinishConfirm = document.getElementById("btn-pack-finish-confirm");

  // Modal Sticker Details Elements
  const modalStickerDetails = document.getElementById("modal-sticker-details");
  const modalDetailsClose = document.getElementById("modal-details-close");
  const detailCardRarity = document.getElementById("detail-card-rarity");
  const detailStickerWrapper = document.getElementById("detail-sticker-wrapper");
  const detailStickerEmoji = document.getElementById("detail-sticker-emoji");
  const detailStickerName = document.getElementById("detail-sticker-name");
  const detailStickerCategory = document.getElementById("detail-sticker-category");
  const detailStickerDescription = document.getElementById("detail-sticker-description");
  const btnPasteStickerAction = document.getElementById("btn-paste-sticker-action");

  // Local state for routing & filtering
  let activeTab = "dashboard";
  let activeAlbumCategory = "all";
  
  // Customizer local config state
  let customStickerConfig = {
    name: "Figurinha Pop",
    bg: "var(--accent-color)",
    shape: "bubble",
    emoji: "✨"
  };

  // Booster pack free claim timer cooldown tracking
  const BOOSTER_COOLDOWN_MS = 60000; // 1 minute cooldown for high interactive feedback
  let lastClaimedTime = parseInt(localStorage.getItem("figurinhas_last_claim_time") || "0");

  // ==========================================
  // SPA ROUTER & VIEW SWITCHER
  // ==========================================
  function switchTab(targetTab) {
    activeTab = targetTab;

    // Toggle navigation buttons active state
    navButtons.forEach(btn => {
      if (btn.getAttribute("data-target") === targetTab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Toggle sections visibility
    viewSections.forEach(section => {
      if (section.id === `view-${targetTab}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // Refresh view data upon entrance
    if (targetTab === "dashboard") {
      renderDashboard();
    } else if (targetTab === "album") {
      renderAlbum();
    } else if (targetTab === "market") {
      renderMarket();
    } else if (targetTab === "customizer") {
      renderCustomizer();
    }
  }

  // Bind side navigation click triggers
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-target"));
    });
  });

  // Bind hero shortcuts
  heroBtnAlbum?.addEventListener("click", () => switchTab("album"));
  heroBtnCustom?.addEventListener("click", () => switchTab("customizer"));

  // ==========================================
  // VIEW RENDERERS: 1. DASHBOARD & LOGS
  // ==========================================
  function renderDashboard() {
    const stats = state.getStats();
    packCounterPill.innerText = `${stats.packs} ${stats.packs === 1 ? 'Pacote' : 'Pacotes'}`;

    // Render Recent Activities list
    activityLogContainer.innerHTML = "";
    
    if (state.state.activityLog.length === 0) {
      activityLogContainer.innerHTML = `
        <div style="font-size: 13px; color: var(--muted-fg-color); text-align: center; padding: 12px;">
          Nenhuma atividade registrada ainda. Vamos abrir pacotes!
        </div>
      `;
      return;
    }

    state.state.activityLog.forEach(log => {
      const logDiv = document.createElement("div");
      logDiv.style.display = "flex";
      logDiv.style.gap = "12px";
      logDiv.style.fontSize = "13px";
      logDiv.style.borderBottom = "1px dashed var(--muted-color)";
      logDiv.style.paddingBottom = "8px";

      const timeSpan = document.createElement("span");
      timeSpan.style.fontFamily = "var(--font-headings)";
      timeSpan.style.fontWeight = "800";
      timeSpan.style.color = "var(--accent-color)";
      timeSpan.style.whiteSpace = "nowrap";
      timeSpan.innerText = log.time;

      const textSpan = document.createElement("span");
      textSpan.innerText = log.text;

      logDiv.appendChild(timeSpan);
      logDiv.appendChild(textSpan);
      activityLogContainer.appendChild(logDiv);
    });
  }

  // Claim pack logic with local timer thread
  function checkBoosterPackClaimTimer() {
    const now = Date.now();
    const elapsed = now - lastClaimedTime;

    if (elapsed < BOOSTER_COOLDOWN_MS) {
      // Cooldown active
      btnClaimPack.disabled = true;
      const remainingSeconds = Math.ceil((BOOSTER_COOLDOWN_MS - elapsed) / 1000);
      btnClaimPack.innerHTML = `Disponível em ${remainingSeconds}s <i data-lucide="clock" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-left:6px;"></i>`;
      
      if (window.lucide) window.lucide.createIcons();
      
      setTimeout(checkBoosterPackClaimTimer, 1000);
    } else {
      // Cooldown finished
      btnClaimPack.disabled = false;
      btnClaimPack.innerHTML = `Resgatar Pacotinho Grátis <i data-lucide="gift"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  btnClaimPack.addEventListener("click", () => {
    state.claimFreePack();
    lastClaimedTime = Date.now();
    localStorage.setItem("figurinhas_last_claim_time", lastClaimedTime.toString());
    
    UI.showToast("Você resgatou um pacotinho booster grátis! 📦", "success");
    UI.triggerConfetti();
    
    checkBoosterPackClaimTimer();
    renderDashboard();
    renderNavigationStats();
  });

  // Start claim pack timer loop
  checkBoosterPackClaimTimer();

  // ==========================================
  // VIEW RENDERERS: 2. STICKER ALBUM GRID
  // ==========================================
  function setupAlbumFilters() {
    albumCategoryFilters.innerHTML = "";
    
    Object.keys(CATEGORIES_METADATA).forEach(catId => {
      const meta = CATEGORIES_METADATA[catId];
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      if (catId === activeAlbumCategory) {
        btn.classList.add("active");
      }
      btn.innerText = meta.name;
      
      btn.addEventListener("click", () => {
        activeAlbumCategory = catId;
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderAlbum();
      });
      
      albumCategoryFilters.appendChild(btn);
    });
  }

  function renderAlbum() {
    const stats = state.getStats();
    
    // Update progress elements
    albumProgressBar.style.width = `${stats.percentage}%`;
    albumProgressText.innerText = `${stats.pastedStandard + stats.pastedCustom}/${stats.totalStickersInAlbum} coladas (${stats.percentage}%)`;

    albumStickersGrid.innerHTML = "";

    // Gather all stickers matching category filters
    let pool = [];
    if (activeAlbumCategory === "all") {
      pool = [...STICKERS_DATABASE, ...state.state.customList];
    } else if (activeAlbumCategory === "custom") {
      pool = state.state.customList;
    } else {
      pool = STICKERS_DATABASE.filter(st => st.category === activeAlbumCategory);
    }

    if (pool.length === 0) {
      albumStickersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; border: 2px dashed var(--fg-color); border-radius: var(--radius-md); padding: 48px; text-align: center; background-color: white;">
          <span style="font-size: 40px; display: block; margin-bottom: 12px;">🎨</span>
          <h3 style="font-family: var(--font-headings); font-weight: 800;">Nenhuma figurinha nesta categoria</h3>
          <p style="font-size: 14px; color: var(--muted-fg-color); margin-top: 8px;">Crie suas próprias figurinhas customizadas ou abra pacotes para preencher esta aba!</p>
        </div>
      `;
      return;
    }

    pool.forEach(sticker => {
      const ownedItem = state.state.owned[sticker.id];
      const owned = !!ownedItem;
      const pasted = owned && ownedItem.pasted;
      const count = owned ? ownedItem.count : 0;
      
      // Calculate duplicate copies in hand
      const duplicatesCount = owned ? count - (pasted ? 1 : 0) : 0;
      const locked = !owned;

      const card = UI.createStickerCard(sticker, {
        locked,
        duplicatesCount,
        showActions: true,
        onAction: (st) => openStickerDetailModal(st, locked, duplicatesCount, pasted)
      });

      // Special visual accent for owned stickers not yet pasted
      if (owned && !pasted) {
        card.style.borderColor = "var(--accent-color)";
        card.style.boxShadow = "var(--pop-shadow-accent)";
        
        // Colar / Paste hover prompt
        const pasteOverlay = document.createElement("div");
        pasteOverlay.style.position = "absolute";
        pasteOverlay.style.inset = "0";
        pasteOverlay.style.backgroundColor = "rgba(139, 92, 246, 0.9)";
        pasteOverlay.style.borderRadius = "var(--radius-md)";
        pasteOverlay.style.display = "flex";
        pasteOverlay.style.flexDirection = "column";
        pasteOverlay.style.alignItems = "center";
        pasteOverlay.style.justify = "center";
        pasteOverlay.style.color = "white";
        pasteOverlay.style.opacity = "0";
        pasteOverlay.style.transition = "opacity 0.2s var(--ease-elastic)";
        pasteOverlay.style.zIndex = "5";
        pasteOverlay.style.justifyContent = "center";
        pasteOverlay.style.gap = "8px";
        
        pasteOverlay.innerHTML = `
          <i data-lucide="smile" style="width: 32px; height: 32px; stroke-width: 3px;"></i>
          <span style="font-family: var(--font-headings); font-weight: 800; font-size: 16px; text-transform: uppercase;">COLAR!</span>
        `;
        
        card.appendChild(pasteOverlay);
        
        card.addEventListener("mouseenter", () => { pasteOverlay.style.opacity = "1"; });
        card.addEventListener("mouseleave", () => { pasteOverlay.style.opacity = "0"; });
      }

      albumStickersGrid.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================
  // VIEW RENDERERS: 3. TRADING MARKETPLACE
  // ==========================================
  function renderMarket() {
    const stats = state.getStats();

    // 1. Render Owned Duplicates list
    marketDuplicatesGrid.innerHTML = "";

    const userDuplicates = STICKERS_DATABASE.filter(st => {
      const ownedItem = state.state.owned[st.id];
      if (!ownedItem) return false;
      const available = ownedItem.count - (ownedItem.pasted ? 1 : 0);
      return available > 0;
    });

    if (userDuplicates.length === 0) {
      marketDuplicatesGrid.style.display = "none";
      marketDuplicatesEmpty.style.display = "block";
    } else {
      marketDuplicatesGrid.style.display = "grid";
      marketDuplicatesEmpty.style.display = "none";

      userDuplicates.forEach(sticker => {
        const ownedItem = state.state.owned[sticker.id];
        const available = ownedItem.count - (ownedItem.pasted ? 1 : 0);

        const card = UI.createStickerCard(sticker, {
          locked: false,
          duplicatesCount: available,
          showActions: true,
          onAction: (st) => openStickerDetailModal(st, false, available, ownedItem.pasted)
        });

        // Shrink card visuals slightly to fit duplicate list
        card.style.transform = "scale(0.95)";
        card.style.minHeight = "190px";
        marketDuplicatesGrid.appendChild(card);
      });
    }

    // 2. Render active characters trades list
    marketTradesList.innerHTML = "";

    if (state.state.trades.length === 0) {
      marketTradesList.innerHTML = `
        <div style="border: 2px dashed var(--fg-color); border-radius: var(--radius-md); padding: 48px 24px; text-align: center; background-color: white;">
          <span style="font-size: 40px; display: block; margin-bottom: 12px;">🤝</span>
          <h4 style="font-family: var(--font-headings); font-weight: 800;">Nenhuma proposta ativa</h4>
          <p style="font-size: 13px; color: var(--muted-fg-color); max-width: 260px; margin: 8px auto 0;">O mercado está calmo. Duplicadas novas atraem ofertas!</p>
        </div>
      `;
      return;
    }

    state.state.trades.forEach(trade => {
      const tradeItem = document.createElement("div");
      tradeItem.className = "trade-item";

      // Dealer Details Header
      const dealerHeader = document.createElement("div");
      dealerHeader.className = "trade-dealer-info";
      
      const avatar = document.createElement("div");
      avatar.className = "dealer-avatar";
      avatar.innerText = trade.dealer.avatar;
      avatar.style.backgroundColor = `var(--${trade.offered.rarity === 'comum' ? 'muted-color' : trade.offered.rarity === 'raro' ? 'accent-color' : trade.offered.rarity === 'epico' ? 'secondary-color' : 'tertiary-color'})`;
      
      const name = document.createElement("div");
      name.className = "dealer-name";
      name.innerText = trade.dealer.name;

      dealerHeader.appendChild(avatar);
      dealerHeader.appendChild(name);
      tradeItem.appendChild(dealerHeader);

      // Exchange Cards Panel
      const exchangePanel = document.createElement("div");
      exchangePanel.className = "trade-exchange";

      const arrow = document.createElement("div");
      arrow.className = "exchange-arrow";
      arrow.innerHTML = `<i data-lucide="arrow-right-left" style="width:14px;height:14px;stroke-width:3px;color:var(--fg-color);"></i>`;
      exchangePanel.appendChild(arrow);

      // Giving card details
      const givingSide = document.createElement("div");
      givingSide.className = "exchange-side giving";
      givingSide.innerHTML = `
        <span class="exchange-label">Você dá:</span>
        <span class="exchange-sticker">${trade.wanted.emoji} ${trade.wanted.name}</span>
      `;
      
      // Receiving card details
      const receivingSide = document.createElement("div");
      receivingSide.className = "exchange-side receiving";
      receivingSide.innerHTML = `
        <span class="exchange-label">Você ganha:</span>
        <span class="exchange-sticker" style="color:var(--accent-color);">${trade.offered.emoji} ${trade.offered.name}</span>
      `;

      exchangePanel.appendChild(givingSide);
      exchangePanel.appendChild(receivingSide);
      tradeItem.appendChild(exchangePanel);

      // Description speech bubble text
      const speech = document.createElement("p");
      speech.style.fontSize = "13px";
      speech.style.fontStyle = "italic";
      speech.style.color = "var(--muted-fg-color)";
      speech.innerText = `"${trade.description}"`;
      tradeItem.appendChild(speech);

      // Trade Action button
      const ownedWanted = state.state.owned[trade.wanted.id];
      const available = ownedWanted ? ownedWanted.count - (ownedWanted.pasted ? 1 : 0) : 0;
      const canTrade = available > 0;

      const actionBtn = UI.createCandyButton(canTrade ? "ACEITAR TROCA 🤝" : "REQUISITO FALTANDO", {
        variant: canTrade ? "mint" : "secondary",
        customClass: "btn-trade-swap",
        onClick: () => {
          if (!canTrade) {
            UI.showToast(`Você não possui a figurinha repetida "${trade.wanted.name}" para trocar!`, "warning");
            return;
          }
          
          const result = state.executeTrade(trade.id);
          if (result.success) {
            UI.showToast(result.message, "success");
            UI.triggerConfetti();
            
            // Re-render
            renderMarket();
            renderNavigationStats();
          } else {
            UI.showToast(result.message, "warning");
          }
        }
      });
      
      if (!canTrade) {
        actionBtn.style.opacity = "0.5";
        actionBtn.style.cursor = "not-allowed";
      }

      tradeItem.appendChild(actionBtn);
      marketTradesList.appendChild(tradeItem);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================
  // VIEW RENDERERS: 4. STICKER CUSTOMIZER
  // ==========================================
  function setupCustomizerPickers() {
    // 1. Set up Color picker grid options
    customColorPicker.innerHTML = "";
    
    const colors = [
      { name: "Violet", val: "var(--accent-color)" },
      { name: "Pink", val: "var(--secondary-color)" },
      { name: "Yellow", val: "var(--tertiary-color)" },
      { name: "Mint", val: "var(--quaternary-color)" },
      { name: "Orange", val: "#F97316" } // Custom Coral Orange
    ];

    colors.forEach(col => {
      const opt = document.createElement("div");
      opt.className = "color-option";
      opt.style.backgroundColor = col.val;
      if (col.val === customStickerConfig.bg) {
        opt.classList.add("active");
      }

      opt.addEventListener("click", () => {
        document.querySelectorAll(".color-option").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        customStickerConfig.bg = col.val;
        updateCustomizerPreview();
      });

      customColorPicker.appendChild(opt);
    });

    // 2. Set up Shape picker buttons trigger
    document.querySelectorAll(".shape-option").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".shape-option").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        customStickerConfig.shape = btn.getAttribute("data-shape");
        updateCustomizerPreview();
      });
    });

    // 3. Set up Emoji selection list
    customEmojiPicker.innerHTML = "";
    
    const emojis = ["🦊", "🦖", "🐱", "🐶", "🎮", "🪙", "🧪", "⚔️", "👻", "🎨", "⭐", "⚡", "💎", "🌀", "☕", "🍕", "🚀", "🧠", "🔥", "🌈", "🍭", "🛸", "👾", "🦄"];
    
    emojis.forEach(emo => {
      const opt = document.createElement("div");
      opt.className = "emoji-option";
      opt.innerText = emo;
      if (emo === customStickerConfig.emoji) {
        opt.classList.add("active");
      }

      opt.addEventListener("click", () => {
        document.querySelectorAll(".emoji-option").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        customStickerConfig.emoji = emo;
        updateCustomizerPreview();
      });

      customEmojiPicker.appendChild(opt);
    });

    // 4. Set up name inputs event listeners
    customInputName.addEventListener("input", (e) => {
      let text = e.target.value.trim();
      if (text.length === 0) text = "Figurinha Pop";
      customStickerConfig.name = text;
      updateCustomizerPreview();
    });
  }

  function updateCustomizerPreview() {
    customPreviewName.innerText = customStickerConfig.name;
    customPreviewEmoji.innerText = customStickerConfig.emoji;
    
    // Update card background
    customPreviewCard.style.backgroundColor = customStickerConfig.bg;
    customPreviewShape.style.backgroundColor = customStickerConfig.bg;

    // Update shapes styles
    customPreviewCard.className = "sticker-preview";
    customPreviewShape.className = "sticker-visual-wrapper";

    if (customStickerConfig.shape === "bubble") {
      customPreviewCard.classList.add("shape-bubble");
      customPreviewShape.classList.add("shape-bubble");
    } else if (customStickerConfig.shape === "arch") {
      customPreviewCard.classList.add("shape-arch");
      customPreviewShape.classList.add("shape-arch");
    } else if (customStickerConfig.shape === "leaf") {
      customPreviewCard.classList.add("shape-leaf");
      customPreviewShape.classList.add("shape-leaf");
    } else if (customStickerConfig.shape === "circle") {
      customPreviewCard.style.borderRadius = "var(--radius-lg)";
      customPreviewShape.style.borderRadius = "var(--radius-full)";
    }
  }

  function renderCustomizer() {
    updateCustomizerPreview();
  }

  // Create customized sticker execution
  btnCreateSticker.addEventListener("click", () => {
    const created = state.createCustomSticker(
      customStickerConfig.name,
      customStickerConfig.emoji,
      customStickerConfig.bg,
      customStickerConfig.shape
    );

    UI.showToast(`Figurinha "${created.name}" criada com sucesso! 🎨`, "success");
    UI.triggerConfetti();

    // Reset Customizer inputs
    customInputName.value = "Figurinha Pop";
    customStickerConfig.name = "Figurinha Pop";
    customStickerConfig.emoji = "✨";
    customStickerConfig.shape = "bubble";
    customStickerConfig.bg = "var(--accent-color)";
    
    document.querySelectorAll(".emoji-option").forEach(o => {
      if (o.innerText === "✨") o.classList.add("active");
      else o.classList.remove("active");
    });
    
    document.querySelectorAll(".shape-option").forEach(b => {
      if (b.getAttribute("data-shape") === "bubble") b.classList.add("active");
      else b.classList.remove("active");
    });

    document.querySelectorAll(".color-option").forEach(o => {
      if (o.style.backgroundColor.includes("accent-color") || o.style.backgroundColor.includes("8B5CF6") || o.style.backgroundColor === "rgb(139, 92, 246)") {
        o.classList.add("active");
      } else {
        o.classList.remove("active");
      }
    });

    renderCustomizer();
    renderNavigationStats();
    
    // Redirect user to the album view displaying custom tab
    setTimeout(() => {
      activeAlbumCategory = "custom";
      setupAlbumFilters();
      switchTab("album");
    }, 1200);
  });

  // ==========================================
  // VIEW RENDERERS: 5. NAVIGATION COUNTS
  // ==========================================
  function renderNavigationStats() {
    const stats = state.getStats();
    statProgress.innerText = `${stats.percentage}%`;
    statDuplicates.innerText = stats.duplicates;
    statPacks.innerText = stats.packs;
  }

  // ==========================================
  // INTERACTIVE ACTION SYSTEM: BOOSTER PACK OPENER
  // ==========================================
  function openPackInteractive() {
    const stats = state.getStats();
    if (stats.packs <= 0) {
      UI.showToast("Você não possui pacotinhos booster em estoque! Aguarde o resgate diário ou faça trocas.", "warning");
      return;
    }

    // Reset modal stage
    packEnvelopeInteractive.style.display = "flex";
    packEnvelopeInteractive.classList.remove("tear-anim");
    revealedCardsTray.style.display = "none";
    revealedCardsTray.innerHTML = "";
    packOpeningFooter.style.display = "none";
    packOpeningPrompt.style.display = "block";
    packOpeningPrompt.innerText = "Dê um toque no envelope para abrir o pacote!";

    // Activate Overlay dialog
    modalPackOpener.classList.add("active");
  }

  // Bind modal closure
  modalPackClose.addEventListener("click", () => {
    modalPackOpener.classList.remove("active");
    // Trigger clean layout re-renders
    renderDashboard();
    renderNavigationStats();
  });

  btnOpenPack.addEventListener("click", openPackInteractive);
  dashboardPackTrigger.addEventListener("click", openPackInteractive);

  // Physical envelope click handler - coordinates animation choreography
  packEnvelopeInteractive.addEventListener("click", () => {
    if (packEnvelopeInteractive.classList.contains("tear-anim")) return;
    
    packEnvelopeInteractive.classList.add("tear-anim");
    packOpeningPrompt.innerText = "Abrindo pacote...";

    // Step 1: Tear-up transition delays
    setTimeout(() => {
      // Step 2: Open and calculate stickers roll
      const selection = state.openPack();
      
      if (!selection) {
        modalPackOpener.classList.remove("active");
        UI.showToast("Falha ao abrir pacote.", "warning");
        return;
      }

      // Hide envelope, trigger Confetti canvas Spray
      packEnvelopeInteractive.style.display = "none";
      UI.triggerConfetti();
      
      // Step 3: Populate and fanned-deal cards
      revealedCardsTray.innerHTML = "";
      revealedCardsTray.style.display = "flex";

      selection.forEach((st, index) => {
        const wrap = document.createElement("div");
        wrap.className = "revealed-card";
        
        // Give dynamic rotation fan offset
        const rot = (index - 1) * 6; // -6deg, 0deg, 6deg fanned
        wrap.style.setProperty("--deal-rot", `${rot}deg`);
        
        const card = UI.createStickerCard(st, { locked: false, showActions: false });
        wrap.appendChild(card);
        revealedCardsTray.appendChild(wrap);
      });

      // Initialize newly dealed Lucide Icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Step 4: Show closing confirm button
      packOpeningPrompt.innerText = "Parabéns! Você ganhou 3 figurinhas novas:";
      packOpeningFooter.style.display = "block";
      
      renderNavigationStats();

    }, 1200); // Wait for the tearing envelope keyframe sequence to finish
  });

  btnPackFinishConfirm.addEventListener("click", () => {
    modalPackOpener.classList.remove("active");
    renderDashboard();
    renderNavigationStats();
  });

  // ==========================================
  // INTERACTIVE ACTION SYSTEM: STICKER DETAILS
  // ==========================================
  let activeDetailsSticker = null;

  function openStickerDetailModal(sticker, locked, duplicatesCount, pasted) {
    activeDetailsSticker = sticker;
    
    // Update Details Dialog elements
    detailCardRarity.innerText = RARITY_METADATA[sticker.rarity].name;
    detailCardRarity.className = "";
    detailCardRarity.style.backgroundColor = `var(--${sticker.rarity === 'comum' ? 'muted-fg-color' : sticker.rarity === 'raro' ? 'accent-color' : sticker.rarity === 'epico' ? 'secondary-color' : 'tertiary-color'})`;
    if (sticker.rarity === 'comum' || sticker.rarity === 'raro') {
      detailCardRarity.style.color = "white";
    } else {
      detailCardRarity.style.color = "var(--fg-color)";
    }

    // Set details wrapper shape
    detailStickerWrapper.className = "sticker-visual-wrapper";
    if (sticker.shape === "bubble") {
      detailStickerWrapper.classList.add("shape-bubble");
    } else if (sticker.shape === "arch") {
      detailStickerWrapper.classList.add("shape-arch");
    } else if (sticker.shape === "leaf") {
      detailStickerWrapper.classList.add("shape-leaf");
    } else if (sticker.shape === "circle") {
      detailStickerWrapper.style.borderRadius = "var(--radius-full)";
    }

    if (!locked) {
      detailStickerWrapper.style.backgroundColor = sticker.bg;
      detailStickerWrapper.style.borderColor = "var(--fg-color)";
      detailStickerEmoji.innerText = sticker.emoji;
      detailStickerName.innerText = sticker.name;
      
      const categoryName = CATEGORIES_METADATA[sticker.category]?.name || "Pop";
      detailStickerCategory.innerText = `Categoria: ${categoryName} • #${sticker.id.split("-")[1] || "Custom"}`;
      detailStickerDescription.innerText = sticker.desc;
    } else {
      detailStickerWrapper.style.backgroundColor = "var(--muted-color)";
      detailStickerWrapper.style.borderColor = "var(--muted-fg-color)";
      detailStickerEmoji.innerText = "🔒";
      detailStickerName.innerText = "Bloqueada";
      detailStickerCategory.innerText = "Desbloqueie abrindo pacotes";
      detailStickerDescription.innerText = "Você ainda não encontrou esta figurinha sensorial em seus pacotes. Continue rasgando envelopes ou realize trocas na banca com amigos!";
    }

    // Action button state logic
    if (locked) {
      btnPasteStickerAction.disabled = true;
      btnPasteStickerAction.style.opacity = "0.5";
      btnPasteStickerAction.style.cursor = "not-allowed";
      btnPasteStickerAction.innerHTML = `FALTA NA COLEÇÃO 🔒`;
    } else if (pasted) {
      btnPasteStickerAction.disabled = true;
      btnPasteStickerAction.style.opacity = "0.5";
      btnPasteStickerAction.style.cursor = "not-allowed";
      btnPasteStickerAction.innerHTML = `JÁ COLADA NO ÁLBUM ✓`;
    } else {
      btnPasteStickerAction.disabled = false;
      btnPasteStickerAction.style.opacity = "1";
      btnPasteStickerAction.style.cursor = "pointer";
      btnPasteStickerAction.innerHTML = `COLAR NO ÁLBUM <span class="btn-icon-circle"><i data-lucide="check"></i></span>`;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    modalStickerDetails.classList.add("active");
  }

  // Paste action trigger
  btnPasteStickerAction.addEventListener("click", () => {
    if (activeDetailsSticker) {
      const pasted = state.pasteSticker(activeDetailsSticker.id);
      if (pasted) {
        modalStickerDetails.classList.remove("active");
        UI.showToast(`Figurinha colada com sucesso! 🎉`, "success");
        UI.triggerConfetti();
        
        // Refresh views
        renderAlbum();
        renderNavigationStats();
      }
    }
  });

  modalDetailsClose.addEventListener("click", () => {
    modalStickerDetails.classList.remove("active");
  });

  // Global State Listener binding - guarantees synchronization
  state.subscribe(() => {
    renderNavigationStats();
  });

  // ==========================================
  // INITIALIZATIONS & BOOTSTRAP
  // ==========================================
  setupAlbumFilters();
  setupCustomizerPickers();
  renderNavigationStats();
  
  // Render current tab (Dashboard on landing)
  switchTab("dashboard");

  // Initial Lucide Icons parsing
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
