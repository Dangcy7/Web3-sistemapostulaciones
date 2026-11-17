(() => {
  const sessionApi = window.CodeWorkSession;
  const form = document.querySelector("#busqueda-form");
  if (!sessionApi || !form || !sessionApi.requireRole("admin")) return;

  const status = document.querySelector("#busqueda-status");
  const searchButton = document.querySelector("#buscar-postulantes");
  const results = document.querySelector("#results-list");
  const resultsCount = document.querySelector("#results-count");
  const detail = document.querySelector("#candidate-detail");
  const levels = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado", experto: "Experto" };
  const labels = {
    tiempo_completo: "Tiempo completo", tiempo_parcial: "Tiempo parcial",
    presencial: "Presencial", remoto: "Remoto", hibrido: "Híbrido"
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function handleAuthFailure(response, target = status) {
    if (response.status === 401) {
      sessionApi.clear();
      window.location.replace("/pages/login.html");
      return true;
    }
    if (response.status === 403) {
      target.textContent = "Tu cuenta no tiene autorización para esta operación.";
      target.className = "form-message error";
      return true;
    }
    return false;
  }

  function makeCheckbox(item, group) {
    const label = el("label", "knowledge-option");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = String(item.id);
    input.dataset.knowledge = group;
    label.append(input, document.createTextNode(item.nombre));
    return label;
  }

  async function loadCatalogs() {
    const response = await fetch("/api/catalogos/conocimientos", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("No se pudieron cargar los catálogos");
    const result = await response.json();
    document.querySelector("#catalogo-lenguajes").replaceChildren(...result.datos.lenguajes.map(item => makeCheckbox(item, "lenguajes")));
    document.querySelector("#catalogo-herramientas").replaceChildren(...result.datos.herramientas.map(item => makeCheckbox(item, "herramientas")));
  }

  function selectedValues(selector) {
    return [...form.querySelectorAll(`${selector}:checked`)].map(input => input.value);
  }

  function renderCard(profile) {
    const card = el("article", "match-card");
    card.append(el("h3", "", `${profile.nombre} ${profile.apellido}`.trim()));
    card.append(el("p", "match-candidate-state", `Disponibilidad: ${profile.disponibilidad === "disponible" ? "Disponible" : profile.disponibilidad === "no_disponible" ? "No disponible" : "Sin información"}`));
    card.append(el("p", "muted", [profile.correo, profile.ciudad].filter(Boolean).join(" · ") || "Sin datos de contacto"));
    const knowledge = [...(profile.lenguajes || []), ...(profile.herramientas || [])].map(item => item.nombre).join(", ");
    const education = (profile.formacion || []).map(item => [item.nivel, item.carrera, item.institucion].filter(Boolean).join(" · ")).filter(Boolean).join("; ");
    const experience = (profile.experiencias || []).map(item => [item.puesto, item.lugar, item.tipo].filter(Boolean).join(" · ")).filter(Boolean).join("; ");
    const projects = (profile.proyectos || []).map(item => item.nombre).filter(Boolean).join(", ");
    [["Conocimientos", knowledge], ["Formación", education], ["Experiencia", experience], ["Proyectos", projects]]
      .forEach(([title, value]) => card.append(el("p", "match-counts", `${title}: ${value || "Sin información registrada"}`)));
    const button = el("button", "button button-outline button-small", "Consultar perfil");
    button.type = "button";
    button.dataset.viewCandidate = String(profile.id);
    card.append(button);
    return card;
  }

  function renderResults(profiles) {
    resultsCount.textContent = `${profiles.length} perfil${profiles.length === 1 ? "" : "es"}`;
    if (!profiles.length) {
      results.replaceChildren(el("p", "empty-row", "No se encontraron postulantes con los filtros seleccionados."));
      return;
    }
    results.replaceChildren(...profiles.map(renderCard));
  }

  async function search(event) {
    event.preventDefault();
    searchButton.disabled = true;
    status.textContent = "Buscando postulantes…";
    results.replaceChildren();
    detail.hidden = true;
    const payload = {
      lenguajes: selectedValues('[data-knowledge="lenguajes"]').map(Number),
      herramientas: selectedValues('[data-knowledge="herramientas"]').map(Number),
      solo_disponibles: document.querySelector("#filtro-disponibles").checked,
      jornadas: selectedValues("[data-jornada]"),
      modalidades: selectedValues("[data-modalidad]")
    };
    try {
      const response = await sessionApi.authorizedFetch("/api/postulantes/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      if (handleAuthFailure(response)) return;
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true || !Array.isArray(result.datos)) {
        status.textContent = result?.mensaje || "No se pudo realizar la búsqueda.";
        status.className = "form-stage-note form-message error";
        return;
      }
      status.textContent = "Resultados ordenados por cantidad de conocimientos coincidentes.";
      status.className = "form-stage-note";
      renderResults(result.datos);
    } catch {
      status.textContent = "No fue posible conectar con el servidor.";
      status.className = "form-stage-note form-message error";
    } finally {
      searchButton.disabled = false;
    }
  }

  function appendSection(container, title, entries, format) {
    const section = el("section", "profile-detail-block");
    section.append(el("h4", "", title));
    if (!Array.isArray(entries) || !entries.length) section.append(el("p", "muted", "Sin información registrada."));
    else {
      const list = el("ul", "profile-detail-list");
      entries.forEach(item => list.append(el("li", "", format(item))));
      section.append(list);
    }
    container.append(section);
  }

  function renderDetail(profile) {
    detail.replaceChildren();
    detail.hidden = false;
    const heading = el("div", "card-heading");
    heading.append(el("h3", "", `${profile.nombre} ${profile.apellido}`.trim()));
    const close = el("button", "remove-entry", "Cerrar perfil");
    close.type = "button";
    close.dataset.closeDetail = "true";
    heading.append(close);
    detail.append(heading);
    const contact = el("div", "data-grid");
    [["Correo", profile.correo], ["Teléfono", profile.telefono], ["Ciudad", profile.ciudad]].forEach(([title, value]) => {
      const field = document.createElement("div");
      field.append(el("small", "", title), el("p", "", value || "No disponible"));
      contact.append(field);
    });
    detail.append(contact);
    appendSection(detail, "Disponibilidad y preferencias", [{ disponibilidad: profile.disponibilidad, jornadas: profile.jornadas, modalidades: profile.modalidades }], item =>
      `Disponibilidad: ${item.disponibilidad === "disponible" ? "Disponible" : item.disponibilidad === "no_disponible" ? "No disponible" : "Sin información"} · Jornada: ${(item.jornadas || []).map(value => labels[value] || value).join(", ") || "Sin información"} · Modalidad: ${(item.modalidades || []).map(value => labels[value] || value).join(", ") || "Sin información"}`);
    appendSection(detail, "Formación", profile.formacion, item => [item.nivel, item.carrera, item.institucion].filter(Boolean).join(" · "));
    appendSection(detail, "Experiencia", profile.experiencias, item => [item.puesto, item.lugar, item.tipo, item.años_experiencia == null ? "" : `${item.años_experiencia} años`].filter(Boolean).join(" · "));
    const knowledge = item => `${item.nombre}: declarado ${levels[item.nivel_declarado] || "pendiente"}; verificado ${levels[item.nivel_verificado] || "sin verificación"}${item.verificado_por_usuario ? ` por ${item.verificado_por_usuario}` : ""}`;
    appendSection(detail, "Lenguajes", profile.lenguajes, knowledge);
    appendSection(detail, "Herramientas y tecnologías", profile.herramientas, knowledge);
    appendSection(detail, "Proyectos", profile.proyectos, item => [item.nombre, item.descripcion, item.enlace].filter(Boolean).join(" · "));
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  results.addEventListener("click", async event => {
    const button = event.target.closest("[data-view-candidate]");
    if (!button) return;
    detail.hidden = false;
    detail.replaceChildren(el("p", "muted", "Cargando perfil…"));
    try {
      const response = await sessionApi.authorizedFetch(`/api/postulantes/${encodeURIComponent(button.dataset.viewCandidate)}`);
      if (handleAuthFailure(response, detail)) return;
      const result = await response.json();
      if (!response.ok || result?.ok !== true || !result.datos) throw new Error("Perfil no disponible");
      renderDetail(result.datos);
    } catch {
      detail.replaceChildren(el("p", "form-message error", "No se pudo cargar el perfil completo."));
    }
  });
  detail.addEventListener("click", event => {
    if (event.target.closest("[data-close-detail]")) detail.hidden = true;
  });
  form.addEventListener("submit", search);
  loadCatalogs().catch(() => {
    status.textContent = "No se pudieron cargar los catálogos. Intenta actualizar la página.";
    status.className = "form-stage-note form-message error";
  });
})();
