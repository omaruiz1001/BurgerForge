/* ── 1. DATOS DEL MENÚ ──────────────────────────────────── */

const PRODUCTS = [
  {
    id: 1,
    name: "Clásica Forge",
    badge: "Best Seller",
    desc: "Carne Angus 180g, queso cheddar madurado, lechuga fresca, tomate y nuestra salsa secreta de la casa.",
    price: 28,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    alt: "Hamburguesa Clásica Forge con queso cheddar",
  },
  {
    id: 2,
    name: "BBQ Bacon",
    badge: "Favorita",
    desc: "Doble carne ahumada, bacon crujiente, aros de cebolla caramelizada, pepinillos y salsa BBQ artesanal.",
    price: 35,
    img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80",
    alt: "Hamburguesa BBQ Bacon doble con bacon crujiente",
  },
  {
    id: 3,
    name: "Veggie Master",
    badge: "Vegano",
    desc: "Medallón de garbanzos y quinoa, aguacate fresco, rúcula, tomate cherry y alioli de hierbas.",
    price: 26,
    img: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80",
    alt: "Hamburguesa Veggie Master vegana con aguacate",
  },
  {
    id: 4,
    name: "Forge Royal",
    badge: "Premium",
    desc: "Carne Angus, huevo frito, jamón ahumado, queso edam, papas al hilo y mayonesa artesanal.",
    price: 32,
    img: "https://plus.unsplash.com/premium_photo-1675252369719-dd52bc69c3df?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Hamburguesa Royal con huevo y queso",
  },
];

/* ── ESTADO ── */
const cart = new Map();
const DELIVERY_FEE = 5;
const WA_NUMBER = "51944207031"; // ← cambia este número por el del cliente

/* ── 2. ESTADO DEL CARRITO ──────────────────────────────── */
const cartBtn = document.getElementById("cart-btn");
const cartCountEl = document.getElementById("cart-count");
const drawerEl = document.getElementById("cart-drawer");
const overlayEl = document.getElementById("drawer-overlay");
const drawerClose = document.getElementById("drawer-close");
const drawerItems = document.getElementById("drawer-items");
const drawerCount = document.getElementById("drawer-count");
const subtotalEl = document.getElementById("subtotal");
const totalPriceEl = document.getElementById("total-price");
const whatsappBtn = document.getElementById("whatsapp-btn");
const clearBtn = document.getElementById("clear-btn");
const toastEl = document.getElementById("toast");
const toastMsgEl = document.getElementById("toast-msg");
const waFloatBtn = document.getElementById("wa-float-btn");

let toastTimeout; // Para controlar el tiempo del toast

function openDrawer() {
  drawerEl.classList.add("open");
  overlayEl.classList.add("active");
  document.body.classList.add("drawer-open");
  cartBtn.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  drawerEl.classList.remove("open");
  overlayEl.classList.remove("active");
  document.body.classList.remove("drawer-open");
  cartBtn.setAttribute("aria-expanded", "false");
}
cartBtn.addEventListener("click", openDrawer);
drawerClose.addEventListener("click", closeDrawer);
overlayEl.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// Logica del carrito
function addToCart(productId, customPrice = null) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  // Si viene un precio personalizado (desde el modal) lo usamos,
  // si no, usamos el precio base del producto
  const finalPrice = customPrice !== null ? customPrice : product.price;

  if (cart.has(productId)) {
    const item = cart.get(productId);
    item.qty++;
    // Actualizamos el precio al último seleccionado
    item.price = finalPrice;
  } else {
    cart.set(productId, { product, qty: 1, price: finalPrice });
  }

  updateCartUI();
  showToast(`"${product.name}" agregado 🍔`);
}

function changeQty(productId, delta) {
  if (!cart.has(productId)) return;
  const item = cart.get(productId);
  item.qty += delta;
  if (item.qty <= 0) cart.delete(productId);
  updateCartUI();
}
function clearCart() {
  cart.clear();
  updateCartUI();
}

function updateCartUI() {
  const items = [...cart.values()];
  const totalQty = items.reduce((a, i) => a + i.qty, 0);
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal + (subtotal > 0 ? DELIVERY_FEE : 0);

  cartCountEl.textContent = totalQty;
  drawerCount.textContent = `${totalQty} item${totalQty !== 1 ? "s" : ""}`;
  subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
  totalPriceEl.textContent = `S/ ${total.toFixed(2)}`;
  whatsappBtn.disabled = totalQty === 0;
  clearBtn.style.display = totalQty === 0 ? "none" : "block";

  cartCountEl.classList.add("bump");
  setTimeout(() => cartCountEl.classList.remove("bump"), 300);

  renderDrawerItems(items);
}

function renderDrawerItems(items) {
  if (items.length === 0) {
    drawerItems.innerHTML = `
      <div class="drawer__empty">
        <span class="drawer__empty-icon">🛒</span>
        <p>Tu carrito está vacío.</p>
        <p style="font-size:0.8rem;color:var(--muted)">Agrega algo del menú 🍔</p>
      </div>`;
    return;
  }
  drawerItems.innerHTML = items
    .map(
      ({ product, qty, price }) => `
    <div class="cart-item">
      <img class="cart-item__img" src="${product.img}" alt="${product.alt}" loading="lazy"/>
      <div>
        <p class="cart-item__name">${product.name}</p>
        <p class="cart-item__price">S/ ${(price * qty).toFixed(2)}</p>      
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn minus" data-id="${product.id}" data-delta="-1">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn plus" data-id="${product.id}" data-delta="1">+</button>
      </div>
    </div>`,
    )
    .join("");
}

drawerItems.addEventListener("click", (e) => {
  const btn = e.target.closest(".qty-btn");
  if (!btn) return;
  changeQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta));
});

clearBtn.addEventListener("click", clearCart);

function buildWhatsAppURL() {
  const items = [...cart.values()];
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal + DELIVERY_FEE;
  const lines = [
    "🍔 *Pedido — Burger Forge*",
    "─────────────────────",
    ...items.map(
      ({ product, qty, price }) =>
        `• ${product.name} x${qty} — S/ ${(price * qty).toFixed(2)}`,
    ),
    "─────────────────────",
    `📦 Delivery: S/ ${DELIVERY_FEE.toFixed(2)}`,
    `💰 *Total: S/ ${total.toFixed(2)}*`,
    "",
    "📍 Por favor indícame tu dirección. ¡Gracias!",
  ];
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
whatsappBtn.addEventListener("click", () => {
  if (cart.size) window.open(buildWhatsAppURL(), "_blank");
});
waFloatBtn.addEventListener("click", () => {
  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("¡Hola! Me gustaría hacer un pedido 🍔")}`,
    "_blank",
  );
});

function showToast(msg) {
  clearTimeout(toastTimeout);
  toastMsgEl.textContent = msg;
  toastEl.classList.add("show");
  toastTimeout = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

function renderMenu() {
  const grid = document.getElementById("menu-grid");
  PRODUCTS.forEach((product) => {
    const card = document.createElement("article");
    card.className = "menu-card";
    card.setAttribute("role", "listitem");
    card.innerHTML = `
      <div class="menu-card__img-wrap">
        <img src="${product.img}" alt="${product.alt}" loading="lazy" width="600" height="220"/>
        <span class="menu-card__badge">${product.badge}</span>
      </div>
      <div class="menu-card__body">
        <h3 class="menu-card__name">${product.name}</h3>
        <p class="menu-card__desc">${product.desc}</p>
        <div class="menu-card__footer">
          <div class="menu-card__price">S/ ${product.price}<span>.00</span></div>
          <button class="add-btn" data-id="${product.id}" aria-label="Ver detalle de ${product.name}">
          Ver detalle          
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}
document.getElementById("menu-grid").addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const product = PRODUCTS.find((p) => p.id === parseInt(btn.dataset.id));
  if (product) openModal(product);
});

/* ════ ANIMACIONES DE SCROLL — Intersection Observer ════ */

/*
 * Intersection Observer detecta cuando un elemento
 * entra en el viewport y le agrega la clase .visible
 * que dispara la animación CSS.
 */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Una vez animado, dejamos de observarlo
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15, // se activa cuando el 15% del elemento es visible
  },
);

/*
 * Aplicamos la clase .reveal y los delays a los elementos
 * que queremos animar. Lo hacemos después de renderMenu()
 * para que las tarjetas ya existan en el DOM.
 */
function initScrollAnimations() {
  // Tarjetas del menú — efecto escalonado
  document.querySelectorAll(".menu-card").forEach((card, index) => {
    card.classList.add("reveal");
    if (index % 3 === 1) card.classList.add("reveal-delay-1");
    if (index % 3 === 2) card.classList.add("reveal-delay-2");
    observer.observe(card);
  });

  // Tarjetas de reseñas — efecto escalonado
  document.querySelectorAll(".review-card").forEach((card, index) => {
    card.classList.add("reveal");
    if (index % 3 === 1) card.classList.add("reveal-delay-1");
    if (index % 3 === 2) card.classList.add("reveal-delay-2");
    observer.observe(card);
  });

  // Tarjetas de info (horarios y ubicación)
  document.querySelectorAll(".info-card").forEach((card, index) => {
    card.classList.add("reveal");
    if (index === 1) card.classList.add("reveal-delay-1");
    observer.observe(card);
  });

  // Títulos de secciones
  document.querySelectorAll(".section-title").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
  // Elementos de la sección about
  document
    .querySelectorAll(".about__img-wrap, .about__content")
    .forEach((el, index) => {
      if (!el.classList.contains("reveal")) return; // ya tiene reveal desde el HTML
      observer.observe(el);
    });

  // Para los que ya tienen reveal en el HTML
  document.querySelectorAll(".reveal").forEach((el) => {
    observer.observe(el);
  });
}

/* ════ DATOS Y RENDERIZADO DE RESEÑAS ════ */
const REVIEWS = [
  {
    name: "Carlos M.",
    initials: "CM",
    avatar: "avatar-orange",
    stars: 5,
    date: "Hace 2 días",
    text: "La BBQ Bacon es simplemente perfecta. La carne jugosa y el bacon crujiente hacen una combinación que no había probado igual en Lima.",
  },
  {
    name: "Valeria R.",
    initials: "VR",
    avatar: "avatar-pink",
    stars: 5,
    date: "Hace 1 semana",
    text: "Vine por la Veggie Master sin muchas expectativas y me sorprendió. Se nota que usan ingredientes frescos. Ya la pedí tres veces esta semana.",
  },
  {
    name: "Diego T.",
    initials: "DT",
    avatar: "avatar-blue",
    stars: 4,
    date: "Hace 2 semanas",
    text: "El ambiente es genial y las hamburguesas están a otro nivel. El delivery llegó rápido y caliente. Le faltó un poco más de salsa pero igual estaba riquísima.",
  },
  {
    name: "Sofía L.",
    initials: "SL",
    avatar: "avatar-green",
    stars: 5,
    date: "Hace 3 semanas",
    text: "La Clásica Forge tiene la salsa secreta más adictiva que he probado. Ya la recomendé a toda mi oficina y todos quedaron encantados.",
  },
  {
    name: "Rodrigo P.",
    initials: "RP",
    avatar: "avatar-purple",
    stars: 5,
    date: "Hace 1 mes",
    text: "Pedí por WhatsApp y fue súper fácil. En 30 minutos tenía mi pedido en la puerta. Sin duda el mejor delivery de hamburguesas de Miraflores.",
  },
  {
    name: "Camila F.",
    initials: "CF",
    avatar: "avatar-orange",
    stars: 4,
    date: "Hace 1 mes",
    text: "Las papas que vienen con el combo están espectaculares. La próxima vez quiero probar la BBQ Bacon. El precio es muy justo para la calidad que ofrecen.",
  },
];

function renderReviews() {
  const grid = document.getElementById("reviews-grid");

  REVIEWS.forEach((review) => {
    const stars = Array(review.stars)
      .fill('<span class="star">★</span>')
      .join("");

    const card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("role", "listitem");

    card.innerHTML = `
      <div class="review-card__stars" aria-label="${review.stars} de 5 estrellas">
        ${stars}
      </div>
      <p class="review-card__text">${review.text}</p>
      <div class="review-card__author">
        <div class="review-card__avatar ${review.avatar}" aria-hidden="true">
          ${review.initials}
        </div>
        <div>
          <p class="review-card__name">${review.name}</p>
          <p class="review-card__date">${review.date}</p>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ════ MODAL DE PRODUCTO ════ */

const SIZES = [
  { label: "Individual", extra: 0 },
  { label: "Doble carne", extra: 8 },
];

const EXTRAS = [
  { label: "Bacon extra", price: 4 },
  { label: "Queso extra", price: 3 },
  { label: "Aguacate", price: 4 },
  { label: "Huevo frito", price: 3 },
  { label: "Aros de cebolla", price: 3 },
  { label: "Salsa especial", price: 2 },
];

/* Referencias del modal */
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalImg = document.getElementById("modal-img");
const modalBadge = document.getElementById("modal-badge");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalDesc = document.getElementById("modal-desc");
const modalSizes = document.getElementById("modal-sizes");
const modalExtras = document.getElementById("modal-extras");
const modalTotal = document.getElementById("modal-total");
const modalAddBtn = document.getElementById("modal-add-btn");

let activeProduct = null; // producto actualmente en el modal
let selectedSize = SIZES[0]; // tamaño seleccionado por defecto

/* Abre el modal con los datos del producto */
function openModal(product) {
  activeProduct = product;
  selectedSize = SIZES[0];

  /* Llenar datos básicos */
  modalImg.src = product.img;
  modalImg.alt = product.alt;
  modalBadge.textContent = product.badge;
  modalName.textContent = product.name;
  modalPrice.textContent = `S/ ${product.price}.00`;
  modalDesc.textContent = product.desc;

  /* Renderizar opciones de tamaño */
  modalSizes.innerHTML = SIZES.map(
    (size, i) => `
    <button
      class="option-btn ${i === 0 ? "selected" : ""}"
      data-size-index="${i}"
    >
      ${size.label}
      ${size.extra > 0 ? `<span style="color:var(--orange);font-size:0.78rem"> +S/${size.extra}</span>` : ""}
    </button>
  `,
  ).join("");

  /* Renderizar extras */
  modalExtras.innerHTML = EXTRAS.map(
    (extra, i) => `
    <label class="extra-item">
      <input type="checkbox" data-extra-index="${i}" />
      <div class="extra-item__info">
        <p class="extra-item__name">${extra.label}</p>
        <p class="extra-item__price">+S/ ${extra.price}.00</p>
      </div>
    </label>
  `,
  ).join("");

  updateModalTotal();

  /* Mostrar */
  modalOverlay.classList.add("active");
  document.body.classList.add("drawer-open");
}

/* Cierra el modal */
function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.classList.remove("drawer-open");
  activeProduct = null;
}

/* Recalcula el total según tamaño y extras seleccionados */
function updateModalTotal() {
  if (!activeProduct) return;

  const extrasTotal = [...modalExtras.querySelectorAll("input:checked")].reduce(
    (acc, input) => acc + EXTRAS[parseInt(input.dataset.extraIndex)].price,
    0,
  );

  const total = activeProduct.price + selectedSize.extra + extrasTotal;
  modalTotal.textContent = `S/ ${total.toFixed(2)}`;
}

/* Eventos del modal */
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

/* Cambio de tamaño */
modalSizes.addEventListener("click", (e) => {
  const btn = e.target.closest(".option-btn");
  if (!btn) return;
  modalSizes
    .querySelectorAll(".option-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedSize = SIZES[parseInt(btn.dataset.sizeIndex)];
  updateModalTotal();
});

/* Cambio de extras */
modalExtras.addEventListener("change", updateModalTotal);

/* Botón agregar al carrito desde el modal */
modalAddBtn.addEventListener("click", () => {
  if (!activeProduct) return;

  // Calculamos el precio final con tamaño + extras
  const extrasTotal = [...modalExtras.querySelectorAll("input:checked")].reduce(
    (acc, input) => acc + EXTRAS[parseInt(input.dataset.extraIndex)].price,
    0,
  );

  const finalPrice = activeProduct.price + selectedSize.extra + extrasTotal;

  // Le pasamos el precio calculado a addToCart
  addToCart(activeProduct.id, finalPrice);
  closeModal();
});

/* ════ BOTÓN VOLVER ARRIBA ════ */
const backTopBtn = document.getElementById('back-top');

// Mostrar el botón cuando el usuario baja más de 400px
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backTopBtn.classList.add('visible');
  } else {
    backTopBtn.classList.remove('visible');
  }
}, { passive: true });

// Al hacer clic sube suavemente al inicio
backTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Llamar después de que el menú ya está renderizado

/* ── INIT ── */
renderMenu();
renderReviews();
updateCartUI();
initScrollAnimations();
