(() => {
  const sessionApi = window.CodeWorkSession;
  const form = document.querySelector("#solicitud-form");
  if (!sessionApi || !form || !sessionApi.requireRole("admin")) return;

  const catalogs = {
    lenguajes: [
      { id: 1, nombre: "Python" }, { id: 2, nombre: "Java" },
      { id: 3, nombre: "JavaScript" }, { id: 4, nombre: "C++" }, { id: 5, nombre: "PHP" }
    ],
    herramientas: [
      { id: 1, nombre: "Git" }, { id: 2, nombre: "GitHub" },
      { id: 3, nombre: "Docker" }, { id: 4, nombre: "MySQL" },
      { id: 5, nombre: "React" }, { id: 6, nombre: "Node.js" }, { id: 7, nombre: "Flask" }
    ]
  };
  const state = { lenguajes: [], herramientas: [] };
  const requestList = document.querySelector("#solicitudes-list");
  const requestStatus = document.querySelector("#solicitudes-status");
  const formStatus = document.querySelector("#solicitud-form-status");
  const createButton = document.querySelector("#crear-solicitud");
  const matchesPanel = document.querySelector("#coincidencias-panel");
  const matchesList = document.querySelector("#matches-list");
  const matchesRequirements = document.querySelector("#matches-requirements");
  const matchesStatus = document.querySelector("#matches-description");
  const matchesCount = document.querySelector("#matches-count");
  const detailPanel = document.querySelector("#candidate-detail");

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function handleAuthFailure(response, statusTarget = requestStatus) {
    if (response.status === 401) {
      sessionApi.clear();
      window.location.replace("/pages/login.html");
      return true;
    }
    if (response.status === 403) {
      statusTarget.textContent = "Tu cuenta no tiene autorización para esta operación.";
      statusTarget.className = "form-message error";
      return true;
    }
    return false;
  }

  function renderRequirementChips(name) {
    const container = document.querySelector(`#requisitos-${name}`);
    const chips = state[name].map(requirement => {
      const catalogItem = catalogs[name].find(item => item.id === requirement.id);
      if (!catalogItem) return null;
      const chip = element("button", `selection-chip ${name === "lenguajes" ? "chip-language" : "chip-tool"}`);
      chip.type = "button";
      chip.dataset.removeRequirement = name;
      chip.dataset.requirementId = String(requirement.id);
      chip.setAttribute("aria-label", `Quitar ${catalogItem.nombre}, ${requirement.importancia}`);
      chip.append(document.createTextNode(catalogItem.nombre));
      const importance = element("small", "requirement-chip-importance", requirement.importancia);
      const removeMark = element("span", "", "×");
      removeMark.setAttribute("aria-hidden", "true");
      chip.append(importance, removeMark);
      return chip;
    }).filter(Boolean);
    container.replaceChildren(...chips);
  }

  function renderCatalogs() {
    Object.entries(catalogs).forEach(([name, items]) => {
      const select = document.querySelector(`#solicitud-${name === "lenguajes" ? "lenguaje" : "herramienta"}`);
      items.forEach(item => {
        const option = element("option", "", item.nombre);
        option.value = String(item.id);
        select.append(option);
      });
    });
  }

  function setFormStatus(message, kind = "info") {
    formStatus.textContent = message;
    formStatus.className = `form-stage-note form-message ${kind}`;
  }

  function addRequirement(name) {
    const singular = name === "lenguajes" ? "lenguaje" : "herramienta";
    const select = document.querySelector(`#solicitud-${singular}`);
    const id = Number(select.value);
    const item = catalogs[name].find(option => option.id === id);
    if (!item) {
      setFormStatus(`Selecciona un ${singular} del catálogo.`, "error");
      select.focus();
      return;
    }
    if (state[name].some(requirement => requirement.id === id)) {
      setFormStatus(`${item.nombre} ya está incluido en los requisitos.`, "error");
      return;
    }
    const importanceId = name === "lenguajes" ? "#importancia-lenguaje" : "#importancia-herramienta";
    state[name].push({ id, importancia: document.querySelector(importanceId).value });
    select.value = "";
    renderRequirementChips(name);
    setFormStatus("Requisito añadido. Puedes cambiar su importancia antes de crear la solicitud.", "success");
  }

  function renderRequestList(solicitudes) {
    if (!solicitudes.length) {
      requestList.replaceChildren(element("p", "empty-row", "Todavía no hay solicitudes guardadas."));
      return;
    }
    const cards = solicitudes.map(solicitud => {
      const card = element("article", "request-card");
      const copy = element("div", "request-card-copy");
      copy.append(element("h3", "", solicitud.titulo), element("p", "", solicitud.descripcion));
      const counts = element("p", "request-requirement-counts",
        `${solicitud.lenguajes.length} lenguaje${solicitud.lenguajes.length === 1 ? "" : "s"} · ${solicitud.herramientas.length} herramienta${solicitud.herramientas.length === 1 ? "" : "s"}`);
      const button = element("button", "button button-outline button-small", "Ver coincidencias");
      button.type = "button";
      button.dataset.loadMatches = String(solicitud.id);
      card.append(copy, counts, button);
      return card;
    });
    requestList.replaceChildren(...cards);
  }

  async function loadRequests() {
    requestStatus.textContent = "Cargando solicitudes…";
    try {
      const response = await sessionApi.authorizedFetch("/api/solicitudes");
      if (handleAuthFailure(response, requestStatus)) return;
      if (!response.ok) {
        requestStatus.textContent = "No se pudieron cargar las solicitudes. Verifica que la migración del módulo esté aplicada.";
        requestStatus.className = "form-message error";
        return;
      }
      const result = await response.json();
      if (result?.ok !== true || !Array.isArray(result.datos)) throw new Error("Respuesta de solicitudes inválida");
      renderRequestList(result.datos);
      requestStatus.textContent = `${result.datos.length} solicitud${result.datos.length === 1 ? "" : "es"} disponible${result.datos.length === 1 ? "" : "s"}.`;
      requestStatus.className = "muted";
    } catch {
      requestStatus.textContent = "No fue posible conectar con el servidor.";
      requestStatus.className = "form-message error";
    }
  }

  function addResultCard(candidate) {
    const card = element("article", "match-card");
    const header = element("div", "match-card-heading");
    const name = element("h3", "", `${candidate.nombre} ${candidate.apellido}`.trim());
    const score = element("strong", "match-score", `${candidate.coincidencia}%`);
    header.append(name, score);
    const contact = element("p", "muted", [candidate.correo, candidate.ciudad].filter(Boolean).join(" · "));
    const counts = element("p", "match-counts", `Indispensables: ${candidate.indispensablesCumplidos}/${candidate.totalIndispensables} · Deseables: ${candidate.deseablesCumplidos}/${candidate.totalDeseables}`);
    const button = element("button", "button button-outline button-small", "Consultar perfil");
    button.type = "button";
    button.dataset.viewCandidate = String(candidate.id);
    card.append(header, contact, counts, button);
    return card;
  }

  function renderRequestCriteria(solicitud) {
    const groups = [
      { key: "indispensable", label: "Indispensables" },
      { key: "deseable", label: "Deseables" }
    ];
    const entries = [...solicitud.lenguajes, ...solicitud.herramientas];
    const blocks = groups.map(group => {
      const block = element("div", "criteria-group");
      block.append(element("strong", "", group.label));
      const values = entries.filter(item => item.importancia === group.key);
      block.append(element("p", "", values.length
        ? values.map(item => item.nombre).join(" · ")
        : "Ninguno"));
      return block;
    });
    matchesRequirements.replaceChildren(...blocks);
  }

  async function loadMatches(id) {
    matchesPanel.hidden = false;
    matchesList.replaceChildren(element("p", "muted", "Calculando coincidencias…"));
    matchesRequirements.replaceChildren();
    detailPanel.hidden = true;
    detailPanel.replaceChildren();
    matchesPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const response = await sessionApi.authorizedFetch(`/api/solicitudes/${encodeURIComponent(id)}/coincidencias`);
      if (handleAuthFailure(response, matchesStatus)) return;
      if (!response.ok) {
        matchesStatus.textContent = response.status === 404
          ? "No se encontró esa solicitud."
          : "No se pudieron calcular las coincidencias.";
        matchesList.replaceChildren();
        return;
      }
      const result = await response.json();
      if (result?.ok !== true || !Array.isArray(result.datos?.postulantes)) throw new Error("Respuesta de coincidencias inválida");

      matchesCount.textContent = `${result.datos.totalAptos} aptos`;
      const scoreInfo = result.datos.puntuacion;
      matchesStatus.textContent = `${result.datos.solicitud.titulo}. Puntuación: ${scoreInfo.formula}. ${scoreInfo.detalle} ${scoreInfo.reglaSinDeseables}`;
      renderRequestCriteria(result.datos.solicitud);
      if (!result.datos.postulantes.length) {
        matchesList.replaceChildren(element("p", "empty-row", "No hay postulantes que cumplan todos los requisitos indispensables."));
        return;
      }
      matchesList.replaceChildren(...result.datos.postulantes.map(addResultCard));
    } catch {
      matchesStatus.textContent = "No fue posible conectar con el servidor para calcular coincidencias.";
      matchesList.replaceChildren();
    }
  }

  function appendProfileSection(container, title, entries, formatEntry) {
    const section = element("section", "profile-detail-block");
    section.append(element("h4", "", title));
    if (!Array.isArray(entries) || entries.length === 0) {
      section.append(element("p", "muted", "Sin información registrada."));
    } else {
      const list = element("ul", "profile-detail-list");
      entries.forEach(entry => list.append(element("li", "", formatEntry(entry))));
      section.append(list);
    }
    container.append(section);
  }

  function renderCandidateDetail(profile) {
    detailPanel.replaceChildren();
    detailPanel.hidden = false;
    const heading = element("div", "card-heading");
    heading.append(element("h3", "", `${profile.nombre} ${profile.apellido}`.trim()));
    const close = element("button", "remove-entry", "Cerrar detalle");
    close.type = "button";
    close.dataset.closeDetail = "true";
    heading.append(close);
    detailPanel.append(heading);

    const contact = element("div", "data-grid");
    [["Correo", profile.correo], ["Teléfono", profile.telefono], ["Ciudad", profile.ciudad]].forEach(([label, value]) => {
      const item = document.createElement("div");
      item.append(element("small", "", label), element("p", "", value || "No disponible"));
      contact.append(item);
    });
    detailPanel.append(contact);
    appendProfileSection(detailPanel, "Formación", profile.formacion, item => [item.nivel, item.carrera, item.institucion].filter(Boolean).join(" · "));
    appendProfileSection(detailPanel, "Experiencia", profile.experiencias, item => [item.puesto, item.lugar, item.tipo, item.años_experiencia === null ? "" : `${item.años_experiencia} años`].filter(Boolean).join(" · "));
    appendProfileSection(detailPanel, "Lenguajes", profile.lenguajes, item => item.nombre);
    appendProfileSection(detailPanel, "Herramientas", profile.herramientas, item => item.nombre);
    appendProfileSection(detailPanel, "Proyectos", profile.proyectos, item => [item.nombre, item.descripcion, item.enlace].filter(Boolean).join(" · "));
    detailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function loadCandidate(id) {
    detailPanel.hidden = false;
    detailPanel.replaceChildren(element("p", "muted", "Cargando perfil…"));
    try {
      const response = await sessionApi.authorizedFetch(`/api/postulantes/${encodeURIComponent(id)}`);
      if (handleAuthFailure(response, detailPanel)) return;
      if (!response.ok) {
        detailPanel.replaceChildren(element("p", "form-message error", response.status === 403
          ? "El servidor no autorizó consultar este perfil."
          : "No se pudo cargar el detalle del perfil."));
        return;
      }
      const result = await response.json();
      if (result?.ok !== true || !result.datos) throw new Error("Respuesta de perfil inválida");
      renderCandidateDetail(result.datos);
    } catch {
      detailPanel.replaceChildren(element("p", "form-message error", "No fue posible conectar con el servidor."));
    }
  }

  form.addEventListener("click", event => {
    const add = event.target.closest("[data-add-requirement]");
    if (add) return addRequirement(add.dataset.addRequirement);
    const remove = event.target.closest("[data-remove-requirement]");
    if (remove) {
      const name = remove.dataset.removeRequirement;
      const id = Number(remove.dataset.requirementId);
      state[name] = state[name].filter(item => item.id !== id);
      renderRequirementChips(name);
    }
  });

  requestList.addEventListener("click", event => {
    const button = event.target.closest("[data-load-matches]");
    if (button) loadMatches(button.dataset.loadMatches);
  });
  matchesList.addEventListener("click", event => {
    const button = event.target.closest("[data-view-candidate]");
    if (button) loadCandidate(button.dataset.viewCandidate);
  });
  detailPanel.addEventListener("click", event => {
    if (event.target.closest("[data-close-detail]")) detailPanel.hidden = true;
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (state.lenguajes.length + state.herramientas.length === 0) {
      setFormStatus("Añade al menos un requisito de lenguaje o herramienta.", "error");
      return;
    }

    createButton.disabled = true;
    createButton.textContent = "Guardando solicitud…";
    setFormStatus("Guardando la solicitud…", "info");
    const payload = {
      titulo: document.querySelector("#solicitud-titulo").value.trim(),
      descripcion: document.querySelector("#solicitud-descripcion").value.trim(),
      lenguajes: [...state.lenguajes],
      herramientas: [...state.herramientas]
    };
    try {
      const response = await sessionApi.authorizedFetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      if (handleAuthFailure(response, formStatus)) return;
      const result = await response.json().catch(() => null);
      if (response.status === 400) {
        setFormStatus(result?.mensaje || "Revisa los datos de la solicitud.", "error");
        return;
      }
      if (!response.ok || result?.ok !== true || !result.datos?.id) {
        setFormStatus("No se pudo guardar la solicitud. Verifica que la migración del módulo esté aplicada.", "error");
        return;
      }

      form.reset();
      state.lenguajes = [];
      state.herramientas = [];
      renderRequirementChips("lenguajes");
      renderRequirementChips("herramientas");
      setFormStatus("Solicitud guardada. Mostrando los perfiles que cumplen los requisitos indispensables.", "success");
      await loadRequests();
      await loadMatches(result.datos.id);
    } catch {
      setFormStatus("No fue posible conectar con el servidor. Inténtalo de nuevo.", "error");
    } finally {
      createButton.disabled = false;
      createButton.innerHTML = 'Crear solicitud <span aria-hidden="true">→</span>';
    }
  });

  renderCatalogs();
  loadRequests();
})();
