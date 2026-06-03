// --- REUSABLE UI COMPONENTS ENGINE ---

const UI = {
  // 1. Sticker Card Component
  createStickerCard(sticker, options = {}) {
    const {
      locked = false,
      duplicatesCount = 0,
      showActions = false,
      onAction = null
    } = options;

    const card = document.createElement("div");
    card.className = `card-sticker ${sticker.rarity}`;
    card.id = `card-${sticker.id}`;
    
    if (locked) {
      card.classList.add("locked");
    }

    // Add duplication count
    if (duplicatesCount > 0) {
      card.classList.add("duplicate-pill");
      card.setAttribute("data-duplicates", duplicatesCount);
    }

    // Rarity and category header badge
    const badgeText = locked ? "???" : RARITY_METADATA[sticker.rarity].name;
    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.innerText = badgeText;
    badge.style.backgroundColor = locked ? "var(--muted-color)" : `var(--${sticker.rarity === 'comum' ? 'muted-fg-color' : sticker.rarity === 'raro' ? 'accent-color' : sticker.rarity === 'epico' ? 'secondary-color' : 'tertiary-color'})`;
    if (sticker.rarity === 'comum' || sticker.rarity === 'raro') {
      badge.style.color = "white";
    } else {
      badge.style.color = "var(--fg-color)";
    }
    card.appendChild(badge);

    // Visual emoji shape wrapper
    const visualWrapper = document.createElement("div");
    visualWrapper.className = "sticker-visual-wrapper";
    
    // Asymmetric shapes
    if (sticker.shape === "bubble") {
      visualWrapper.classList.add("shape-bubble");
    } else if (sticker.shape === "arch") {
      visualWrapper.classList.add("shape-arch");
    } else if (sticker.shape === "leaf") {
      visualWrapper.classList.add("shape-leaf");
    } else if (sticker.shape === "circle") {
      visualWrapper.style.borderRadius = "var(--radius-full)";
    }

    // Colors
    if (!locked) {
      visualWrapper.style.backgroundColor = sticker.bg;
      visualWrapper.style.borderColor = "var(--fg-color)";
    } else {
      visualWrapper.style.backgroundColor = "var(--muted-color)";
      visualWrapper.style.borderColor = "var(--muted-fg-color)";
    }

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "sticker-emoji";
    emojiSpan.innerText = locked ? "🔒" : sticker.emoji;
    visualWrapper.appendChild(emojiSpan);
    card.appendChild(visualWrapper);

    // Bottom descriptions
    const infoContainer = document.createElement("div");
    infoContainer.style.width = "100%";

    const name = document.createElement("div");
    name.className = "sticker-name";
    name.innerText = locked ? "Bloqueada" : sticker.name;
    infoContainer.appendChild(name);

    const meta = document.createElement("div");
    meta.className = "sticker-meta";
    
    if (locked) {
      meta.innerText = "Desbloqueie abrindo pacotes";
    } else {
      const categoryName = CATEGORIES_METADATA[sticker.category]?.name || "Pop";
      meta.innerText = `${categoryName} • #${sticker.id.split("-")[1] || "Custom"}`;
    }
    infoContainer.appendChild(meta);
    card.appendChild(infoContainer);

    // Optional click action info or drag trigger
    if (!locked && showActions && onAction) {
      card.addEventListener("click", () => onAction(sticker));
    }

    return card;
  },

  // 2. Candy Button Helper
  createCandyButton(text, options = {}) {
    const {
      variant = "primary", // primary, secondary, pink, mint
      icon = null,         // Lucide icon name, e.g., 'sparkles'
      onClick = null,
      customClass = ""
    } = options;

    const btn = document.createElement("button");
    btn.className = `btn-candy ${customClass}`;
    
    if (variant === "secondary") {
      btn.classList.add("btn-candy-secondary");
    } else if (variant === "pink") {
      btn.classList.add("btn-candy-pink");
    } else if (variant === "mint") {
      btn.classList.add("btn-candy-mint");
    }

    btn.innerText = text;

    if (icon) {
      const iconWrapper = document.createElement("span");
      iconWrapper.className = "btn-icon-circle";
      iconWrapper.innerHTML = `<i data-lucide="${icon}"></i>`;
      btn.appendChild(iconWrapper);
    }

    if (onClick) {
      btn.addEventListener("click", onClick);
    }

    return btn;
  },

  // 3. Toaster Notification System
  showToast(text, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-box ${type}`;
    
    let icon = "check-circle";
    if (type === "info") icon = "info";
    if (type === "warning") icon = "alert-triangle";
    
    toast.innerHTML = `
      <i data-lucide="${icon}" style="stroke-width: 3px;"></i>
      <span>${text}</span>
    `;
    
    container.appendChild(toast);
    
    // Initialize Lucide icons on toast
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Slide out after 3 seconds
    setTimeout(() => {
      toast.style.animation = "toastPopIn 0.3s ease reverse forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  },

  // 4. Confetti Engine on Canvas
  triggerConfetti() {
    let canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "confetti-canvas";
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#8B5CF6", "#F472B6", "#FBBF24", "#34D399", "#1E293B"];
    const shapes = ["circle", "triangle", "rectangle"];
    const particles = [];

    // Resize listener
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }, { once: true });

    // Populate particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height / 2 + (Math.random() - 0.5) * 80,
        size: Math.random() * 8 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.7) * 16 - 8,
        gravity: 0.4,
        drag: 0.98,
        opacity: 1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let active = false;

      particles.forEach(p => {
        if (p.opacity <= 0) return;
        
        active = true;
        
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = "#1E293B";
        ctx.lineWidth = 1.5;

        // Draw geometric shapes
        ctx.beginPath();
        if (p.shape === "circle") {
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        } else if (p.shape === "triangle") {
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
        } else {
          // Rectangle
          ctx.rect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.angle += p.spin;

        // Fade out as it hits lower half of screen
        if (p.y > canvas.height * 0.7) {
          p.opacity -= 0.02;
        }
      });

      if (active) {
        requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    }

    draw();
  }
};
