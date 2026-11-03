(() => {
  const sessionApi = window.CodeWorkSession;
  const list = document.getElementById("postulantes-list");
  const status = document.getElementById("postulantes-status");
  const count = document.getElementById("postulantes-count");

  if (!sessionApi || !list || !status || !count) return;

  function setMessage(message, type = "info") {
    list.replaceChildren();
    count.textContent = "—";
    status.textContent = message;
    status.dataset.state = type;
  }

  function showEmpty() {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    const box = document.createElement("div");
    const heading = document.createElement("strong");
    const detail = document.createElement("p");

    cell.colSpan = 3;
    box.className = "empty-state";
    heading.textContent = "Todavía no hay postulantes registrados";
    detail.textContent = "Cuando existan perfiles, aparecerán en este directorio.";
    box.append(heading, detail);
    cell.append(box);
    row.append(cell);
    list.replaceChildren(row);
    count.textContent = "0";
    status.textContent = "Consulta completada.";
    status.dataset.state = "success";
  }

  function showPostulantes(postulantes) {
    const rows = postulantes.map(postulante => {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const email = document.createElement("td");
      const city = document.createElement("td");

      name.textContent = [postulante.nombre, postulante.apellido]
        .filter(value => typeof value === "string" && value.trim())
        .join(" ") || "Nombre no disponible";
      email.textContent = typeof postulante.correo === "string" && postulante.correo.trim()
        ? postulante.correo
        : "No disponible";
      city.textContent = typeof postulante.ciudad === "string" && postulante.ciudad.trim()
        ? postulante.ciudad
        : "No disponible";

      row.append(name, email, city);
      return row;
    });

    list.replaceChildren(...rows);
    count.textContent = String(postulantes.length);
    status.textContent = `Se encontraron ${postulantes.length} postulante${postulantes.length === 1 ? "" : "s"}.`;
    status.dataset.state = "success";
  }

  async function loadPostulantes() {
    setMessage("Cargando postulantes…");

    try {
      const response = await sessionApi.authorizedFetch("/api/postulantes/");

      if (response.status === 401) {
        sessionApi.clear();
        setMessage("Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.", "error");
        window.location.replace("/pages/login.html");
        return;
      }

      if (response.status === 403) {
        setMessage("Tu cuenta no tiene autorización para consultar este directorio.", "error");
        return;
      }

      if (!response.ok) {
        setMessage("No se pudo cargar el directorio. Inténtalo nuevamente más tarde.", "error");
        return;
      }

      const payload = await response.json();
      if (!payload || payload.ok !== true || !Array.isArray(payload.datos)) {
        setMessage("El servidor devolvió una respuesta que no se pudo interpretar.", "error");
        return;
      }

      if (payload.datos.some(postulante => !postulante || typeof postulante !== "object" || Array.isArray(postulante))) {
        setMessage("El servidor devolvió datos de postulantes con un formato no válido.", "error");
        return;
      }

      if (payload.datos.length === 0) {
        showEmpty();
        return;
      }

      showPostulantes(payload.datos);
    } catch {
      setMessage("No fue posible conectar con el servidor. Verifica que esté disponible e inténtalo de nuevo.", "error");
    }
  }

  loadPostulantes();
})();
