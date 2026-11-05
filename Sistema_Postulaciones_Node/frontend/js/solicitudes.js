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
  const levels = [
    { value: "basico", label: "Básico" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "experto", label: "Experto" }
  ];
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
      const level = element("small", "requirement-chip-level", `Mínimo: ${levels.find(item => item.value === requirement.nivel_minimo)?.label || "Sin nivel"}`);
      const removeMark = element("span", "", "×");
      removeMark.setAttribute("aria-hidden", "true");
      chip.append(level, importance, removeMark);
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

  function contractLabel(value) {
    return ({ permanente: "Permanente", temporal: "Temporal", pasantia: "Pasantía" })[value] || "Solicitud anterior";
  }

  function arrayLabel(values, labels) {
    return Array.isArray(values) && values.length ? values.map(value => labels[value] || value).join(", ") : "Sin criterio anterior";
  }

  function statusLabel(status) {
    return ({
      cumple: "Cumple",
      cumple_provisional: "Cumple provisionalmente (declarado)",
      no_cumple: "No cumple",
      desconocido: "Desconocido",
      no_disponible: "No disponible",
      sin_criterio: "Sin criterio en esta solicitud"
    })[status] || status;
  }

  function formatCriterion(criterion) {
    if (criterion.tipo === "disponibilidad") return `Disponibilidad: ${statusLabel(criterion.estado)}`;
    if (criterion.tipo === "jornada" || criterion.tipo === "modalidad") {
      const name = criterion.tipo === "jornada" ? "Jornada" : "Modalidad";
      const wants = (criterion.solicitadas || []).join(", ");
      const has = (criterion.postulante || []).join(", ");
      return `${name}: ${statusLabel(criterion.estado)}${wants ? ` · Solicitud: ${wants}` : ""}${has ? ` · Perfil: ${has}` : ""}`;
    }
    const actual = criterion.nivel_postulante
      ? `Nivel ${criterion.nivel_postulante}${criterion.origen_nivel ? ` (${criterion.origen_nivel})` : ""}`
      : "Sin nivel registrado";
    const minimum = criterion.nivel_requerido ? ` · Mínimo ${criterion.nivel_requerido}` : "";
    return `${criterion.requisito}: ${statusLabel(criterion.estado)} · ${actual}${minimum}`;
  }

  function addDetailedCandidateCard(candidate) {
    const card = element("article", "match-card");
    const heading = element("div", "match-card-heading");
    heading.append(
      element("h3", "", `${candidate.nombre} ${candidate.apellido}`.trim()),
      element("strong", "match-score", candidate.coincidencia === null ? "—" : `${candidate.coincidencia}%`)
    );
    card.append(heading);
    card.append(element("p", "match-candidate-state", statusLabel(candidate.estado)));
    card.append(element("p", "muted", [candidate.correo, candidate.ciudad].filter(Boolean).join(" · ") || "Sin datos de contacto"));
    card.append(element("p", "match-counts", candidate.coincidencia === null
      ? "No se puede calcular el porcentaje con la información disponible."
      : `Coincidencia técnica: ${candidate.deseablesCumplidos}/${candidate.totalDeseables} deseables.`));

    const list = element("ul", "match-criteria-list");
    (candidate.criterios || []).filter(item => item.estado !== "sin_criterio").forEach(item => {
      const row = element("li", `criterion-${item.estado}`);
      row.append(document.createTextNode(formatCriterion(item)));
      if (item.explicacion) row.append(element("small", "criterion-explanation", item.explicacion));
      list.append(row);
    });
    if (list.children.length) card.append(list);

    const button = element("button", "button button-outline button-small", "Consultar perfil");
    button.type = "button";
    button.dataset.viewCandidate = String(candidate.id);
    card.append(button);
    return card;
  }

  function renderCandidateCategories(categorias) {
    const definitions = [
      ["compatibles", "Disponibles que cumplen los obligatorios", "No hay candidatos disponibles que cumplan todos los criterios obligatorios."],
      ["noCumplenObligatorios", "No cumplen uno o más requisitos obligatorios", "Ningún perfil tiene incumplimientos obligatorios registrados."],
      ["noDisponibles", "Postulantes no disponibles", "No hay perfiles marcados como no disponibles."],
      ["informacionInsuficiente", "Información insuficiente para determinar compatibilidad", "No hay perfiles pendientes por información faltante."]
    ];
    const sections = definitions.map(([key, title, empty]) => {
      const section = element("section", "match-category");
      section.append(element("h3", "", `${title} (${categorias[key].length})`));
      const grid = element("div", "match-category-grid");
      if (categorias[key].length) grid.replaceChildren(...categorias[key].map(addDetailedCandidateCard));
      else grid.append(element("p", "empty-row", empty));
      section.append(grid);
      return section;
    });
    matchesList.replaceChildren(...sections);
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
    const levelId = name === "lenguajes" ? "#nivel-minimo-lenguaje" : "#nivel-minimo-herramienta";
    const nivelMinimo = document.querySelector(levelId).value;
    if (!levels.some(level => level.value === nivelMinimo)) {
      setFormStatus("Selecciona el nivel mínimo del requisito.", "error");
      document.querySelector(levelId).focus();
      return;
    }
    state[name].push({ id, importancia: document.querySelector(importanceId).value, nivel_minimo: nivelMinimo });
    select.value = "";
    document.querySelector(levelId).value = "";
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
      const contract = element("p", "request-contract", `Contratación: ${contractLabel(solicitud.tipo_contratacion)}`);
      copy.append(contract);
      const counts = element("p", "request-requirement-counts",
        `${solicitud.lenguajes.length} lenguaje${solicitud.lenguajes.length === 1 ? "" : "s"} · ${solicitud.herramientas.length} herramienta${solicitud.herramientas.length === 1 ? "" : "s"} · ${arrayLabel(solicitud.jornadas, { tiempo_completo: "Tiempo completo", tiempo_parcial: "Tiempo parcial" })} · ${arrayLabel(solicitud.modalidades, { presencial: "Presencial", remoto: "Remoto", hibrido: "Híbrido" })}`);
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

  function renderDetailedRequestCriteria(solicitud) {
    const entries = [...solicitud.lenguajes, ...solicitud.herramientas];
    const groups = [
      { key: "indispensable", label: "Obligatorios" },
      { key: "deseable", label: "Deseables" }
    ].map(group => {
      const block = element("div", `criteria-group ${group.key}`);
      block.append(element("strong", "", group.label));
      const selected = entries.filter(item => item.importancia === group.key);
      block.append(element("p", "", selected.length
        ? selected.map(item => `${item.nombre}: mínimo ${levels.find(level => level.value === item.nivel_minimo)?.label || "sin nivel"}`).join(" · ")
        : "Ninguno"));
      return block;
    });
    const job = element("div", "criteria-group criteria-job");
    job.append(element("strong", "", "Condiciones laborales"));
    job.append(element("p", "", [
      `Contratación: ${contractLabel(solicitud.tipo_contratacion)}`,
      `Jornada: ${arrayLabel(solicitud.jornadas, { tiempo_completo: "Tiempo completo", tiempo_parcial: "Tiempo parcial" })}`,
      `Modalidad: ${arrayLabel(solicitud.modalidades, { presencial: "Presencial", remoto: "Remoto", hibrido: "Híbrido" })}`
    ].join(" · ")));
    matchesRequirements.replaceChildren(...groups, job);
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
      if (result?.ok !== true || !result.datos?.categorias) throw new Error("Respuesta de coincidencias inválida");

      const groups = result.datos.categorias;
      matchesCount.textContent = `${result.datos.totalAptos} compatibles · ${groups.informacionInsuficiente.length} desconocidos`;
      const scoreInfo = result.datos.puntuacion;
      matchesStatus.textContent = `${result.datos.solicitud.titulo}. Puntuación: ${scoreInfo.formula}. ${scoreInfo.detalle} ${scoreInfo.reglaSinDeseables}`;
      renderDetailedRequestCriteria(result.datos.solicitud);
      renderCandidateCategories(groups);
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
    appendProfileSection(detailPanel, "Disponibilidad y preferencias", [{
      disponibilidad: profile.disponibilidad,
      jornadas: profile.jornadas || [],
      modalidades: profile.modalidades || []
    }], item => [
      `Estado: ${item.disponibilidad === "disponible" ? "Disponible" : item.disponibilidad === "no_disponible" ? "No disponible" : "Desconocido"}`,
      `Jornadas: ${arrayLabel(item.jornadas, { tiempo_completo: "Tiempo completo", tiempo_parcial: "Tiempo parcial" })}`,
      `Modalidades: ${arrayLabel(item.modalidades, { presencial: "Presencial", remoto: "Remoto", hibrido: "Híbrido" })}`
    ].join(" · "));
    appendProfileSection(detailPanel, "Formación", profile.formacion, item => [item.nivel, item.carrera, item.institucion].filter(Boolean).join(" · "));
    appendProfileSection(detailPanel, "Experiencia", profile.experiencias, item => [item.puesto, item.lugar, item.tipo, item.años_experiencia === null ? "" : `${item.años_experiencia} años`].filter(Boolean).join(" · "));
    const showKnowledge = item => `${item.nombre}: declarado ${levels.find(level => level.value === item.nivel_declarado)?.label || "pendiente"}; verificado ${levels.find(level => level.value === item.nivel_verificado)?.label || "sin verificación"}${item.verificado_por_usuario ? ` por ${item.verificado_por_usuario}` : ""}`;
    appendProfileSection(detailPanel, "Lenguajes", profile.lenguajes, showKnowledge);
    appendProfileSection(detailPanel, "Herramientas", profile.herramientas, showKnowledge);
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
    const jornadas = [...form.querySelectorAll("[data-request-jornada]:checked")].map(field => field.value);
    const modalidades = [...form.querySelectorAll("[data-request-modalidad]:checked")].map(field => field.value);
    if (!jornadas.length || !modalidades.length) {
      setFormStatus("Selecciona al menos una jornada y una modalidad aceptadas.", "error");
      return;
    }

    createButton.disabled = true;
    createButton.textContent = "Guardando solicitud…";
    setFormStatus("Guardando la solicitud…", "info");
    const payload = {
      titulo: document.querySelector("#solicitud-titulo").value.trim(),
      descripcion: document.querySelector("#solicitud-descripcion").value.trim(),
      tipo_contratacion: document.querySelector("#solicitud-tipo-contratacion").value,
      jornadas,
      modalidades,
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
