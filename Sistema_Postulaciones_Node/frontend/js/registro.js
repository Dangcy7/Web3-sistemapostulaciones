(() => {
  const form = document.querySelector("#registro-postulante");
  if (!form) return;

  // Catálogos copiados del SQL vigente. Sus IDs son los que espera el backend.
  const catalogs = {
    lenguajes: [
      { id: 1, nombre: "Python" },
      { id: 2, nombre: "Java" },
      { id: 3, nombre: "JavaScript" },
      { id: 4, nombre: "C++" },
      { id: 5, nombre: "PHP" }
    ],
    herramientas: [
      { id: 1, nombre: "Git" },
      { id: 2, nombre: "GitHub" },
      { id: 3, nombre: "Docker" },
      { id: 4, nombre: "MySQL" },
      { id: 5, nombre: "React" },
      { id: 6, nombre: "Node.js" },
      { id: 7, nombre: "Flask" }
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

  const state = {
    formacion: [],
    experiencias: [],
    lenguajes: [],
    herramientas: [],
    proyectos: []
  };
  let nextEntryId = 1;
  let submitting = false;

  const containers = {
    formacion: document.querySelector("#lista-formacion"),
    experiencias: document.querySelector("#lista-experiencias"),
    proyectos: document.querySelector("#lista-proyectos")
  };
  const singular = {
    formacion: "formación",
    experiencias: "experiencia",
    proyectos: "proyecto"
  };
  const emptyMessages = {
    formacion: "Aún no has añadido formación académica.",
    experiencias: "Aún no has añadido experiencia laboral.",
    proyectos: "Aún no has añadido proyectos."
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function createEntry(collection) {
    const id = nextEntryId++;
    if (collection === "formacion") {
      return { id, nivel: "", carrera: "", institucion: "", open: true };
    }
    if (collection === "experiencias") {
      return { id, lugar: "", puesto: "", tipo: "", años_experiencia: "", open: true };
    }
    return { id, nombre: "", enlace: "", descripcion: "", open: true };
  }

  function entryLabel(collection, entry, index) {
    const number = String(index + 1).padStart(2, "0");
    if (collection === "formacion") return entry.institucion || entry.carrera || `Formación ${number}`;
    if (collection === "experiencias") return entry.lugar || entry.puesto || `Experiencia ${number}`;
    return entry.nombre || `Proyecto ${number}`;
  }

  function renderEntry(collection, entry, index) {
    const number = String(index + 1).padStart(2, "0");
    const open = entry.open ? " open" : "";
    let fields = "";

    if (collection === "formacion") {
      const options = levels.map(level => `<option value="${escapeHTML(level)}"${entry.nivel === level ? " selected" : ""}>${escapeHTML(level)}</option>`).join("");
      fields = `
        <div class="field-grid entry-fields">
          <div class="field"><label for="nivel-${entry.id}">Nivel <span class="required-mark" aria-label="obligatorio">*</span></label><select id="nivel-${entry.id}" data-entry-collection="formacion" data-entry-id="${entry.id}" data-entry-field="nivel" required><option value="">Selecciona un nivel</option>${options}</select></div>
          <div class="field"><label for="carrera-${entry.id}">Carrera o área <span class="required-mark" aria-label="obligatorio">*</span></label><input id="carrera-${entry.id}" data-entry-collection="formacion" data-entry-id="${entry.id}" data-entry-field="carrera" value="${escapeHTML(entry.carrera)}" placeholder="Ej. Ingeniería Informática" required></div>
          <div class="field field-full"><label for="institucion-${entry.id}">Institución <span class="required-mark" aria-label="obligatorio">*</span></label><input id="institucion-${entry.id}" data-entry-collection="formacion" data-entry-id="${entry.id}" data-entry-field="institucion" value="${escapeHTML(entry.institucion)}" placeholder="Nombre de la institución" required></div>
        </div>`;
    } else if (collection === "experiencias") {
      fields = `
        <div class="field-grid entry-fields">
          <div class="field"><label for="lugar-${entry.id}">Empresa o proyecto <span class="required-mark" aria-label="obligatorio">*</span></label><input id="lugar-${entry.id}" data-entry-collection="experiencias" data-entry-id="${entry.id}" data-entry-field="lugar" value="${escapeHTML(entry.lugar)}" placeholder="Dónde trabajaste" required></div>
          <div class="field"><label for="puesto-${entry.id}">Puesto <span class="required-mark" aria-label="obligatorio">*</span></label><input id="puesto-${entry.id}" data-entry-collection="experiencias" data-entry-id="${entry.id}" data-entry-field="puesto" value="${escapeHTML(entry.puesto)}" placeholder="Tu rol" required></div>
          <div class="field"><label for="tipo-${entry.id}">Tipo de experiencia <span class="required-mark" aria-label="obligatorio">*</span></label><input id="tipo-${entry.id}" data-entry-collection="experiencias" data-entry-id="${entry.id}" data-entry-field="tipo" value="${escapeHTML(entry.tipo)}" placeholder="Ej. Empresa o freelance" required></div>
          <div class="field"><label for="años-${entry.id}">Años de experiencia <span class="required-mark" aria-label="obligatorio">*</span></label><input id="años-${entry.id}" type="number" min="0" step="1" data-entry-collection="experiencias" data-entry-id="${entry.id}" data-entry-field="años_experiencia" value="${escapeHTML(entry.años_experiencia)}" placeholder="0" required></div>
        </div>`;
    } else {
      fields = `
        <div class="field-grid entry-fields">
          <div class="field"><label for="proyecto-${entry.id}">Nombre <span class="required-mark" aria-label="obligatorio">*</span></label><input id="proyecto-${entry.id}" data-entry-collection="proyectos" data-entry-id="${entry.id}" data-entry-field="nombre" value="${escapeHTML(entry.nombre)}" placeholder="Nombre del proyecto" required></div>
          <div class="field"><label for="enlace-${entry.id}">Enlace de referencia <span class="optional-field-mark">Opcional</span></label><input id="enlace-${entry.id}" type="url" data-entry-collection="proyectos" data-entry-id="${entry.id}" data-entry-field="enlace" value="${escapeHTML(entry.enlace)}" placeholder="https://"></div>
          <div class="field field-full"><label for="descripcion-${entry.id}">Descripción <span class="optional-field-mark">Opcional</span></label><textarea id="descripcion-${entry.id}" rows="3" data-entry-collection="proyectos" data-entry-id="${entry.id}" data-entry-field="descripcion" placeholder="¿Qué problema resuelve? ¿Cuál fue tu aporte?">${escapeHTML(entry.descripcion)}</textarea></div>
        </div>`;
    }

    return `
      <details class="entry-card" data-entry-card="${entry.id}"${open}>
        <summary>
          <span class="entry-summary-main"><span class="entry-number">${number}</span><span><small>${singular[collection].toUpperCase()} ${number}</small><strong data-entry-title>${escapeHTML(entryLabel(collection, entry, index))}</strong></span></span>
          <span class="entry-summary-end"><span class="entry-toggle-label">${entry.open ? "Contraer" : "Expandir"}</span><span class="entry-chevron" aria-hidden="true"></span></span>
        </summary>
        <div class="entry-card-body">${fields}<div class="entry-card-footer"><span class="entry-required-note"><span aria-hidden="true">*</span> Completa los campos obligatorios de este registro.</span><button class="remove-entry" type="button" data-remove-entry="${collection}" data-entry-id="${entry.id}">Eliminar ${singular[collection]}</button></div></div>
      </details>`;
  }

  function renderCollection(collection) {
    const entries = state[collection];
    const container = containers[collection];
    if (!entries.length) {
      container.innerHTML = `<p class="empty-entry-state"><span aria-hidden="true">＋</span>${emptyMessages[collection]}</p>`;
      updateProgress();
      return;
    }

    container.innerHTML = entries.map((entry, index) => renderEntry(collection, entry, index)).join("");
    container.querySelectorAll("details[data-entry-card]").forEach(details => {
      const id = Number(details.getAttribute("data-entry-card"));
      const entry = entries.find(item => item.id === id);
      details.addEventListener("toggle", () => {
        if (!entry) return;
        entry.open = details.open;
        const toggleLabel = details.querySelector(".entry-toggle-label");
        if (toggleLabel) toggleLabel.textContent = details.open ? "Contraer" : "Expandir";
      });
    });
    updateProgress();
  }

  function renderCatalogOptions(name) {
    const select = document.querySelector(`#selector-${name}`);
    const label = name === "lenguajes" ? "Selecciona un lenguaje" : "Selecciona una herramienta";
    select.innerHTML = `<option value="">${label}</option>` + catalogs[name]
      .map(item => `<option value="${item.id}">${escapeHTML(item.nombre)}</option>`)
      .join("");
  }

  function renderChips(name) {
    const container = document.querySelector(`#chips-${name}`);
    const selected = state[name];
    container.innerHTML = selected.map(selection => {
      const item = catalogs[name].find(option => option.id === selection.id);
      if (!item) return "";
      const options = knowledgeLevels.map(level => `<option value="${level.value}"${selection.nivel_declarado === level.value ? " selected" : ""}>${level.label}</option>`).join("");
      return `<div class="knowledge-chip ${name === "lenguajes" ? "knowledge-language" : "knowledge-tool"}">
        <strong>${escapeHTML(item.nombre)}</strong>
        <label class="knowledge-level-field"><span>Nivel declarado</span><select data-knowledge-level="${name}" data-catalog-id="${item.id}" aria-label="Nivel declarado para ${escapeHTML(item.nombre)}" required><option value="">Selecciona nivel</option>${options}</select></label>
        <button class="knowledge-remove" type="button" data-remove-catalog="${name}" data-catalog-id="${item.id}" aria-label="Quitar ${escapeHTML(item.nombre)}">Quitar</button>
      </div>`;
    }).join("");

    const noun = name === "lenguajes" ? "lenguaje" : "herramienta";
    const status = document.querySelector(`#estado-${name}`);
    status.textContent = selected.length
      ? `${selected.length} ${noun}${selected.length === 1 ? "" : "s"} seleccionado${selected.length === 1 ? "" : "s"}.`
      : `Aún no has seleccionado ${name === "lenguajes" ? "lenguajes" : "herramientas"}.`;
    updateProgress();
  }

  function validPersonalSection() {
    const fields = [...form.querySelectorAll("[data-progress-field='personales']")];
    return fields.length > 0 && fields.every(field => field.checkValidity());
  }

  function completeEntries(collection, requiredFields) {
    return state[collection].length > 0 && state[collection].every(entry =>
      requiredFields.every(field => String(entry[field] ?? "").trim() !== "")
    );
  }

  function updateProgress() {
    const complete = {
      personales: validPersonalSection(),
      formacion: completeEntries("formacion", ["nivel", "carrera", "institucion"]),
      experiencias: completeEntries("experiencias", ["lugar", "puesto", "tipo", "años_experiencia"]),
      conocimientos: state.lenguajes.length + state.herramientas.length > 0 &&
        [...state.lenguajes, ...state.herramientas].every(item => knowledgeLevels.some(level => level.value === item.nivel_declarado)),
      proyectos: completeEntries("proyectos", ["nombre"])
    };
    const completedCount = Object.values(complete).filter(Boolean).length;
    const valueText = `${completedCount} de 5 secciones con información`;
    const bar = document.querySelector("#progress-bar");
    bar.setAttribute("aria-valuenow", String(completedCount));
    bar.setAttribute("aria-valuetext", valueText);
    document.querySelector("#progress-count").textContent = valueText;
    document.querySelector("#progress-fill").style.width = `${completedCount * 20}%`;
    Object.entries(complete).forEach(([section, isComplete]) => {
      const step = document.querySelector(`[data-progress-step="${section}"]`);
      step.classList.toggle("is-complete", isComplete);
      if (isComplete) step.setAttribute("aria-label", `${step.textContent.trim()}, completada`);
      else step.removeAttribute("aria-label");
    });
  }

  function updateFieldError(field) {
    const error = document.querySelector(`#error-${field.id}`);
    if (!error) return;
    if (field.validity.valueMissing) error.textContent = "Completa este campo.";
    else if (field.validity.typeMismatch) error.textContent = "Revisa el formato de este dato.";
    else if (field.validity.tooShort) error.textContent = `Escribe al menos ${field.minLength} caracteres.`;
    else error.textContent = "";
    field.setAttribute("aria-invalid", String(!field.validity.valid));
  }

  function updateEntryTitle(collection, entry) {
    const container = containers[collection];
    const card = [...container.querySelectorAll("details[data-entry-card]")]
      .find(element => Number(element.getAttribute("data-entry-card")) === entry.id);
    const title = card?.querySelector("[data-entry-title]");
    if (!title) return;
    const index = state[collection].findIndex(item => item.id === entry.id);
    title.textContent = entryLabel(collection, entry, index);
  }

  function registrationPayload() {
    const values = new FormData(form);
    return {
      nombre: String(values.get("nombre") || "").trim(),
      apellido: String(values.get("apellido") || "").trim(),
      telefono: String(values.get("telefono") || "").trim(),
      correo: String(values.get("correo") || "").trim(),
      ciudad: String(values.get("ciudad") || "").trim(),
      usuario: String(values.get("usuario") || "").trim(),
      contraseña: String(values.get("contrasena") || ""),
      formacion: state.formacion.map(({ nivel, carrera, institucion }) => ({ nivel, carrera: carrera.trim(), institucion: institucion.trim() })),
      experiencias: state.experiencias.map(({ lugar, puesto, tipo, años_experiencia }) => ({ lugar: lugar.trim(), puesto: puesto.trim(), tipo: tipo.trim(), años_experiencia: Number(años_experiencia) })),
      lenguajes: state.lenguajes.map(({ id, nivel_declarado }) => ({ id, nivel_declarado })),
      herramientas: state.herramientas.map(({ id, nivel_declarado }) => ({ id, nivel_declarado })),
      proyectos: state.proyectos.map(({ nombre, enlace, descripcion }) => ({ nombre: nombre.trim(), enlace: enlace.trim(), descripcion: descripcion.trim() }))
    };
  }

  function announce(message, kind = "info") {
    const region = document.querySelector("#mensaje-registro");
    region.textContent = message;
    region.className = `form-message ${kind}`;
  }

  function announceRegistrationSuccess() {
    const region = document.querySelector("#mensaje-registro");
    region.textContent = "Tu registro se completó correctamente. Ya puedes ";
    region.className = "form-message success";
    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.textContent = "iniciar sesión";
    region.append(loginLink, document.createTextNode("."));
  }

  form.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add-entry]");
    if (addButton) {
      const collection = addButton.getAttribute("data-add-entry");
      const entry = createEntry(collection);
      state[collection].push(entry);
      renderCollection(collection);
      const container = containers[collection];
      const newField = container.querySelector(`[data-entry-id="${entry.id}"] input, [data-entry-id="${entry.id}"] select, [data-entry-id="${entry.id}"] textarea`);
      newField?.focus();
      announce(`Añadiste una ${singular[collection]}. Completa sus campos para continuar.`, "info");
      return;
    }

    const removeEntryButton = event.target.closest("[data-remove-entry]");
    if (removeEntryButton) {
      const collection = removeEntryButton.getAttribute("data-remove-entry");
      const id = Number(removeEntryButton.getAttribute("data-entry-id"));
      state[collection] = state[collection].filter(entry => entry.id !== id);
      renderCollection(collection);
      announce(`Se eliminó la ${singular[collection]}.`, "info");
      return;
    }

    const addCatalogButton = event.target.closest("[data-add-catalog]");
    if (addCatalogButton) {
      const name = addCatalogButton.getAttribute("data-add-catalog");
      const select = document.querySelector(`#selector-${name}`);
      const id = Number(select.value);
      const item = catalogs[name].find(option => option.id === id);
      const levelSelect = document.querySelector(`#nivel-${name}`);
      const level = levelSelect.value;
      if (!item) {
        document.querySelector(`#estado-${name}`).textContent = "Selecciona una opción del catálogo.";
        select.focus();
        return;
      }
      if (!knowledgeLevels.some(option => option.value === level)) {
        document.querySelector(`#estado-${name}`).textContent = "Selecciona el nivel declarado para este conocimiento.";
        levelSelect.focus();
        return;
      }
      if (state[name].some(selected => selected.id === id)) {
        document.querySelector(`#estado-${name}`).textContent = `${item.nombre} ya está seleccionado.`;
        select.value = "";
        select.focus();
        return;
      }
      state[name].push({ id, nivel_declarado: level });
      select.value = "";
      levelSelect.value = "";
      renderChips(name);
      announce(`Añadiste ${item.nombre}.`, "info");
      return;
    }

    const removeChip = event.target.closest("[data-remove-catalog]");
    if (removeChip) {
      const name = removeChip.getAttribute("data-remove-catalog");
      const id = Number(removeChip.getAttribute("data-catalog-id"));
      const item = catalogs[name].find(option => option.id === id);
      state[name] = state[name].filter(selected => selected.id !== id);
      renderChips(name);
      announce(`Quitaste ${item?.nombre || "la selección"}.`, "info");
    }
  });

  form.addEventListener("change", event => {
    const field = event.target;
    if (!field.matches("[data-knowledge-level]")) return;
    const name = field.dataset.knowledgeLevel;
    const id = Number(field.dataset.catalogId);
    const selection = state[name].find(item => item.id === id);
    if (!selection) return;
    selection.nivel_declarado = field.value;
    updateProgress();
  });

  form.addEventListener("input", event => {
    const field = event.target;
    if (field.matches("[data-entry-collection]")) {
      const collection = field.getAttribute("data-entry-collection");
      const id = Number(field.getAttribute("data-entry-id"));
      const key = field.getAttribute("data-entry-field");
      const entry = state[collection].find(item => item.id === id);
      if (entry) {
        entry[key] = field.value;
        updateEntryTitle(collection, entry);
      }
    }
    if (field.matches("[data-progress-field]")) updateFieldError(field);
    updateProgress();
    const message = document.querySelector("#mensaje-registro");
    if (message.classList.contains("success") || message.classList.contains("error")) announce("");
  });

  form.addEventListener("change", event => {
    const field = event.target;
    if (field.matches("[data-entry-collection]")) {
      const collection = field.getAttribute("data-entry-collection");
      const id = Number(field.getAttribute("data-entry-id"));
      const key = field.getAttribute("data-entry-field");
      const entry = state[collection].find(item => item.id === id);
      if (entry) {
        entry[key] = field.value;
        updateEntryTitle(collection, entry);
      }
    }
    if (field.matches("[data-progress-field]")) updateFieldError(field);
    updateProgress();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (submitting) return;

    form.classList.add("was-validated");
    form.querySelectorAll("details.entry-card").forEach(card => { card.open = true; });
    form.querySelectorAll("[data-progress-field]").forEach(updateFieldError);

    if (!form.reportValidity()) {
      const firstInvalid = form.querySelector(":invalid");
      firstInvalid?.focus();
      announce("Revisa los campos marcados. Las secciones opcionales pueden dejarse vacías.", "error");
      updateProgress();
      return;
    }

    updateProgress();
    submitRegistration(registrationPayload());
  });

  async function submitRegistration(payload) {
    const submitButton = form.querySelector("button[type='submit']");
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Enviando registro…";
    announce("Estamos guardando tu perfil. No cierres esta página.", "info");

    try {
      const response = await fetch("/api/postulantes/completo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      let result = null;
      try {
        result = await response.json();
      } catch {
        // Algunos errores de infraestructura pueden devolver un cuerpo no JSON.
      }

      if (response.status === 409) {
        announce(result?.mensaje || "El usuario o el correo ya está registrado. Revisa esos datos.", "error");
        return;
      }
      if (response.status === 400) {
        announce(result?.mensaje || "Revisa los datos ingresados e inténtalo de nuevo.", "error");
        return;
      }
      if (!response.ok || result?.ok !== true) {
        announce("No se pudo completar el registro por un problema del servidor. Inténtalo más tarde.", "error");
        return;
      }

      announceRegistrationSuccess();
      form.querySelectorAll("input, select, textarea, button").forEach(control => { control.disabled = true; });
      submitButton.textContent = "Registro completado";
    } catch {
      announce("No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.", "error");
    } finally {
      if (!document.querySelector("#mensaje-registro").classList.contains("success")) {
        submitting = false;
        submitButton.disabled = false;
        submitButton.textContent = "Crear cuenta";
      }
    }
  }

  Object.keys(containers).forEach(renderCollection);
  Object.keys(catalogs).forEach(name => {
    renderCatalogOptions(name);
    renderChips(name);
  });
  form.querySelectorAll("[data-progress-field]").forEach(field => {
    field.addEventListener("blur", () => {
      if (form.classList.contains("was-validated") || field.value) updateFieldError(field);
    });
  });
  updateProgress();
})();
