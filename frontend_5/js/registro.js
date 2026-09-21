const formulario = document.querySelector("form");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    let postulantes = JSON.parse(localStorage.getItem("postulantes")) || [];

    const postulante = {
        nombre: document.getElementById("nombre").value,
        ci: document.getElementById("ci").value,
        fechaNacimiento: document.getElementById("fechaNacimiento").value,
        telefono: document.getElementById("telefono").value,
        correo: document.getElementById("correo").value,
        ciudad: document.getElementById("ciudad").value,

        nivel: document.getElementById("nivel").value,
        carrera: document.getElementById("carrera").value,
        institucion: document.getElementById("institucion").value,

        puesto: document.getElementById("puesto").value,
        experiencia: document.getElementById("experiencia").value,
        lenguajes: document.getElementById("lenguajes").value,
        tecnologias: document.getElementById("tecnologias").value,
        proyectos: document.getElementById("proyectos").value,

        empresa: document.getElementById("empresa").value,
        cargo: document.getElementById("cargo").value,
        funciones: document.getElementById("funciones").value,
        experienciaLaboral: document.getElementById("experienciaLaboral").value,

        disponibilidad: document.getElementById("disponibilidad").value,
        fechaInicio: document.getElementById("fechaInicio").value,
        pretension: document.getElementById("pretension").value,

        habilidades: document.getElementById("habilidades").value,
        sobreMi: document.getElementById("sobreMi").value
    };

    postulantes.push(postulante);

    localStorage.setItem("postulantes", JSON.stringify(postulantes));

    alert("Postulante registrado correctamente.");

    formulario.reset();
});