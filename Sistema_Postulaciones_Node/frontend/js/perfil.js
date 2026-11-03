(() => {
  const sessionApi = window.CodeWorkSession;
  const form = document.querySelector("#perfil-form");
  const fields = document.querySelector("#perfil-fields");
  const status = document.querySelector("#perfil-status");
  const summaryName = document.querySelector("#perfil-nombre-resumen");
  const saveButton = document.querySelector("#perfil-save");
  if (!sessionApi || !form || !fields || !status || !summaryName || !saveButton) return;

  const session = sessionApi.requireRole("postulante");
  if (!session) return;
  const postulanteId = Number(session.postulante_id);
  if (!Number.isSafeInteger(postulanteId) || postulanteId <= 0) {
    sessionApi.clear();
    window.location.replace("/pages/login.html");
    return;
  }

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
  const knowledgeLevels = [
    { value: "basico", label: "Básico" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "experto", label: "Experto" }
  ];
  const levels = [
    "Técnico Medio", "Técnico Superior", "Universitario", "Licenciatura",
    "Postgrado", "Especialidad Profesional", "Maestría", "Doctorado",
    "Postdoctorado", "Formación Autodidacta"
  ];
  const collectionConfig = {
    formacion: {
      container: "#perfil-formacion", singular: "formación",
      fields: [
        { key: "nivel", label: "Nivel", type: "select", options: levels },
        { key: "carrera", label: "Carrera o área" },
        { key: "institucion", label: "Institución" }
      ]
    },
    experiencias: {
      container: "#perfil-experiencias", singular: "experiencia",
      fields: [
        { key: "lugar", label: "Empresa o proyecto" },
        { key: "puesto", label: "Puesto" },
        { key: "tipo", label: "Tipo de experiencia" },
        { key: "años_experiencia", label: "Años de experiencia", type: "number", min: "0", step: "1" }
      ]
    },
    proyectos: {
      container: "#perfil-proyectos", singular: "proyecto",
      fields: [
        { key: "nombre", label: "Nombre" },
        { key: "enlace", label: "Enlace de referencia", required: false },
        { key: "descripcion", label: "Descripción", type: "textarea", required: false }
      ]
    }
  };
  const state = { formacion: [], experiencias: [], proyectos: [], lenguajes: [], herramientas: [] };
  let nextEntryId = 1;
  let saving = false;

  function setStatus(message, kind = "info") {
    status.textContent = message;
    status.className = `form-message ${kind}`;
  }

  function appendRequiredMark(label) {
    const mark = document.createElement("span");
    mark.className = "required-mark";
    mark.setAttribute("aria-label", "obligatorio");
    mark.textContent = "*";
    label.append(" ", mark);
  }

  function makeField(collection, entry, definition) {
    const wrapper = document.createElement("div");
    wrapper.className = definition.key === "descripcion" ? "field field-full" : "field";
    const controlId = `perfil-${collection}-${entry.uid}-${definition.key.replace(/[^a-z0-9]/gi, "-")}`;
    const label = document.createElement("label");
    label.htmlFor = controlId;
    label.textContent = definition.label;

    let control;
    if (definition.type === "select") {
      control = document.createElement("select");
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Selecciona un nivel";
      control.append(placeholder);
      const options = [...definition.options];
      if (entry[definition.key] && !options.includes(entry[definition.key])) options.push(entry[definition.key]);
      options.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        control.append(option);
      });
      control.value = entry[definition.key] || "";
    } else if (definition.type === "textarea") {
      control = document.createElement("textarea");
      control.rows = 3;
      control.value = entry[definition.key] || "";
    } else {
      control = document.createElement("input");
      control.type = definition.type || "text";
      if (definition.min !== undefined) control.min = definition.min;
      if (definition.step !== undefined) control.step = definition.step;
      control.value = entry[definition.key] ?? "";
    }

    control.id = controlId;
    control.dataset.collection = collection;
    control.dataset.entryId = String(entry.uid);
    control.dataset.field = definition.key;
    if (definition.required !== false) {
      control.required = true;
      appendRequiredMark(label);
    }
    wrapper.append(label, control);
    return wrapper;
  }

  function renderCollection(collection) {
    const config = collectionConfig[collection];
    const container = document.querySelector(config.container);
    const entries = state[collection];
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "empty-entry-state";
      empty.textContent = `Aún no has añadido ${config.singular === "formación" ? "formación académica" : config.singular === "experiencia" ? "experiencia laboral" : "proyectos"}.`;
      container.replaceChildren(empty);
      return;
    }

    const cards = entries.map((entry, index) => {
      const card = document.createElement("details");
      card.className = "entry-card";
      card.open = true;
      card.dataset.profileEntry = String(entry.uid);

      const summary = document.createElement("summary");
      const main = document.createElement("span");
      main.className = "entry-summary-main";
      const number = document.createElement("span");
      number.className = "entry-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const text = document.createElement("span");
      const small = document.createElement("small");
      small.textContent = `${config.singular} ${String(index + 1).padStart(2, "0")}`.toUpperCase();
      const title = document.createElement("strong");
      title.dataset.entryTitle = "";
      title.textContent = entry.institucion || entry.lugar || entry.nombre || entry.carrera || `${config.singular} ${index + 1}`;
      text.append(small, title);
      main.append(number, text);
      const toggle = document.createElement("span");
      toggle.className = "entry-summary-end";
      toggle.textContent = "Contraer";
      const chevron = document.createElement("span");
      chevron.className = "entry-chevron";
      chevron.setAttribute("aria-hidden", "true");
      toggle.append(chevron);
      summary.append(main, toggle);

      const body = document.createElement("div");
      body.className = "entry-card-body";
      const fieldGrid = document.createElement("div");
      fieldGrid.className = "field-grid entry-fields";
      config.fields.forEach(definition => fieldGrid.append(makeField(collection, entry, definition)));
      const footer = document.createElement("div");
      footer.className = "entry-card-footer";
      const note = document.createElement("span");
      note.className = "entry-required-note";
      note.textContent = "* Completa los campos obligatorios.";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-entry";
      remove.dataset.removeCollection = collection;
      remove.dataset.entryId = String(entry.uid);
      remove.textContent = `Eliminar ${config.singular}`;
      footer.append(note, remove);
      body.append(fieldGrid, footer);
      card.append(summary, body);

      card.addEventListener("toggle", () => {
        toggle.firstChild.textContent = card.open ? "Contraer" : "Expandir";
      });
      return card;
    });
    container.replaceChildren(...cards);
  }

  function fillCatalogSelect(name) {
    const select = document.querySelector(`#perfil-selector-${name}`);
    const placeholder = select.options[0];
    select.replaceChildren(placeholder);
    catalogs[name].forEach(item => {
      const option = document.createElement("option");
      option.value = String(item.id);
      option.textContent = item.nombre;
      select.append(option);
    });
  }

  function renderChips(name) {
    const container = document.querySelector(`#perfil-chips-${name}`);
    const statusText = document.querySelector(`#perfil-estado-${name}`);
    const chips = state[name].map(knowledge => {
      const item = catalogs[name].find(option => option.id === knowledge.id);
      if (!item) return null;
      const card = document.createElement("article");
      const verified = Boolean(knowledge.nivel_verificado);
      card.className = `knowledge-chip ${name === "lenguajes" ? "knowledge-language" : "knowledge-tool"}${verified ? " is-verified" : " is-pending"}`;

      const heading = document.createElement("div");
      heading.className = "knowledge-chip-heading";
      const title = document.createElement("strong");
      title.textContent = item.nombre;
      const badge = document.createElement("span");
      badge.className = "knowledge-state-badge";
      badge.dataset.knowledgeStatus = "";
      heading.append(title, badge);
      card.append(heading);

      const declaredLabel = document.createElement("label");
      declaredLabel.className = "knowledge-level-field";
      declaredLabel.htmlFor = `perfil-conocimiento-${name}-${knowledge.id}`;
      const declaredCaption = document.createElement("span");
      declaredCaption.textContent = "Nivel declarado";
      const declaredSelect = document.createElement("select");
      declaredSelect.id = declaredLabel.htmlFor;
      declaredSelect.dataset.knowledgeLevel = name;
      declaredSelect.dataset.catalogId = String(knowledge.id);
      declaredSelect.setAttribute("aria-label", `Nivel declarado para ${item.nombre}`);
      declaredSelect.required = Boolean(knowledge.nivel_declarado);
      const pendingOption = document.createElement("option");
      pendingOption.value = "";
      pendingOption.textContent = "Pendiente de declarar";
      declaredSelect.append(pendingOption);
      knowledgeLevels.forEach(level => {
        const option = document.createElement("option");
        option.value = level.value;
        option.textContent = level.label;
        declaredSelect.append(option);
      });
      declaredSelect.value = knowledge.nivel_declarado || "";
      declaredLabel.append(declaredCaption, declaredSelect);
      card.append(declaredLabel);

      const verification = document.createElement("div");
      verification.className = "knowledge-verification";
      if (verified) {
        const verifiedLabel = document.createElement("strong");
        verifiedLabel.textContent = `Nivel verificado: ${labelForLevel(knowledge.nivel_verificado)}`;
        verification.append(verifiedLabel);
        const verifier = knowledge.verificado_por_usuario
          ? `Cuenta verificadora: ${knowledge.verificado_por_usuario}`
          : knowledge.verificado_por_usuario_id
            ? `ID del administrador verificador: ${knowledge.verificado_por_usuario_id}`
            : "Verificación administrativa";
        const detail = document.createElement("small");
        detail.textContent = knowledge.verificado_en ? `${verifier} · ${knowledge.verificado_en}` : verifier;
        verification.append(detail);
      }
      card.append(verification);

      if (verified) {
        const lockNote = document.createElement("small");
        lockNote.className = "knowledge-lock-note";
        lockNote.textContent = "Este conocimiento no se puede quitar mientras tenga una verificación administrativa.";
        card.append(lockNote);
      } else {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "knowledge-remove";
        remove.dataset.removeCatalog = name;
        remove.dataset.catalogId = String(knowledge.id);
        remove.setAttribute("aria-label", `Quitar ${item.nombre}`);
        remove.textContent = "Quitar conocimiento";
        card.append(remove);
      }

      updateKnowledgeStatus(badge, knowledge);
      return card;
    }).filter(Boolean);
    container.replaceChildren(...chips);
    const noun = name === "lenguajes" ? "lenguaje" : "herramienta";
    statusText.textContent = state[name].length
      ? `${state[name].length} ${noun}${state[name].length === 1 ? "" : "s"} seleccionado${state[name].length === 1 ? "" : "s"}.`
      : `Aún no hay ${name === "lenguajes" ? "lenguajes" : "herramientas"} seleccionados.`;
  }

  function labelForLevel(value) {
    return knowledgeLevels.find(level => level.value === value)?.label || "Nivel pendiente";
  }

  function updateKnowledgeStatus(badge, knowledge) {
    if (knowledge.nivel_verificado) {
      badge.className = "knowledge-state-badge is-verified";
      badge.textContent = "Verificado por administración";
    } else if (knowledge.nivel_declarado) {
      badge.className = "knowledge-state-badge is-pending";
      badge.textContent = "Pendiente de verificación";
    } else {
      badge.className = "knowledge-state-badge is-pending";
      badge.textContent = "Pendiente de declarar";
    }
  }

  function updateSummaryName() {
    const nombre = form.querySelector('[data-personal="nombre"]').value.trim();
    const apellido = form.querySelector('[data-personal="apellido"]').value.trim();
    summaryName.textContent = [nombre, apellido].filter(Boolean).join(" ") || "Tu perfil profesional";
  }

  function hydrate(profile) {
    const arrayFields = ["formacion", "experiencias", "lenguajes", "herramientas", "proyectos"];
    if (!profile || typeof profile !== "object" || arrayFields.some(key => !Array.isArray(profile[key]))) return false;

    ["nombre", "apellido", "correo", "telefono", "ciudad"].forEach(key => {
      const field = form.querySelector(`[data-personal="${key}"]`);
      field.value = typeof profile[key] === "string" ? profile[key] : "";
    });
    state.formacion = profile.formacion.map(item => ({ uid: nextEntryId++, nivel: item.nivel || "", carrera: item.carrera || "", institucion: item.institucion || "" }));
    state.experiencias = profile.experiencias.map(item => ({ uid: nextEntryId++, lugar: item.lugar || "", puesto: item.puesto || "", tipo: item.tipo || "", años_experiencia: item.años_experiencia ?? "" }));
    state.proyectos = profile.proyectos.map(item => ({ uid: nextEntryId++, nombre: item.nombre || "", enlace: item.enlace || "", descripcion: item.descripcion || "" }));

    ["lenguajes", "herramientas"].forEach(name => {
      state[name] = profile[name].map(item => ({
        id: Number(item.id),
        nivel_declarado: item.nivel_declarado || null,
        nivel_verificado: item.nivel_verificado || null,
        verificado_por_usuario_id: item.verificado_por_usuario_id ?? null,
        verificado_por_usuario: item.verificado_por_usuario || null,
        verificado_en: item.verificado_en || null
      })).filter(item => Number.isSafeInteger(item.id) && item.id > 0);
      profile[name].forEach(item => {
        const id = Number(item.id);
        if (!Number.isSafeInteger(id) || id <= 0) return;
        if (!catalogs[name].some(option => option.id === id)) catalogs[name].push({ id, nombre: String(item.nombre || `ID ${id}`) });
      });
      fillCatalogSelect(name);
      renderChips(name);
    });

    ["formacion", "experiencias", "proyectos"].forEach(renderCollection);
    updateSummaryName();
    return true;
  }

  function payloadFromForm() {
    const data = {};
    form.querySelectorAll("[data-personal]").forEach(field => {
      data[field.dataset.personal] = field.value.trim();
    });
    data.formacion = state.formacion.map(({ nivel, carrera, institucion }) => ({ nivel, carrera: carrera.trim(), institucion: institucion.trim() }));
    data.experiencias = state.experiencias.map(({ lugar, puesto, tipo, años_experiencia }) => ({
      lugar: lugar.trim(), puesto: puesto.trim(), tipo: tipo.trim(), años_experiencia: Number(años_experiencia)
    }));
    data.lenguajes = state.lenguajes.map(({ id, nivel_declarado }) => ({ id, nivel_declarado }));
    data.herramientas = state.herramientas.map(({ id, nivel_declarado }) => ({ id, nivel_declarado }));
    data.proyectos = state.proyectos.map(({ nombre, enlace, descripcion }) => ({ nombre: nombre.trim(), enlace: enlace.trim(), descripcion: descripcion.trim() }));
    return data;
  }

  function redirectForAuthFailure() {
    sessionApi.clear();
    window.location.replace("/pages/login.html");
  }

  async function loadProfile() {
    try {
      const response = await sessionApi.authorizedFetch(`/api/postulantes/${postulanteId}`);
      if (response.status === 401) return redirectForAuthFailure();
      if (response.status === 403) {
        setStatus("No tienes autorización para consultar este perfil.", "error");
        return;
      }
      if (response.status === 404) {
        setStatus("No se encontró el perfil asociado a esta cuenta.", "error");
        return;
      }
      if (!response.ok) {
        setStatus("No se pudo cargar el perfil. Inténtalo nuevamente más tarde.", "error");
        return;
      }

      const result = await response.json();
      if (result?.ok !== true || !hydrate(result.datos)) {
        setStatus("El servidor devolvió datos de perfil con un formato inesperado.", "error");
        return;
      }
      fields.disabled = false;
      setStatus("Perfil cargado. Puedes editar tus datos y guardar los cambios.", "success");
    } catch {
      setStatus("No fue posible conectar con el servidor. Verifica que esté disponible e inténtalo de nuevo.", "error");
    }
  }

  async function saveProfile() {
    if (saving) return;
    if (!form.reportValidity()) {
      form.querySelector(":invalid")?.focus();
      setStatus("Revisa los campos marcados antes de guardar.", "error");
      return;
    }

    saving = true;
    fields.disabled = true;
    saveButton.textContent = "Guardando…";
    setStatus("Guardando los cambios del perfil…", "info");

    try {
      const response = await sessionApi.authorizedFetch(`/api/postulantes/${postulanteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payloadFromForm())
      });
      if (response.status === 401) return redirectForAuthFailure();
      if (response.status === 403) {
        setStatus("El servidor rechazó la actualización: esta cuenta no puede modificar ese perfil.", "error");
        return;
      }

      let result = null;
      try { result = await response.json(); } catch { /* La respuesta de error podría no ser JSON. */ }
      if (response.status === 400) {
        setStatus(result?.mensaje || "Revisa los datos ingresados e inténtalo de nuevo.", "error");
        return;
      }
      if (!response.ok || result?.ok !== true) {
        setStatus("No se pudieron guardar los cambios. Inténtalo nuevamente más tarde.", "error");
        return;
      }

      if (result.datos) hydrate(result.datos);
      setStatus("Cambios guardados correctamente.", "success");
    } catch {
      setStatus("No fue posible conectar con el servidor. Tus cambios no se confirmaron.", "error");
    } finally {
      fields.disabled = false;
      saving = false;
      saveButton.innerHTML = 'Guardar cambios <span aria-hidden="true">→</span>';
    }
  }

  function syncEditedField(event) {
    const field = event.target;
    if (field.matches("[data-personal]")) updateSummaryName();
    if (field.matches("[data-knowledge-level]")) {
      const name = field.dataset.knowledgeLevel;
      const knowledge = state[name]?.find(item => item.id === Number(field.dataset.catalogId));
      if (knowledge) {
        knowledge.nivel_declarado = field.value || null;
        const badge = field.closest(".knowledge-chip")?.querySelector("[data-knowledge-status]");
        if (badge) updateKnowledgeStatus(badge, knowledge);
      }
      return;
    }
    if (!field.matches("[data-collection]")) return;
    const collection = field.dataset.collection;
    const entry = state[collection]?.find(item => item.uid === Number(field.dataset.entryId));
    if (!entry) return;
    entry[field.dataset.field] = field.value;
    const title = field.closest("details")?.querySelector("[data-entry-title]");
    if (title) title.textContent = entry.institucion || entry.lugar || entry.nombre || entry.carrera || `${collectionConfig[collection].singular}`;
  }

  form.addEventListener("input", syncEditedField);
  form.addEventListener("change", syncEditedField);

  form.addEventListener("click", event => {
    const addEntry = event.target.closest("[data-add]");
    if (addEntry) {
      const collection = addEntry.dataset.add;
      const empty = collection === "formacion"
        ? { nivel: "", carrera: "", institucion: "" }
        : collection === "experiencias"
          ? { lugar: "", puesto: "", tipo: "", años_experiencia: "" }
          : { nombre: "", enlace: "", descripcion: "" };
      state[collection].push({ uid: nextEntryId++, ...empty });
      renderCollection(collection);
      document.querySelector(`${collectionConfig[collection].container} [data-collection]`)?.focus();
      return;
    }

    const removeEntry = event.target.closest("[data-remove-collection]");
    if (removeEntry) {
      const collection = removeEntry.dataset.removeCollection;
      const id = Number(removeEntry.dataset.entryId);
      state[collection] = state[collection].filter(item => item.uid !== id);
      renderCollection(collection);
      return;
    }

    const addCatalog = event.target.closest("[data-add-catalog]");
    if (addCatalog) {
      const name = addCatalog.dataset.addCatalog;
      const select = document.querySelector(`#perfil-selector-${name}`);
      const levelSelect = document.querySelector(`#perfil-nivel-${name}`);
      const id = Number(select.value);
      const item = catalogs[name].find(option => option.id === id);
      const level = levelSelect.value;
      if (!item) {
        document.querySelector(`#perfil-estado-${name}`).textContent = "Selecciona una opción del catálogo.";
        select.focus();
        return;
      }
      if (!knowledgeLevels.some(option => option.value === level)) {
        document.querySelector(`#perfil-estado-${name}`).textContent = "Selecciona el nivel declarado para este conocimiento.";
        levelSelect.focus();
        return;
      }
      if (state[name].some(knowledge => knowledge.id === id)) {
        document.querySelector(`#perfil-estado-${name}`).textContent = item ? `${item.nombre} ya está seleccionado.` : "Selecciona una opción del catálogo.";
        select.value = "";
        select.focus();
        return;
      }
      state[name].push({
        id,
        nivel_declarado: level,
        nivel_verificado: null,
        verificado_por_usuario_id: null,
        verificado_por_usuario: null,
        verificado_en: null
      });
      select.value = "";
      levelSelect.value = "";
      renderChips(name);
      return;
    }

    const removeCatalog = event.target.closest("[data-remove-catalog]");
    if (removeCatalog) {
      const name = removeCatalog.dataset.removeCatalog;
      const id = Number(removeCatalog.dataset.catalogId);
      state[name] = state[name].filter(knowledge => knowledge.id !== id);
      renderChips(name);
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    saveProfile();
  });

  loadProfile();
})();
