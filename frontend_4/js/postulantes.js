const lista=document.getElementById("listaPostulantes");
const postulantes=JSON.parse(localStorage.getItem("postulantes"))||[];

if(postulantes.length===0){
    lista.innerHTML="<p>No hay postulantes registrados.</p>";
}else{
    postulantes.forEach((postulante,indice)=>{
        const div=document.createElement("div");
        div.classList.add("postulante");
        div.id=`perfil-${indice}`;
        div.innerHTML=`
            <div class="encabezado-perfil">
                <div class="foto-perfil">
                    <img src="img/p1.png" alt="Foto del postulante">
                </div>
                <div class="nombre-perfil">
                    <h3>${postulante.nombre||"No registrado"}</h3>
                </div>
            </div>
            <section class="seccion-perfil">
                <h4>Información personal</h4>
                <p><strong>CI:</strong> ${postulante.ci||"No registrado"}</p>
                <p><strong>Fecha de nacimiento:</strong> ${postulante.fechaNacimiento||"No registrado"}</p>
                <p><strong>Teléfono:</strong> ${postulante.telefono||"No registrado"}</p>
                <p><strong>Correo:</strong> ${postulante.correo||"No registrado"}</p>
                <p><strong>Ciudad:</strong> ${postulante.ciudad||"No registrado"}</p>
            </section>
            <section class="seccion-perfil">
                <h4>Formación académica</h4>
                <p><strong>Nivel:</strong> ${postulante.nivel||"No registrado"}</p>
                <p><strong>Carrera:</strong> ${postulante.carrera||"No registrado"}</p>
                <p><strong>Institución:</strong> ${postulante.institucion||"No registrado"}</p>
            </section>
            <section class="seccion-perfil">
                <h4>Perfil profesional</h4>
                <p><strong>Puesto:</strong> ${postulante.puesto||"No registrado"}</p>
                <p><strong>Experiencia:</strong> ${postulante.experiencia||"No registrado"} años</p>
                <p><strong>Lenguajes:</strong> ${postulante.lenguajes||"No registrado"}</p>
                <p><strong>Tecnologías:</strong> ${postulante.tecnologias||"No registrado"}</p>
                <p><strong>Proyectos:</strong> ${postulante.proyectos||"No registrado"}</p>
            </section>
            <section class="seccion-perfil">
                <h4>Experiencia laboral</h4>
                <p><strong>Empresa:</strong> ${postulante.empresa||"No registrado"}</p>
                <p><strong>Cargo:</strong> ${postulante.cargo||"No registrado"}</p>
                <p><strong>Funciones:</strong> ${postulante.funciones||"No registrado"}</p>
                <p><strong>Experiencia adicional:</strong> ${postulante.experienciaLaboral||"No registrado"}</p>
            </section>
            <section class="seccion-perfil">
                <h4>Disponibilidad</h4>
                <p><strong>Disponibilidad:</strong> ${postulante.disponibilidad||"No registrado"}</p>
                <p><strong>Fecha de inicio:</strong> ${postulante.fechaInicio||"No registrado"}</p>
                <p><strong>Pretensión salarial:</strong> ${postulante.pretension||"No registrado"}</p>
            </section>
            <section class="seccion-perfil">
                <h4>Información adicional</h4>
                <p><strong>Habilidades:</strong> ${postulante.habilidades||"No registrado"}</p>
                <p><strong>Sobre el postulante:</strong> ${postulante.sobreMi||"No registrado"}</p>
            </section>
            <div class="acciones-perfil">
                <button onclick="eliminarPostulante(${indice})">Eliminar</button>
            </div>
            <hr>
        `;
        lista.appendChild(div);
    });
}
function eliminarPostulante(indice){
    if(confirm("¿Desea eliminar este postulante?")){
        postulantes.splice(indice,1);
        localStorage.setItem("postulantes",JSON.stringify(postulantes));
        location.reload();
    }
}