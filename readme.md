# Tienda Aura 🛍️

Proyecto final del curso **Front-end + JavaScript**.  
Consiste en un sitio web de e-commerce simple que muestra productos destacados, un catálogo dinámico consumido desde una API REST, un formulario de contacto funcional y un carrito de compras con persistencia en el navegador.

---

## ⚙️ Tecnologías utilizadas

- **HTML5** (estructura semántica: `header`, `nav`, `main`, `section`, `footer`)
- **CSS3** (variables, Flexbox, Grid, media queries)
- **JavaScript** (DOM, `fetch`, `localStorage`)
- **Google Fonts** (`Poppins`)
- **Font Awesome** (íconos)
- **Formspree** (envío del formulario de contacto)
- **Google Maps + YouTube** (contenido multimedia embebido)

---

## 📄 Estructura del proyecto

- `index.html`: página principal
  - Header y navegación interna
  - Sección **Productos destacados**
  - Sección **Video** (YouTube embed)
  - Sección **Reseñas** (grid con estrellas)
  - Sección **Ubicación** (Google Maps embed)
  - Sección **Contacto** (formulario con Formspree)
  - Carrito lateral (drawer) compartido con el resto del sitio
- `productos.html`: catálogo completo
  - Header + nav
  - Sección de productos generados dinámicamente en `#apiProducts`
  - Carrito lateral
- `style.css`: estilos globales del sitio
  - Variables de color y tipografía
  - Layout responsivo con Flexbox y Grid
  - Estilos para cards, reseñas, mapa, formulario y carrito
- `script.js`: lógica del sitio
  - Validación y envío del formulario
  - Manejo del carrito de compras (agregar, editar cantidades, eliminar, vaciar, total dinámico)
  - Persistencia del carrito en `localStorage`
  - Consumo de API REST con `fetch` para el catálogo
  - Render dinámico de productos en el DOM

---

## 🌐 Catálogo dinámico (API REST)

En `productos.html`, la grilla de productos se genera desde JavaScript consumiendo la API pública:

```js
fetch('https://fakestoreapi.com/products?limit=12')
  .then((res) => res.json())
  .then((data) => {
    // Render de cards en #apiProducts
  });
