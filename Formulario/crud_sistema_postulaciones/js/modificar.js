const id=new URLSearchParams(location.search).get("id");const $=s=>document.querySelector(s);function bloque(t,html){const d=document.createElement("div");d.innerHTML=html;const b=d.firstElementChild;$(t).appendChild(b);b.querySelector("button").onclick=()=>b.remove()}function f(v={}){bloque("#formaciones",`<div><label>Nivel: <input name="nivel[]" value="${esc(v.nivel)}"></label> <label>Carrera: <input name="carrera[]" value="${esc(v.carrera)}"></label> <label>Institución: <input name="institucion[]" value="${esc(v.institucion)}"></label> <button type="button">Quitar</button><hr></div>`)}function e(v={}){bloque("#experiencias",`<div><label>Lugar: <input name="lugar[]" value="${esc(v.lugar)}"></label> <label>Tipo: <input name="tipo[]" value="${esc(v.tipo)}"></label> <label>Puesto: <input name="puesto[]" value="${esc(v.puesto)}"></label> <label>Años: <input type="number" min="0" name="anos_experiencia[]" value="${esc(v["años_experiencia"])}"></label> <button type="button">Quitar</button><hr></div>`)}function l(v=""){bloque("#lenguajes",`<div><input name="lenguajes[]" value="${esc(v)}"><button type="button">Quitar</button><br><br></div>`)}function h(v=""){bloque("#herramientas",`<div><input name="herramientas[]" value="${esc(v)}"><button type="button">Quitar</button><br><br></div>`)}function p(v={}){bloque("#proyectos",`<div><label>Nombre: <input name="proyecto_nombre[]" value="${esc(v.nombre)}"></label><br><br><label>Descripción:<br><textarea name="proyecto_descripcion[]" rows="4" cols="50">${esc(v.descripcion)}</textarea></label><br><br><label>Enlace: <input name="proyecto_enlace[]" value="${esc(v.enlace)}"></label> <button type="button">Quitar</button><hr></div>`)}function esc(v){return String(v==null?"":v).replace(/[&<>\"]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m];});}$("#agregarFormacion").onclick=()=>f();$("#agregarExperiencia").onclick=()=>e();$("#agregarLenguaje").onclick=()=>l();$("#agregarHerramienta").onclick=()=>h();$("#agregarProyecto").onclick=()=>p();async function cargar(){const r=await fetch("R_ver.php?id="+encodeURIComponent(id)),x=await r.json();if(!x.ok){alert(x.mensaje);return}const q=x.datos.postulante;["id","nombre","apellido","ci","telefono","correo","ciudad"].forEach(k=>{if($("#"+k))$("#"+k).value=q[k]??""});x.datos.formacion.forEach(f);x.datos.experiencia_laboral.forEach(e);x.datos.lenguajes.forEach(v=>l(v.nombre));x.datos.herramientas.forEach(v=>h(v.nombre));x.datos.proyectos.forEach(p);if(!x.datos.formacion.length)f();if(!x.datos.experiencia_laboral.length)e();if(!x.datos.lenguajes.length)l();if(!x.datos.herramientas.length)h();if(!x.datos.proyectos.length)p()}$("#formModificar").onsubmit=async ev=>{ev.preventDefault();const r=await fetch("U_modificar.php",{method:"POST",body:new FormData(ev.target)}),x=await r.json();alert(x.mensaje);if(x.ok)location.href="perfil.html?id="+id};cargar();const id = new URLSearchParams(location.search).get("id");

const $ = s => document.querySelector(s);

function bloque(t, html) {
    const d = document.createElement("div");
    d.innerHTML = html;
    const b = d.firstElementChild;
    $(t).appendChild(b);
    b.querySelector("button").onclick = () => b.remove();
}

function f(v = {}) {
    bloque("#formaciones",
        `<div>
            <label>Nivel:
                <input name="nivel[]" value="${esc(v.nivel)}">
            </label>

            <label>Carrera:
                <input name="carrera[]" value="${esc(v.carrera)}">
            </label>

            <label>Institución:
                <input name="institucion[]" value="${esc(v.institucion)}">
            </label>

            <button type="button">Quitar</button>
            <hr>
        </div>`
    );
}

function e(v = {}) {
    bloque("#experiencias",
        `<div>
            <label>Lugar:
                <input name="lugar[]" value="${esc(v.lugar)}">
            </label>

            <label>Tipo:
                <input name="tipo[]" value="${esc(v.tipo)}">
            </label>

            <label>Puesto:
                <input name="puesto[]" value="${esc(v.puesto)}">
            </label>

            <label>Años:
                <input
                    type="number"
                    min="0"
                    name="anos_experiencia[]"
                    value="${esc(v["años_experiencia"])}"
                >
            </label>

            <button type="button">Quitar</button>
            <hr>
        </div>`
    );
}

function l(v = "") {
    bloque("#lenguajes",
        `<div>
            <input name="lenguajes[]" value="${esc(v)}">
            <button type="button">Quitar</button>
            <br><br>
        </div>`
    );
}

function h(v = "") {
    bloque("#herramientas",
        `<div>
            <input name="herramientas[]" value="${esc(v)}">
            <button type="button">Quitar</button>
            <br><br>
        </div>`
    );
}

function p(v = {}) {
    bloque("#proyectos",
        `<div>
            <label>Nombre:
                <input name="proyecto_nombre[]" value="${esc(v.nombre)}">
            </label>

            <br><br>

            <label>Descripción:</label>
            <br>

            <textarea
                name="proyecto_descripcion[]"
                rows="4"
                cols="50"
            >${esc(v.descripcion)}</textarea>

            <br><br>

            <label>Enlace:
                <input name="proyecto_enlace[]" value="${esc(v.enlace)}">
            </label>

            <button type="button">Quitar</button>
            <hr>
        </div>`
    );
}

function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function(m) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }[m];
    });
}

$("#agregarFormacion").onclick = () => f();

$("#agregarExperiencia").onclick = () => e();

$("#agregarLenguaje").onclick = () => l();

$("#agregarHerramienta").onclick = () => h();

$("#agregarProyecto").onclick = () => p();

async function cargar() {
    const r = await fetch(
        "R_ver.php?id=" + encodeURIComponent(id)
    );

    const x = await r.json();

    if (!x.ok) {
        alert(x.mensaje);
        return;
    }

    const q = x.datos.postulante;

    ["id", "nombre", "apellido", "ci", "telefono", "correo", "ciudad"]
        .forEach(k => {
            if ($("#" + k)) {
                $("#" + k).value = q[k] ?? "";
            }
        });

    x.datos.formacion.forEach(f);

    x.datos.experiencia_laboral.forEach(e);

    x.datos.lenguajes.forEach(v => l(v.nombre));

    x.datos.herramientas.forEach(v => h(v.nombre));

    x.datos.proyectos.forEach(p);

    if (!x.datos.formacion.length) {
        f();
    }

    if (!x.datos.experiencia_laboral.length) {
        e();
    }

    if (!x.datos.lenguajes.length) {
        l();
    }

    if (!x.datos.herramientas.length) {
        h();
    }

    if (!x.datos.proyectos.length) {
        p();
    }
}

$("#formModificar").onsubmit = async ev => {
    ev.preventDefault();

    const r = await fetch("U_modificar.php", {
        method: "POST",
        body: new FormData(ev.target)
    });

    const x = await r.json();

    alert(x.mensaje);

    if (x.ok) {
        location.href = "perfil.html?id=" + id;
    }
};

cargar();