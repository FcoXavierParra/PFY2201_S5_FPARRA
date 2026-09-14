/* ============================================================
   Nexus Play - Interactividad con JavaScript
   PFY2201 Desarrollo Frontend I - Duoc UC
   Actividad Formativa 4 (Semana 5): "Manipulando el DOM"

   Cuatro bloques de funcionalidad:
     1. Proximos lanzamientos  -> Fetch API + createElement/appendChild
     2. Filtro de categorias   -> evento click
     3. Realce de tarjetas     -> evento mouseover / mouseout
     4. Validacion del contacto-> evento submit

   Todo el codigo se organiza en funciones de una sola
   responsabilidad, que se registran al final en iniciar().
   ============================================================ */


/* ------------------------------------------------------------
   CONSTANTES
   ------------------------------------------------------------ */

/* La fuente de datos se pide por URL ABSOLUTA y no relativa.
   Motivo: fetch no funciona sobre el protocolo file://, asi que un
   archivo abierto desde el disco no podria cargar "datos.json" con
   ruta relativa. GitHub Pages responde con la cabecera
   Access-Control-Allow-Origin: *, de modo que esta URL funciona
   tanto en el sitio publicado como al abrir el HTML localmente. */
const URL_DATOS = "https://fcoxavierparra.github.io/PFY2201_S5_FPARRA/datos.json";


/* ------------------------------------------------------------
   UTILIDADES REUTILIZABLES
   ------------------------------------------------------------ */

/**
 * Convierte una fecha ISO (2026-10-03) al formato legible en espanol.
 * Se usa en cada tarjeta de lanzamiento.
 * @param {string} iso - fecha en formato AAAA-MM-DD
 * @returns {string} fecha con el mes en palabras
 */
function formatearFecha(iso) {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const partes = iso.split("-");
    // Number() quita el cero a la izquierda: "03" pasa a "3"
    const dia = Number(partes[2]);
    return dia + " de " + meses[Number(partes[1]) - 1] + " de " + partes[0];
}

/**
 * Da formato de precio en pesos chilenos.
 * @param {number} valor
 * @returns {string} por ejemplo "$34.990"
 */
function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-CL");
}

/**
 * Muestra un mensaje dentro de un contenedor, con el estilo de
 * Bootstrap que corresponda. La usan tanto el manejo de errores del
 * fetch como la validacion del formulario, para no repetir codigo.
 * @param {HTMLElement} contenedor - donde se pinta el mensaje
 * @param {string} texto - el mensaje a mostrar
 * @param {string} tipo - "success", "danger" o "info"
 */
function mostrarMensaje(contenedor, texto, tipo) {
    contenedor.innerHTML = "";
    const aviso = document.createElement("div");
    aviso.className = "alert alert-" + tipo + " mb-0";
    aviso.setAttribute("role", "alert");
    aviso.textContent = texto;
    contenedor.appendChild(aviso);
}


/* ------------------------------------------------------------
   1. PROXIMOS LANZAMIENTOS - Fetch API y construccion del DOM
   ------------------------------------------------------------ */

/**
 * Construye la tarjeta de un lanzamiento creando cada nodo con
 * createElement y ensamblandolos con appendChild. Devuelve el
 * elemento listo para insertar, sin tocar el documento: asi la
 * funcion es reutilizable y facil de probar.
 * @param {Object} juego - un objeto del arreglo "lanzamientos"
 * @returns {HTMLElement} la columna con la tarjeta dentro
 */
function crearTarjetaLanzamiento(juego) {
    // Columna de la cuadricula de Bootstrap
    const columna = document.createElement("div");
    columna.className = "col-sm-6 col-lg-4";

    const tarjeta = document.createElement("article");
    tarjeta.className = "card h-100 tarjeta-juego";

    const cuerpo = document.createElement("div");
    cuerpo.className = "card-body";

    // Genero, como etiqueta de color
    const genero = document.createElement("span");
    genero.className = "badge text-bg-secondary mb-2";
    genero.textContent = juego.genero;

    const titulo = document.createElement("h3");
    titulo.className = "card-title h6 text-primary";
    titulo.textContent = juego.titulo;

    const descripcion = document.createElement("p");
    descripcion.className = "card-text small text-body-secondary";
    descripcion.textContent = juego.descripcion;

    // Fecha y precio, en el pie de la tarjeta
    const detalle = document.createElement("p");
    detalle.className = "card-text small mb-0";
    detalle.textContent = formatearFecha(juego.fecha) + " · " + formatearPrecio(juego.precio);

    cuerpo.appendChild(genero);
    cuerpo.appendChild(titulo);
    cuerpo.appendChild(descripcion);
    cuerpo.appendChild(detalle);
    tarjeta.appendChild(cuerpo);
    columna.appendChild(tarjeta);

    return columna;
}

/**
 * Pide los datos externos con la Fetch API y pinta una tarjeta por
 * cada lanzamiento. Maneja las promesas con then/catch:
 *   - then  -> convierte la respuesta a JSON y construye el DOM
 *   - catch -> muestra un aviso visible si algo falla
 * Tambien comprueba response.ok, porque fetch NO rechaza la promesa
 * ante un 404: solo lo hace si falla la red.
 */
function cargarLanzamientos() {
    const contenedor = document.getElementById("listaLanzamientos");
    const estado = document.getElementById("estadoLanzamientos");

    fetch(URL_DATOS)
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("El servidor respondio " + respuesta.status);
            }
            return respuesta.json();
        })
        .then(function (datos) {
            // Se vacia el contenedor por si quedara contenido previo
            contenedor.innerHTML = "";

            datos.lanzamientos.forEach(function (juego) {
                contenedor.appendChild(crearTarjetaLanzamiento(juego));
            });

            estado.textContent = datos.lanzamientos.length +
                " titulos confirmados. Datos actualizados al " +
                formatearFecha(datos.actualizado) + ".";
        })
        .catch(function (error) {
            // El usuario ve un aviso en lugar de una seccion vacia
            mostrarMensaje(contenedor,
                "No se pudieron cargar los proximos lanzamientos. " + error.message,
                "danger");
            estado.textContent = "";
        });
}


/* ------------------------------------------------------------
   2. FILTRO DE CATEGORIAS - evento click
   ------------------------------------------------------------ */

/**
 * Muestra u oculta las tarjetas de producto segun la categoria
 * elegida, usando la clase d-none de Bootstrap. Cada producto
 * declara su genero en el atributo data-genero del HTML.
 * @param {string} categoria - el genero a mostrar, o "todas"
 */
function filtrarPorCategoria(categoria) {
    const productos = document.querySelectorAll("#productos [data-genero]");
    let visibles = 0;

    productos.forEach(function (producto) {
        const coincide = (categoria === "todas" || producto.dataset.genero === categoria);
        producto.classList.toggle("d-none", !coincide);
        if (coincide) {
            visibles++;
        }
    });

    // Se marca visualmente cuál es el filtro activo
    document.querySelectorAll(".filtro-categoria").forEach(function (boton) {
        boton.classList.toggle("activo", boton.dataset.categoria === categoria);
    });

    // El aviso contempla el caso de que la categoría no tenga productos:
    // "Estrategia" es un género del catálogo sin títulos destacados, y sin
    // este mensaje la sección quedaría vacía sin explicación
    const aviso = document.getElementById("avisoFiltro");
    if (categoria === "todas") {
        aviso.textContent = "Mostrando los " + visibles + " productos destacados.";
    } else if (visibles === 0) {
        aviso.textContent = "No hay productos destacados en la categoría " + categoria +
            " por ahora. Pulsa «Todas» para ver el resto.";
    } else {
        aviso.textContent = "Mostrando " + visibles + " producto(s) de la categoría " +
            categoria + ".";
    }
}

/**
 * Registra el click en cada boton de categoria.
 */
function configurarFiltroCategorias() {
    document.querySelectorAll(".filtro-categoria").forEach(function (boton) {
        boton.addEventListener("click", function () {
            filtrarPorCategoria(boton.dataset.categoria);
        });
    });
}


/* ------------------------------------------------------------
   3. REALCE DE TARJETAS - eventos mouseover y mouseout
   ------------------------------------------------------------ */

/**
 * Aplica o quita la clase de realce a una tarjeta. Se separa en una
 * funcion para que los dos eventos compartan la misma logica.
 * @param {HTMLElement} tarjeta
 * @param {boolean} activar
 */
function alternarRealce(tarjeta, activar) {
    tarjeta.classList.toggle("realce", activar);
}

/**
 * Registra mouseover y mouseout UNA sola vez sobre <main>, y ahi
 * averigua si el puntero entro en una tarjeta. Se llama delegacion de
 * eventos, y se usa por dos razones: evita recorrer y enganchar cada
 * tarjeta por separado, y funciona tambien con las tarjetas que el
 * fetch crea despues, que no existian al cargar la pagina.
 */
function configurarRealceTarjetas() {
    const contenedor = document.querySelector("main");

    contenedor.addEventListener("mouseover", function (evento) {
        const tarjeta = evento.target.closest(".card");
        if (tarjeta) {
            alternarRealce(tarjeta, true);
        }
    });

    contenedor.addEventListener("mouseout", function (evento) {
        const tarjeta = evento.target.closest(".card");
        if (tarjeta) {
            alternarRealce(tarjeta, false);
        }
    });
}


/* ------------------------------------------------------------
   4. VALIDACION DEL FORMULARIO - evento submit
   ------------------------------------------------------------ */

/**
 * Comprueba los campos obligatorios y el formato del correo.
 * Devuelve un arreglo con los errores encontrados, vacio si todo
 * esta correcto. Se separa de la funcion que muestra el resultado
 * para que la validacion sea reutilizable.
 * @returns {string[]} lista de mensajes de error
 */
function validarCamposContacto() {
    const errores = [];
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    if (nombre.length < 3) {
        errores.push("El nombre debe tener al menos 3 caracteres.");
    }
    // Comprobacion simple: texto, arroba, texto, punto, texto
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        errores.push("El correo electronico no tiene un formato valido.");
    }
    if (mensaje.length < 10) {
        errores.push("El mensaje debe tener al menos 10 caracteres.");
    }
    return errores;
}

/**
 * Intercepta el envio del formulario, lo valida y muestra el
 * resultado sin recargar la pagina. El formulario lleva el atributo
 * novalidate para que la validacion la haga este codigo y no el
 * navegador, y asi poder mostrar un mensaje propio.
 */
function configurarValidacionFormulario() {
    const formulario = document.getElementById("formContacto");
    const contenedor = document.getElementById("mensajeFormulario");

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault(); // evita que la pagina se recargue

        const errores = validarCamposContacto();

        if (errores.length > 0) {
            mostrarMensaje(contenedor, errores.join(" "), "danger");
        } else {
            mostrarMensaje(contenedor,
                "Gracias por escribirnos. Te responderemos en menos de 24 horas habiles.",
                "success");
            formulario.reset();
        }
    });
}


/* ------------------------------------------------------------
   ARRANQUE
   ------------------------------------------------------------ */

/**
 * Punto de entrada. Registra los tres manejadores de eventos y lanza
 * la carga de datos externos. El orden no importa: el realce usa
 * delegacion, asi que ya cubre las tarjetas que el fetch cree despues.
 */
function iniciar() {
    configurarFiltroCategorias();     // click
    configurarRealceTarjetas();       // mouseover / mouseout
    configurarValidacionFormulario(); // submit
    cargarLanzamientos();             // Fetch API
}

// El script se ejecuta cuando el DOM ya esta disponible
document.addEventListener("DOMContentLoaded", iniciar);
