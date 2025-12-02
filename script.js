// ===================================================
// Tienda Aura - script.js
// DOM, validación de formulario, Fetch API,
// carrito dinámico con localStorage, contador, edición, etc.
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  normalizeSpacesOnBlur();
  setupForm();          // Validación + envío con Formspree
  setupCart();          // Carrito compartido entre páginas
  setupStaticButtons(); // Botones "Agregar" de productos estáticos (index)
  setupApiProducts();   // Catálogo dinámico con fetch (productos.html)
});


// ------------------------
// Utilidades generales
// ------------------------

// Año automático en el footer
function setYear() {
  const span = document.getElementById('year');
  if (span) span.textContent = new Date().getFullYear();
}

// Normalizar espacios en inputs de texto y textarea
function normalizeSpacesOnBlur() {
  const normalize = (s) => s.replace(/\s+/g, ' ').trim();

  document.addEventListener(
    'blur',
    (e) => {
      if (e.target.matches('input[type="text"], textarea')) {
        e.target.value = normalize(e.target.value);
      }
    },
    true // captura, así funciona también si el foco se va fuera del form
  );
}

// Formatear dinero
function money(value) {
  return '$' + Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
  });
}


// ------------------------
// Formulario de contacto
// ------------------------

function setupForm() {
  const form = document.getElementById('formAura');
  const status = document.getElementById('form-status');

  // Si esta página no tiene formulario, no hacemos nada
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const asunto = form.asunto.value.trim();
    const mensaje = form.mensaje.value.trim();

    // Validaciones DOM (campos requeridos)
    if (!nombre || !email || !asunto || !mensaje) {
      status.textContent = '⚠️ Todos los campos son obligatorios.';
      status.className = 'form-status status-warning';
      return;
    }

    // Validación formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      status.textContent = '⚠️ Ingresá un correo electrónico válido.';
      status.className = 'form-status status-warning';
      return;
    }

    status.textContent = 'Enviando mensaje...';
    status.className = 'form-status status-sending';

    const data = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        form.reset();
        status.textContent =
          '✅ ¡Gracias! Tu mensaje fue enviado correctamente.';
        status.className = 'form-status status-success';
      } else {
        status.textContent =
          '⚠️ Hubo un problema al enviar el mensaje. Probá nuevamente.';
        status.className = 'form-status status-warning';
      }
    } catch (error) {
      console.error(error);
      status.textContent =
        '❌ Error de conexión. Revisá tu conexión a internet.';
      status.className = 'form-status status-error';
    }
  });
}


// ------------------------
// Carrito de compras
// ------------------------

const CART_KEY = 'auraCart';
const WHATSAPP_NUM = '5491157804951'; // Podés cambiarlo por tu número

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Configura todo el carrito (drawer, botones, contador, etc.)
function setupCart() {
  const openBtn = document.getElementById('openCart');
  const closeBtn = document.getElementById('closeCart');
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');

  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');
  const clearBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkout');

  // Si la página no tiene carrito, salimos
  if (
    !drawer ||
    !itemsEl ||
    !totalEl ||
    !countEl ||
    !clearBtn ||
    !checkoutBtn
  ) {
    return;
  }

  // Refrescar UI según el contenido del carrito
  function refreshUI() {
    const cart = readCart();

    if (cart.length === 0) {
      itemsEl.innerHTML =
        '<p style="color: var(--muted);">Tu carrito está vacío.</p>';
    } else {
      itemsEl.innerHTML = cart
        .map(
          (item, index) => `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.name}">
          <div class="cart-item__info">
            <strong>${item.name}</strong>
            <span class="cart-item__price">${money(
              item.price
            )} c/u</span>
            <div class="cart-qty">
              <button class="qty-btn" data-idx="${index}" data-act="dec">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-idx="${index}" data-act="inc">+</button>
              <button class="remove-btn" data-idx="${index}" data-act="del">Quitar</button>
            </div>
          </div>
        </div>
      `
        )
        .join('');
    }

    const total = cart.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );
    totalEl.textContent = money(total);

    const units = cart.reduce((acc, item) => acc + item.qty, 0);
    countEl.textContent = units;

    checkoutBtn.disabled = cart.length === 0;
  }

  function openCartDrawer() {
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.hidden = true;
    document.body.style.overflow = '';
  }

  // Función global para agregar productos al carrito
  window.auraAddToCart = function ({ name, price, img }) {
    const cart = readCart();
    const existing = cart.find((item) => item.name === name);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, img, qty: 1 });
    }

    writeCart(cart);
    refreshUI();
    openCartDrawer();
  };

  // Eventos de apertura/cierre
  if (openBtn) openBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);

  // Eventos dentro del contenedor de ítems
  itemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const idx = Number(btn.dataset.idx);
    const act = btn.dataset.act;
    const cart = readCart();
    if (!cart[idx]) return;

    if (act === 'inc') cart[idx].qty += 1;
    if (act === 'dec') cart[idx].qty = Math.max(1, cart[idx].qty - 1);
    if (act === 'del') cart.splice(idx, 1);

    writeCart(cart);
    refreshUI();
  });

  // Vaciar carrito
  clearBtn.addEventListener('click', () => {
    writeCart([]);
    refreshUI();
  });

  // Simular compra: generar un mensaje para WhatsApp
  checkoutBtn.addEventListener('click', () => {
    const cart = readCart();
    if (cart.length === 0) return;

    const total = cart.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    const lines = [
      'Hola, quiero seguir esta compra con un vendedor de Tienda Aura:',
      '',
      ...cart.map(
        (item) =>
          `• ${item.name} x${item.qty} = ${money(item.price * item.qty)}`
      ),
      '',
      `Total estimado: ${money(total)}`,
      '',
      '¿Me ayudás a coordinar el pedido? 🙂',
    ];

    const text = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${WHATSAPP_NUM}?text=${text}`;
    window.open(url, '_blank');
  });

  // Inicializar UI con lo que haya en localStorage
  refreshUI();
}


// ------------------------
// Botones "Agregar" estáticos
// (index.html → Productos Destacados)
// ------------------------

function setupStaticButtons() {
  const buttons = document.querySelectorAll('.add-to-cart');
  if (!buttons.length || !window.auraAddToCart) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.card');
      if (!card) return;

      const name = card.dataset.name;
      const price = Number(card.dataset.price);
      const img = card.dataset.img;

      window.auraAddToCart({ name, price, img });
    });
  });
}


// ------------------------
// Catálogo dinámico con Fetch API
// (productos.html → #apiProducts)
// ------------------------

async function setupApiProducts() {
  const grid = document.getElementById('apiProducts');
  if (!grid) return; // Si no existe, esta página no es la del catálogo

  grid.innerHTML =
    '<p style="color: var(--muted); text-align:center;">Cargando productos...</p>';

  try {
    // API pública de prueba
    const res = await fetch('https://fakestoreapi.com/products?limit=12');

    if (!res.ok) {
      throw new Error('Error al obtener productos');
    }

    const data = await res.json();

    // Render en el DOM en forma de cards
    grid.innerHTML = data
      .map(
        (prod) => `
      <article class="card"
               data-name="${prod.title}"
               data-price="${prod.price}"
               data-img="${prod.image}">
        <img src="${prod.image}" alt="${prod.title}">
        <div class="card__body">
          <h3>${prod.title}</h3>
          <p>${money(prod.price)}</p>
          <div class="card__actions">
            <button class="btn btn--ghost" type="button">Ver más</button>
            <button class="btn btn--primary add-to-cart" type="button">Agregar</button>
          </div>
        </div>
      </article>
    `
      )
      .join('');

    // Conectar los botones "Agregar" de estos productos dinámicos
    setupStaticButtons();
  } catch (error) {
    console.error(error);
    grid.innerHTML =
      '<p style="color:#ff8080; text-align:center;">No se pudieron cargar los productos. Recargá la página más tarde.</p>';
  }
}
// Forzar scroll al top cuando se clickea Inicio
document.querySelectorAll('a[href="#inicio"], a[href="index.html#inicio"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
