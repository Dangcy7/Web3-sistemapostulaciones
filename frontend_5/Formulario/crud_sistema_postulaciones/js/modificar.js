const id = new URLSearchParams(location.search).get("id");
const $ = selector => document.querySelector(selector);

const niveles = [
    "Técnico Medio",
    "Técnico Superior",
    "Universitario",
    "Licenciatura",
    "Postgrado",
    "Especialidad Profesional",
    "Maestría",
    "Doctorado",
    "Postdoctorado",
    "Formación Autodidacta"
];

const lenguajes = [
    "C#",
    "C++",
    "Dart",
    "Go",
    "Java",
    "JavaScript",
    "Kotlin",
    "PHP",
    "Python",
    "R",
    "Ruby",
    "Rust",
    "SQL",
    "Swift",
    "TypeScript"
];

const herramientas = [
    "Git / GitHub / GitLab",
    "Visual Studio Code",
    "Visual Studio / .NET",
    "IntelliJ IDEA / JetBrains",
    "Android Studio",
    "MySQL / MySQL Workbench",
    "PostgreSQL",
    "Microsoft SQL Server / SQL Server Management Studio",
    "Oracle Database / Oracle SQL Developer",
    "Docker",
    "Kubernetes",
    "Postman",
    "Linux",
    "AWS",
    "Microsoft Azure",
    "Jira / Confluence",
    "Jenkins",
    "Figma",
    "Node.js / npm",
    "Google Cloud / Firebase"
];

function esc(valor) {
    return String(valor == null ? "" : valor).replace(/[&<>"']/g, caracter => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[caracter];
    });
}

function valorNormalizado(valor, lista) {
    const texto = String(valor == null ? "" : valor).trim();
    const encontrado = lista.find(item => item.toLowerCase() === texto.toLowerCase());

    return encontrado || "";
}

function opciones(lista, valor = "") {
    const seleccionado = valorNormalizado(valor, lista);
    let html = '<option value="">Seleccione</option>';

    if (valor && !seleccionado) {
        html += `<option value="" disabled selected>Valor anterior: ${esc(valor)} — seleccione una opción válida</option>`;
    }

    lista.forEach(item => {
        const selected = item === seleccionado ? " selected" : "";
        html += `<option value="${esc(item)}"${selected}>${esc(item)}</option>`;
    });

    return html;
}

function bloque(contenedor, html) {
    const div = document.createElement("div");
    div.innerHTML = html;

    const bloqueCreado = div.firstElementChild;
    $(contenedor).appendChild(bloqueCreado);

    bloqueCreado.querySelector(".quitar-bloque").onclick = () => {
        bloqueCreado.remove();
    };
}

function agregarFormacion(valor = {}) {
    bloque(
        "#formaciones",
        `<div>
            <label>Nivel:
                <select name="nivel[]" required>
                    ${opciones(niveles, valor.nivel)}
                </select>
            </label>

            <label>Carrera:
                <input type="text" name="carrera[]" value="${esc(valor.carrera)}">
            </label>

            <label>Institución:
                <input type="text" name="institucion[]" value="${esc(valor.institucion)}">
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarExperiencia(valor = {}) {
    bloque(
        "#experiencias",
        `<div>
            <label>Lugar:
                <input type="text" name="lugar[]" value="${esc(valor.lugar)}">
            </label>

            <label>Tipo:
                <input type="text" name="tipo[]" value="${esc(valor.tipo)}">
            </label>

            <label>Puesto:
                <input type="text" name="puesto[]" value="${esc(valor.puesto)}">
            </label>

            <label>Años:
                <input type="number" min="0" name="anos_experiencia[]" value="${esc(valor["años_experiencia"])}">
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarLenguaje(valor = "") {
    bloque(
        "#lenguajes",
        `<div>
            <label>Lenguaje:
                <select name="lenguajes[]" required>
                    ${opciones(lenguajes, valor)}
                </select>
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarHerramienta(valor = "") {
    bloque(
        "#herramientas",
        `<div>
            <label>Herramienta:
                <select name="herramientas[]" required>
                    ${opciones(herramientas, valor)}
                </select>
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarProyecto(valor = {}) {
    bloque(
        "#proyectos",
        `<div>
            <label>Nombre:
                <input type="text" name="proyecto_nombre[]" value="${esc(valor.nombre)}">
            </label>

            <label>Descripción:
                <textarea name="proyecto_descripcion[]" rows="4">${esc(valor.descripcion)}</textarea>
            </label>

            <label>Enlace:
                <input type="text" name="proyecto_enlace[]" value="${esc(valor.enlace)}">
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

$("#agregarFormacion").onclick = () => agregarFormacion();
$("#agregarExperiencia").onclick = () => agregarExperiencia();
$("#agregarLenguaje").onclick = () => agregarLenguaje();
$("#agregarHerramienta").onclick = () => agregarHerramienta();
$("#agregarProyecto").onclick = () => agregarProyecto();

async function cargar() {
    if (!id) {
        $("#mensaje").textContent = "No se recibió el ID del postulante.";
        return;
    }

    try {
        const respuestaServidor = await fetch(
            "R_ver.php?id=" + encodeURIComponent(id),
            { cache: "no-store" }
        );

        const resultado = await respuestaServidor.json();

        if (!resultado.ok) {
            $("#mensaje").textContent = resultado.mensaje;
            return;
        }

        const postulante = resultado.datos.postulante;

        [
            "id",
            "nombre",
            "apellido",
            "ci",
            "telefono",
            "correo",
            "ciudad"
        ].forEach(campo => {
            if ($("#" + campo)) {
                $("#" + campo).value = postulante[campo] ?? "";
            }
        });

        resultado.datos.formacion.forEach(agregarFormacion);
        resultado.datos.experiencia_laboral.forEach(agregarExperiencia);
        resultado.datos.lenguajes.forEach(item => agregarLenguaje(item.nombre));
        resultado.datos.herramientas.forEach(item => agregarHerramienta(item.nombre));
        resultado.datos.proyectos.forEach(agregarProyecto);

        if (!resultado.datos.formacion.length) {
            agregarFormacion();
        }

        if (!resultado.datos.experiencia_laboral.length) {
            agregarExperiencia();
        }

        if (!resultado.datos.lenguajes.length) {
            agregarLenguaje();
        }

        if (!resultado.datos.herramientas.length) {
            agregarHerramienta();
        }

        if (!resultado.datos.proyectos.length) {
            agregarProyecto();
        }
    } catch (error) {
        $("#mensaje").textContent = "No se pudo cargar el registro.";
    }
}

$("#formModificar").onsubmit = async event => {
    event.preventDefault();

    try {
        const respuestaServidor = await fetch("U_modificar.php", {
            method: "POST",
            body: new FormData(event.target)
        });

        const resultado = await respuestaServidor.json();
        $("#mensaje").textContent = resultado.mensaje;

        if (resultado.ok) {
            setTimeout(() => {
                location.href = "perfil.html?id=" + encodeURIComponent(id);
            }, 500);
        }
    } catch (error) {
        $("#mensaje").textContent = "Error al modificar el registro.";
    }
};

cargar();
