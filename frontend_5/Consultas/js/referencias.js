const $ = (selector) => document.querySelector(selector);

function esc(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[caracter]));
}

function agregarOpciones(select, valores, textoTodos) {
    select.innerHTML = `
        <option value="">${esc(textoTodos)}</option>
    `;

    valores.forEach((valor) => {
        const option = document.createElement("option");

        option.value = valor;
        option.textContent = valor;

        select.appendChild(option);
    });
}

async function cargarOpciones() {
    try {
        const respuesta = await fetch(
            "opciones_referencias.php",
            { cache: "no-store" }
        );

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            throw new Error(resultado.mensaje);
        }

        agregarOpciones(
            $("#nivel"),
            resultado.datos.niveles,
            "Todos"
        );

        agregarOpciones(
            $("#experiencia"),
            resultado.datos.experiencias,
            "Todos"
        );

        agregarOpciones(
            $("#lenguaje"),
            resultado.datos.lenguajes,
            "Todos"
        );

        agregarOpciones(
            $("#herramienta"),
            resultado.datos.herramientas,
            "Todas"
        );

        buscar();
    } catch (error) {
        $("#mensaje").textContent =
            "No se pudieron cargar las opciones de búsqueda.";
    }
}

async function buscar(event) {
    if (event) {
        event.preventDefault();
    }

    const params = new URLSearchParams();
    const campos = [
        "nivel",
        "experiencia",
        "lenguaje",
        "herramienta"
    ];

    campos.forEach((campo) => {
        const valor = $("#" + campo).value;

        if (valor !== "") {
            params.set(campo, valor);
        }
    });

    try {
        const respuesta = await fetch(
            "buscar_referencias.php?" + params.toString(),
            { cache: "no-store" }
        );

        const resultado = await respuesta.json();
        const contenedor = $("#resultados");

        if (!resultado.ok) {
            contenedor.innerHTML = `
                <div class="empty">
                    ${esc(resultado.mensaje)}
                </div>
            `;
            return;
        }

        $("#mensaje").textContent =
            `Resultados encontrados: ${resultado.datos.length}`;

        if (!resultado.datos.length) {
            contenedor.innerHTML = `
                <div class="empty">
                    No se encontraron postulantes con los criterios seleccionados.
                </div>
            `;
            return;
        }

        contenedor.innerHTML = resultado.datos.map((p) => `
            <article class="result-card">
                <h3>${esc(p.nombre)} ${esc(p.apellido)}</h3>

                <p><strong>ID:</strong> ${esc(p.id)}</p>
                <p><strong>CI:</strong> ${esc(p.ci)}</p>
                <p><strong>Teléfono:</strong> ${esc(p.telefono)}</p>
                <p><strong>Correo:</strong> ${esc(p.correo)}</p>
                <p><strong>Ciudad:</strong> ${esc(p.ciudad)}</p>
            </article>
        `).join("");
    } catch (error) {
        $("#mensaje").textContent =
            "Error al realizar la búsqueda.";
    }
}

$("#busquedaForm").addEventListener("submit", buscar);

$("#limpiar").addEventListener("click", () => {
    [
        "nivel",
        "experiencia",
        "lenguaje",
        "herramienta"
    ].forEach((id) => {
        $("#" + id).value = "";
    });

    buscar();
});

cargarOpciones();
