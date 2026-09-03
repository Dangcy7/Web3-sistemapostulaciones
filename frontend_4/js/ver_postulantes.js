const lista = document.getElementById("listaPostulantes");

const postulantes =
    JSON.parse(localStorage.getItem("postulantes")) || [];


if (postulantes.length === 0) {

    lista.innerHTML = `
        <p>No hay postulantes registrados.</p>
    `;

} else {

    postulantes.forEach((postulante, indice) => {

        const article = document.createElement("article");

        article.classList.add("postulante");

        article.innerHTML = `

            <div class="foto-postulante">

                <img src="img/p1.png"
                     alt="Foto del postulante">

            </div>


            <div class="datos-postulante">

                <h3>
                    ${postulante.nombre || "Sin nombre"}
                </h3>

                <p>
                    <strong>Especialidad:</strong>
                    ${postulante.puesto || "No registrada"}
                </p>

                <p>
                    <strong>Experiencia:</strong>
                    ${postulante.experiencia || "No registrada"}
                </p>

                <p>
                    <strong>Formación:</strong>
                    ${postulante.carrera || postulante.nivel || "No registrada"}
                </p>

                <p>
                    <strong>Lenguajes:</strong>
                    ${postulante.lenguajes || "No registrados"}
                </p>

                <p>
                    <strong>Disponibilidad:</strong>
                    ${postulante.disponibilidad || "No registrada"}
                </p>

            </div>


            <div class="acciones-postulante">

                <a href="postulantes.html#perfil-${indice}">
                    Ver perfil completo
                </a>

                <button onclick="eliminarPostulante(${indice})">
                    Eliminar
                </button>

            </div>

        `;

        lista.appendChild(article);

    });
}


function eliminarPostulante(indice) {

    if (confirm("¿Desea eliminar este postulante?")) {

        postulantes.splice(indice, 1);

        localStorage.setItem(
            "postulantes",
            JSON.stringify(postulantes)
        );

        location.reload();
    }
}