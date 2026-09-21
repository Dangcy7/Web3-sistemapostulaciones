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

async function cargarPostulantes() {
    try {
        const respuesta = await fetch(
            "lista_postulantes.php",
            { cache: "no-store" }
        );

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            throw new Error(resultado.mensaje);
        }

        const select = $("#postulante");

        resultado.datos.forEach((p) => {
            const option = document.createElement("option");

            option.value = p.id;
            option.textContent = `${p.id} - ${p.nombre} ${p.apellido}`;

            select.appendChild(option);
        });
    } catch (error) {
        $("#mensaje").textContent =
            "No se pudieron cargar los postulantes.";
    }
}

async function consultar(id) {
    if (!id) {
        $("#detalle").innerHTML = "";
        $("#mensaje").textContent = "";
        return;
    }

    try {
        const respuesta = await fetch(
            "detalle_postulante.php?id=" + encodeURIComponent(id),
            { cache: "no-store" }
        );

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            $("#detalle").innerHTML = `
                <div class="empty">
                    ${esc(resultado.mensaje)}
                </div>
            `;
            return;
        }

        const p = resultado.datos.postulante;
        const proyectos = resultado.datos.proyectos;

        let html = `
            <div class="result-card">
                <h3>Información del postulante</h3>

                <p><strong>ID:</strong> ${esc(p.id)}</p>
                <p><strong>Nombre:</strong> ${esc(p.nombre)}</p>
                <p><strong>Apellido:</strong> ${esc(p.apellido)}</p>
                <p><strong>CI:</strong> ${esc(p.ci)}</p>
                <p><strong>Teléfono:</strong> ${esc(p.telefono)}</p>
                <p><strong>Correo:</strong> ${esc(p.correo)}</p>
                <p><strong>Ciudad:</strong> ${esc(p.ciudad)}</p>
            </div>

            <div class="result-card">
                <h3>Proyectos</h3>
        `;

        if (!proyectos.length) {
            html += `
                <div class="empty">
                    No tiene proyectos para consultar.
                </div>
            `;
        } else {
            html += proyectos.map((proyecto) => `
                <div class="project">
                    <h4>${esc(proyecto.nombre)}</h4>

                    <p>
                        <strong>Descripción:</strong>
                        ${esc(proyecto.descripcion) || "Sin descripción"}
                    </p>

                    ${
                        proyecto.enlace
                            ? `
                                <p>
                                    <strong>Enlace:</strong>
                                    <a
                                        class="project-link"
                                        href="${esc(proyecto.enlace)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        ${esc(proyecto.enlace)}
                                    </a>
                                </p>
                            `
                            : ""
                    }
                </div>
            `).join("");
        }

        html += "</div>";

        $("#detalle").innerHTML = html;
        $("#mensaje").textContent = "";
    } catch (error) {
        $("#mensaje").textContent =
            "Error al consultar el postulante.";
    }
}

$("#postulante").addEventListener("change", (event) => {
    consultar(event.target.value);
});

cargarPostulantes();
