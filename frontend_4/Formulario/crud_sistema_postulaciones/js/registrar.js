const $ = s => document.querySelector(s);

function bloque(t, html) {
    const d = document.createElement("div");
    d.innerHTML = html;
    const b = d.firstElementChild;
    $(t).appendChild(b);
    b.querySelector("button").onclick = () => b.remove();
}

function addF() {
    bloque("#formaciones",
        `<div>
            <label>Nivel:
                <input name="nivel[]">
            </label>
            <label>Carrera:
                <input name="carrera[]">
            </label>
            <label>Institución:
                <input name="institucion[]">
            </label>
            <button type="button">Quitar</button>
            <hr>
        </div>`
    );
}

function addE() {
    bloque("#experiencias",
        `<div>
            <label>Lugar:
                <input name="lugar[]">
            </label>
            <label>Tipo:
                <input name="tipo[]">
            </label>
            <label>Puesto:
                <input name="puesto[]">
            </label>
            <label>Años:
                <input type="number" min="0" name="anos_experiencia[]">
            </label>
            <button type="button">Quitar</button>
            <hr>
        </div>`
    );
}

function addL() {
    bloque("#lenguajes",
        `<div>
            <input name="lenguajes[]" placeholder="Lenguaje">
            <button type="button">Quitar</button>
            <br><br>
        </div>`
    );
}

function addH() {
    bloque("#herramientas",
        `<div>
            <input name="herramientas[]" placeholder="Herramienta">
            <button type="button">Quitar</button>
            <br><br>
        </div>`
    );
}

function addP() {
    bloque("#proyectos",
        `<div>
            <label>Nombre:
                <input name="proyecto_nombre[]">
            </label>
            <br><br>

            <label>Descripción:</label>
            <br>
            <textarea name="proyecto_descripcion[]" rows="4" cols="50"></textarea>
            <br><br>

            <label>Enlace:
                <input name="proyecto_enlace[]">
            </label>

            <button type="button">Quitar</button>
            <hr>
        </div>`
    );
}

$("#agregarFormacion").onclick = addF;
$("#agregarExperiencia").onclick = addE;
$("#agregarLenguaje").onclick = addL;
$("#agregarHerramienta").onclick = addH;
$("#agregarProyecto").onclick = addP;

addF();
addE();
addL();
addH();
addP();

$("#formRegistro").onsubmit = async e => {
    e.preventDefault();

    try {
        const r = await fetch("C_crear.php", {
            method: "POST",
            body: new FormData(e.target)
        });

        const x = await r.json();

        $("#mensaje").textContent = x.mensaje;

        if (x.ok) {
            e.target.reset();

            ["#formaciones", "#experiencias", "#lenguajes", "#herramientas", "#proyectos"]
                .forEach(s => $(s).innerHTML = "");

            addF();
            addE();
            addL();
            addH();
            addP();
        }

    } catch (error) {
        $("#mensaje").textContent = "Error al registrar el postulante.";
    }
};