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

function opciones(lista, valor = "") {
    let html = '<option value="">Seleccione</option>';

    lista.forEach(item => {
        const selected = item === valor ? " selected" : "";
        html += `<option value="${esc(item)}"${selected}>${esc(item)}</option>`;
    });

    return html;
}

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

function bloque(contenedor, html) {
    const div = document.createElement("div");
    div.innerHTML = html;

    const bloqueCreado = div.firstElementChild;
    $(contenedor).appendChild(bloqueCreado);

    bloqueCreado.querySelector(".quitar-bloque").onclick = () => {
        bloqueCreado.remove();
    };
}

function agregarFormacion() {
    bloque(
        "#formaciones",
        `<div>
            <label>Nivel:
                <select name="nivel[]" required>
                    ${opciones(niveles)}
                </select>
            </label>

            <label>Carrera:
                <input type="text" name="carrera[]">
            </label>

            <label>Institución:
                <input type="text" name="institucion[]">
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarExperiencia() {
    bloque(
        "#experiencias",
        `<div>
            <label>Lugar:
                <input type="text" name="lugar[]">
            </label>

            <label>Tipo:
                <input type="text" name="tipo[]">
            </label>

            <label>Puesto:
                <input type="text" name="puesto[]">
            </label>

            <label>Años:
                <input type="number" min="0" name="anos_experiencia[]">
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarLenguaje() {
    bloque(
        "#lenguajes",
        `<div>
            <label>Lenguaje:
                <select name="lenguajes[]" required>
                    ${opciones(lenguajes)}
                </select>
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarHerramienta() {
    bloque(
        "#herramientas",
        `<div>
            <label>Herramienta:
                <select name="herramientas[]" required>
                    ${opciones(herramientas)}
                </select>
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

function agregarProyecto() {
    bloque(
        "#proyectos",
        `<div>
            <label>Nombre:
                <input type="text" name="proyecto_nombre[]">
            </label>

            <label>Descripción:
                <textarea name="proyecto_descripcion[]" rows="4"></textarea>
            </label>

            <label>Enlace:
                <input type="text" name="proyecto_enlace[]">
            </label>

            <button type="button" class="quitar-bloque">Quitar</button>
        </div>`
    );
}

$("#agregarFormacion").onclick = agregarFormacion;
$("#agregarExperiencia").onclick = agregarExperiencia;
$("#agregarLenguaje").onclick = agregarLenguaje;
$("#agregarHerramienta").onclick = agregarHerramienta;
$("#agregarProyecto").onclick = agregarProyecto;

agregarFormacion();
agregarExperiencia();
agregarLenguaje();
agregarHerramienta();
agregarProyecto();

$("#formRegistro").onsubmit = async event => {
    event.preventDefault();

    try {
        const respuestaServidor = await fetch("C_crear.php", {
            method: "POST",
            body: new FormData(event.target)
        });

        const resultado = await respuestaServidor.json();
        $("#mensaje").textContent = resultado.mensaje;

        if (resultado.ok) {
            event.target.reset();

            [
                "#formaciones",
                "#experiencias",
                "#lenguajes",
                "#herramientas",
                "#proyectos"
            ].forEach(selector => {
                $(selector).innerHTML = "";
            });

            agregarFormacion();
            agregarExperiencia();
            agregarLenguaje();
            agregarHerramienta();
            agregarProyecto();
        }
    } catch (error) {
        $("#mensaje").textContent = "Error al registrar el postulante.";
    }
};
