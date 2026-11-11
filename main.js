// ======================================
// PROYECTO: LIGAS DE FÚTBOL
// API PÚBLICA DE ESPN - SIN API KEY
// ======================================


// 1. EQUIPOS

let equipos = [];


// 2. LIGAS QUE VAMOS A CARGAR

const ligas = [
    {
        codigo: "eng.1",
        nombre: "Premier League",
        pais: "Inglaterra"
    },
    {
        codigo: "esp.1",
        nombre: "LaLiga",
        pais: "España"
    },
    {
        codigo: "ita.1",
        nombre: "Serie A",
        pais: "Italia"
    },
    {
        codigo: "ger.1",
        nombre: "Bundesliga",
        pais: "Alemania"
    },
    {
        codigo: "fra.1",
        nombre: "Ligue 1",
        pais: "Francia"
    },
    {
        codigo: "arg.1",
        nombre: "Primera División",
        pais: "Argentina"
    }
];


// 3. ELEMENTOS DEL HTML

const container = document.getElementById("equiposContainer");
const mensaje = document.getElementById("mensaje");

const buscar = document.getElementById("Buscar");
const filtroLiga = document.getElementById("filtroliga");
const filtroPais = document.getElementById("filtropais");


// 4. BUSCAR LOS EQUIPOS DENTRO DE LA TABLA DE POSICIONES

function obtenerEquiposDeLaTabla(datos, liga) {

    let equiposEncontrados = [];

    function recorrer(objeto) {

        if (!objeto || typeof objeto !== "object") {
            return;
        }

        // Buscamos las entradas de la tabla
        if (
            objeto.standings &&
            Array.isArray(objeto.standings.entries)
        ) {
            objeto.standings.entries.forEach(entrada => {

                if (!entrada.team) {
                    return;
                }

                const equipo = entrada.team;

                // Buscamos el escudo
                let escudo = "";

                if (equipo.logos && equipo.logos.length > 0) {
                    escudo = equipo.logos[0].href;
                } else if (equipo.logo) {
                    escudo = equipo.logo;
                }

                equiposEncontrados.push({
                    id: equipo.id || equipo.displayName,
                    nombre: equipo.displayName || equipo.name || "Equipo",
                    liga: liga.nombre,
                    pais: liga.pais,
                    escudo: escudo
                });

            });
        }

        // Seguimos recorriendo los grupos de la tabla
        Object.values(objeto).forEach(valor => {

            if (Array.isArray(valor)) {
                valor.forEach(elemento => recorrer(elemento));

            } else if (valor && typeof valor === "object") {
                recorrer(valor);
            }

        });
    }

    recorrer(datos);

    return equiposEncontrados;
}


// 5. CARGAR LOS EQUIPOS DE UNA LIGA

async function cargarUnaLiga(liga) {

    try {

        const respuesta = await fetch(
            `https://site.api.espn.com/apis/v2/sports/soccer/${liga.codigo}/standings`
        );

        if (!respuesta.ok) {
            throw new Error("Error HTTP " + respuesta.status);
        }

        const datos = await respuesta.json();

        const equiposLiga = obtenerEquiposDeLaTabla(datos, liga);

        console.log(liga.nombre + ":", equiposLiga);

        return equiposLiga;

    } catch (error) {

        console.error("No se pudo cargar " + liga.nombre, error);

        return [];

    }
}


// 6. CARGAR TODAS LAS LIGAS

async function cargarEquipos() {

    mensaje.textContent = "Cargando equipos...";

    container.innerHTML = "";

    equipos = [];

    const resultados = await Promise.all(
        ligas.map(liga => cargarUnaLiga(liga))
    );

    resultados.forEach(resultado => {

        resultado.forEach(equipo => {

            // Evitamos repetir equipos
            const yaExiste = equipos.some(
                elemento => elemento.id === equipo.id &&
                elemento.liga === equipo.liga
            );

            if (!yaExiste) {
                equipos.push(equipo);
            }

        });

    });

    console.log("Todos los equipos:", equipos);

    if (equipos.length === 0) {

        mensaje.textContent =
            "No se pudieron cargar los equipos. Revisá la conexión o la consola.";

        return;
    }

    mensaje.textContent =
        "Se cargaron " + equipos.length + " equipos.";

    actualizarFiltros();

    mostrarEquipos(equipos);

}


// 7. MOSTRAR LOS EQUIPOS

function mostrarEquipos(lista) {

    container.innerHTML = "";

    if (lista.length === 0) {

        mensaje.textContent = "No se encontraron equipos.";

        return;
    }

    mensaje.textContent =
        "Equipos encontrados: " + lista.length;

    lista.forEach(equipo => {

        const tarjeta = document.createElement("article");
        tarjeta.classList.add("card");

        if (equipo.escudo) {

            const imagen = document.createElement("img");

            imagen.src = equipo.escudo;
            imagen.alt = "Escudo de " + equipo.nombre;

            imagen.onerror = function () {
                this.style.display = "none";
            };

            tarjeta.appendChild(imagen);

        }

        const titulo = document.createElement("h2");
        titulo.textContent = equipo.nombre;

        const liga = document.createElement("p");
        liga.classList.add("liga");
        liga.textContent = equipo.liga;

        const pais = document.createElement("p");
        pais.textContent = equipo.pais;

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(liga);
        tarjeta.appendChild(pais);

        container.appendChild(tarjeta);

    });

}


// 8. FILTRAR LOS EQUIPOS

function filtrarEquipos() {

    const texto = buscar.value.toLowerCase();

    const ligaElegida = filtroLiga.value;
    const paisElegido = filtroPais.value;

    const equiposFiltrados = equipos.filter(equipo => {

        const coincideNombre =
            equipo.nombre.toLowerCase().includes(texto);

        const coincideLiga =
            ligaElegida === "" || equipo.liga === ligaElegida;

        const coincidePais =
            paisElegido === "" || equipo.pais === paisElegido;

        return coincideNombre && coincideLiga && coincidePais;

    });

    mostrarEquipos(equiposFiltrados);

}


// 9. ACTUALIZAR LAS OPCIONES DE LOS FILTROS

function actualizarFiltros() {

    const ligaAnterior = filtroLiga.value;
    const paisAnterior = filtroPais.value;

    filtroLiga.innerHTML =
        '<option value="">Todas las ligas</option>';

    filtroPais.innerHTML =
        '<option value="">Todos los países</option>';

    let ligasDisponibles = [];
    let paisesDisponibles = [];

    equipos.forEach(equipo => {

        if (!ligasDisponibles.includes(equipo.liga)) {
            ligasDisponibles.push(equipo.liga);
        }

        if (!paisesDisponibles.includes(equipo.pais)) {
            paisesDisponibles.push(equipo.pais);
        }

    });

    ligasDisponibles.sort();

    paisesDisponibles.sort();

    ligasDisponibles.forEach(liga => {

        const opcion = document.createElement("option");

        opcion.value = liga;
        opcion.textContent = liga;

        filtroLiga.appendChild(opcion);

    });

    paisesDisponibles.forEach(pais => {

        const opcion = document.createElement("option");

        opcion.value = pais;
        opcion.textContent = pais;

        filtroPais.appendChild(opcion);

    });

    filtroLiga.value = ligaAnterior;
    filtroPais.value = paisAnterior;

}


// 10. ACTIVAR LOS FILTROS

buscar.addEventListener("input", filtrarEquipos);

filtroLiga.addEventListener("change", filtrarEquipos);

filtroPais.addEventListener("change", filtrarEquipos);


// 11. AGREGAR UN EQUIPO MANUALMENTE

const formulario = document.getElementById("agregarEquipo");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const equipoNuevo = {

        id: "manual-" + Date.now(),

        nombre: document.getElementById("nombre").value.trim(),

        liga: document.getElementById("liga").value.trim(),

        pais: document.getElementById("pais").value.trim(),

        escudo: document.getElementById("escudo").value.trim()

    };

    equipos.push(equipoNuevo);

    actualizarFiltros();

    filtrarEquipos();

    formulario.reset();

});


// 12. INICIAR EL PROYECTO

cargarEquipos();o