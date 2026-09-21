async function cargar() {
    try {
        const respuestaServidor = await fetch(
            "R_leer.php",
            { cache: "no-store" }
        );

        const resultado = await respuestaServidor.json();
        const tabla = document.querySelector("#lista");

        tabla.innerHTML = "";

        if (!resultado.ok) {
            tabla.innerHTML =
                '<tr><td colspan="6">' +
                esc(resultado.mensaje) +
                "</td></tr>";
            return;
        }

        if (!resultado.datos.length) {
            tabla.innerHTML =
                '<tr><td colspan="6">No hay postulantes registrados.</td></tr>';
            return;
        }

        resultado.datos.forEach(postulante => {
            const fila = document.createElement("tr");

            fila.innerHTML =
                "<td>" + esc(postulante.id) + "</td>" +
                "<td>" + esc(postulante.nombre) + "</td>" +
                "<td>" + esc(postulante.apellido) + "</td>" +
                "<td>" + esc(postulante.ci) + "</td>" +
                "<td>" + esc(postulante.ciudad) + "</td>" +
                '<td><div class="table-actions">' +
                '<a class="table-button" href="perfil.html?id=' +
                encodeURIComponent(postulante.id) +
                '">Ver perfil</a>' +
                '<a class="table-button" href="modificar.html?id=' +
                encodeURIComponent(postulante.id) +
                '">Modificar</a>' +
                '<button class="table-button delete" type="button" onclick="eliminar(' +
                Number(postulante.id) +
                ')">Eliminar</button>' +
                "</div></td>";

            tabla.appendChild(fila);
        });
    } catch (error) {
        document.querySelector("#lista").innerHTML =
            '<tr><td colspan="6">Error al cargar los registros. Revisa que Apache y MySQL estén activos.</td></tr>';
    }
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

async function eliminar(id) {
    if (!confirm("¿Eliminar este postulante y toda su información?")) {
        return;
    }

    const datos = new FormData();
    datos.append("id", id);

    try {
        const respuestaServidor = await fetch("D_eliminar.php", {
            method: "POST",
            body: datos
        });

        const resultado = await respuestaServidor.json();
        alert(resultado.mensaje);

        if (resultado.ok) {
            cargar();
        }
    } catch (error) {
        alert("Error al eliminar el registro.");
    }
}

cargar();
