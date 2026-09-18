async function cargar() {
    try {
        const r = await fetch("R_leer.php", { cache: "no-store" });
        const x = await r.json();

        const t = document.querySelector("#lista");
        t.innerHTML = "";

        if (!x.ok) {
            t.innerHTML = '<tr><td colspan="5">' + esc(x.mensaje) + "</td></tr>";
            return;
        }

        if (!x.datos.length) {
            t.innerHTML = '<tr><td colspan="5">No hay postulantes registrados.</td></tr>';
            return;
        }

        x.datos.forEach(function(p) {
            const tr = document.createElement("tr");

            tr.innerHTML =
                "<td>" + esc(p.id) + "</td>" +
                "<td>" + esc(p.nombre) + "</td>" +
                "<td>" + esc(p.apellido) + "</td>" +
                "<td>" + esc(p.ci) + "</td>" +
                '<td>' +
                '<a href="perfil.html?id=' + encodeURIComponent(p.id) + '"><button type="button">Ver perfil completo</button></a> ' +
                '<a href="modificar.html?id=' + encodeURIComponent(p.id) + '"><button type="button">Modificar</button></a> ' +
                '<button type="button" onclick="eliminar(' + Number(p.id) + ')">Eliminar</button>' +
                "</td>";

            t.appendChild(tr);
        });

    } catch (e) {
        document.querySelector("#lista").innerHTML =
            '<tr><td colspan="5">Error al cargar los registros. Revisa que Apache y MySQL estén activos.</td></tr>';
    }
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

async function eliminar(id) {
    if (!confirm("¿Eliminar este postulante y toda su información?")) {
        return;
    }

    const fd = new FormData();
    fd.append("id", id);

    try {
        const r = await fetch("D_eliminar.php", {
            method: "POST",
            body: fd
        });

        const x = await r.json();

        alert(x.mensaje);

        if (x.ok) {
            cargar();
        }

    } catch (e) {
        alert("Error al eliminar el registro.");
    }
}

cargar();