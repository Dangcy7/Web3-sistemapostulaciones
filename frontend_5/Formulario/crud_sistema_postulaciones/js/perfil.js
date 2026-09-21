const id = new URLSearchParams(location.search).get("id");

const $ = s => document.querySelector(s);

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

function tabla(t, arr) {
    if (!arr.length) {
        return `<p>No hay registros.</p>`;
    }

    let h = `<table border="1"><tr>${
        Object.keys(arr[0]).map(k => `<th>${esc(k)}</th>`).join("")
    }</tr>`;

    arr.forEach(r => {
        h += `<tr>${
            Object.values(r).map(v => `<td>${esc(v)}</td>`).join("")
        }</tr>`;
    });

    return h + "</table>";
}

async function cargar() {
    const r = await fetch("R_ver.php?id=" + encodeURIComponent(id));
    const x = await r.json();

    if (!x.ok) {
        $("#perfil").textContent = x.mensaje;
        return;
    }

    const p = x.datos.postulante;

    let h = `
        <h2>${esc(p.nombre)} ${esc(p.apellido)}</h2>

        <h3>Datos personales</h3>
        <p>ID: ${esc(p.id)}</p>
        <p>CI: ${esc(p.ci)}</p>
        <p>Teléfono: ${esc(p.telefono)}</p>
        <p>Correo: ${esc(p.correo)}</p>
        <p>Ciudad: ${esc(p.ciudad)}</p>

        <h3>Formación académica</h3>
        ${tabla("formacion", x.datos.formacion)}

        <h3>Experiencia laboral</h3>
        ${tabla("experiencia_laboral", x.datos.experiencia_laboral)}

        <h3>Lenguajes</h3>
        ${tabla("lenguajes", x.datos.lenguajes)}

        <h3>Herramientas</h3>
        ${tabla("herramientas", x.datos.herramientas)}

        <h3>Proyectos</h3>
        ${tabla("proyectos", x.datos.proyectos)}
    `;

    $("#perfil").innerHTML = h;
}

cargar();