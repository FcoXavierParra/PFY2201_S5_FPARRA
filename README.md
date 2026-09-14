# Nexus Play — Interactividad con JavaScript

**Actividad Formativa 4 (Semana 5)** — PFY2201 Desarrollo Frontend I, Duoc UC.
"Manipulando el DOM con JavaScript para mejorar la interactividad".

El mismo sitio de las semanas anteriores, ahora con **JavaScript**: manipulación del
DOM, eventos de usuario y carga de datos externos con la **Fetch API**.

## Estructura

```
├── index.html          Página completa
├── js/
│   └── app.js          Manipulación del DOM, eventos y fetch
├── datos.json          Fuente de datos externa del fetch
├── css/estilos.css     Estilo propio sobre Bootstrap 5
├── img/                Imágenes SVG
└── capturas/           Capturas de la interactividad
```

## Cómo verlo

**En línea:** <https://fcoxavierparra.github.io/PFY2201_S5_FPARRA/>

**En local:** abrir `index.html` en el navegador. Requiere conexión a internet, porque
Bootstrap viene del CDN y los datos se piden a la copia publicada del `datos.json`.

## Lo que hace el JavaScript

| Funcionalidad | Técnica | Dónde |
|---|---|---|
| **Próximos lanzamientos** | Fetch API + `createElement` y `appendChild` | Sección que llega vacía en el HTML y la construye el script |
| **Filtro por categoría** | evento `click` | Los botones de categoría muestran u ocultan los productos del género elegido |
| **Realce de tarjeta** | eventos `mouseover` y `mouseout` | Al pasar el cursor, la tarjeta se eleva y cambia de borde |
| **Validación del contacto** | evento `submit` | Valida los campos y muestra el resultado **sin recargar la página** |

### Organización del código

```
js/app.js
├── URL_DATOS               Constante con la fuente de datos
├── formatearFecha()        Utilidades reutilizables
├── formatearPrecio()
├── mostrarMensaje()        La usan el fetch y el formulario
├── crearTarjetaLanzamiento()   Construye un <article> completo
├── cargarLanzamientos()    fetch + then/catch
├── filtrarPorCategoria()   click
├── alternarRealce()        mouseover / mouseout
├── configurar*()           Registran los manejadores
├── validarCamposContacto() Devuelve la lista de errores
└── iniciar()               Punto de entrada
```

Cada función lleva un comentario que explica su propósito y su lugar en el flujo.
`mostrarMensaje()` y `crearTarjetaLanzamiento()` son las que evitan el código repetido:
la primera la comparten el manejo de errores y la validación del formulario.

## La fuente de datos y por qué la URL es absoluta

El `datos.json` se pide por **URL absoluta**, no relativa:

```js
const URL_DATOS = "https://fcoxavierparra.github.io/PFY2201_S5_FPARRA/datos.json";
```

El motivo es concreto. `fetch` **no funciona sobre el protocolo `file://`**: si alguien
abre el HTML desde su disco, una ruta relativa sería bloqueada por CORS y la sección de
lanzamientos quedaría vacía. GitHub Pages responde con la cabecera
`Access-Control-Allow-Origin: *`, de modo que la URL absoluta funciona en los dos
escenarios: el sitio publicado y el archivo abierto localmente.

Se eligió un JSON propio y no una API pública porque depender de un tercero añade un
punto de falla que no aporta nada al ejercicio.

### Manejo de errores

Si la carga falla, la sección muestra un aviso visible en lugar de quedarse en blanco.
La comprobación incluye `response.ok`, porque **`fetch` no rechaza la promesa ante un
404**: solo lo hace si falla la red.

## Notas

- **El formulario lleva `novalidate`** para que la validación la haga el script y no el
  navegador, y así poder mostrar un mensaje propio. Los atributos `required` y
  `type="email"` se conservan porque documentan la intención y el teclado del móvil los
  aprovecha.
- **El realce usa delegación de eventos**: los manejadores se registran una sola vez
  sobre `<main>` en lugar de en cada tarjeta. Así cubren también las tarjetas que el
  fetch crea después, que no existían al cargar la página.
- **La categoría "Estrategia" no tiene productos destacados.** Al filtrarla, el aviso lo
  explica en lugar de dejar la sección vacía sin motivo.

## Validación W3C

Validado el 2026-09-14:

| Archivo | Validador | Resultado |
|---|---|---|
| `index.html` | Nu Html Checker | **0 errores, 0 advertencias** |
| `css/estilos.css` | CSS Validator (jigsaw) | **0 errores, 0 avisos** |
