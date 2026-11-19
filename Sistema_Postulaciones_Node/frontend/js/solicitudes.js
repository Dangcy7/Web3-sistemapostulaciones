(() => {
  const api = window.CodeWorkSession, form = document.querySelector("#solicitud-form");
  if (!api || !form || !api.requireRole("admin")) return;
  const status = document.querySelector("#solicitud-form-status"), list = document.querySelector("#solicitudes-list"), listStatus = document.querySelector("#solicitudes-status");
  const catalogs = { lenguajes: [], herramientas: [] };
  const labels = { permanente: "Permanente", temporal: "Temporal", pasantia: "Pasantía", borrador: "Borrador", publicada: "Publicada", cerrada: "Cerrada", pendiente: "Pendiente", en_revision: "En revisión", aceptada: "Aceptada", rechazada: "Rechazada", tiempo_completo: "Tiempo completo", tiempo_parcial: "Tiempo parcial", presencial: "Presencial", remoto: "Remoto", hibrido: "Híbrido" };
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined && text !== null) n.textContent = text; if (cls) n.className = cls; return n; };

  function renderCatalogChecks(name, parent, selected = []) {
    const box = el("div", null, "preference-group");
    catalogs[name].forEach(item => {
      const label = el("label"), input = document.createElement("input");
      input.type = "checkbox"; input.value = item.id; input.checked = selected.some(value => Number(value.id ?? value) === Number(item.id));
      input.dataset[name === "lenguajes" ? "editLanguage" : "editTool"] = "";
      label.append(input, document.createTextNode(` ${item.nombre}`)); box.append(label);
    });
    const legend = parent.querySelector(":scope > legend");
    parent.replaceChildren(...(legend ? [legend, box] : [box]));
  }

  async function loadCatalogs() {
    const response = await fetch("/api/catalogos/conocimientos"), result = await response.json();
    if (!response.ok || !result.ok) throw new Error("No se pudieron cargar los catálogos.");
    catalogs.lenguajes = result.datos.lenguajes; catalogs.herramientas = result.datos.herramientas;
    for (const name of Object.keys(catalogs)) {
      const box = document.querySelector(`#solicitud-${name}-checks`);
      renderCatalogChecks(name, box);
      // Creation checkboxes use the same catalog and request payload as the editor.
      box.querySelectorAll("input").forEach(input => { input.dataset.knowledge = name; delete input.dataset.editLanguage; delete input.dataset.editTool; });
    }
  }

  function checked(container, attr, values = []) {
    return [...container.querySelectorAll(`[${attr}]:checked`)].map(input => values === true ? input.value : Number(input.value));
  }

  async function saveStatus(select, url, kind) {
    const oldValue = select.dataset.confirmedState || select.value;
    select.disabled = true;
    try {
      const response = await api.authorizedFetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: select.value }) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.mensaje || "No se guardó el cambio.");
      select.value = result.datos?.estado || select.value;
      select.dataset.confirmedState = select.value;
      const message = kind === "offer" ? listStatus : select.parentElement.querySelector("[data-state-message]");
      message.textContent = "Estado actualizado correctamente.";
      if (kind === "offer") { await loadOffers(); listStatus.textContent = "Estado actualizado correctamente."; }
    } catch (error) { select.value = oldValue; const message = kind === "offer" ? listStatus : select.parentElement.querySelector("[data-state-message]"); message.textContent = error.message || "No fue posible conectar con el servidor."; }
    finally { select.disabled = false; }
  }

  function makeEditor(offer) {
    const details = document.createElement("details"), summary = el("summary", "Editar oferta", "button button-outline button-small"); details.className = "offer-editor"; details.append(summary);
    const editor = document.createElement("form"), grid = el("div", null, "field-grid");
    const titleWrap = el("div", null, "field"), title = document.createElement("input"); title.maxLength = 120; title.required = true; title.value = offer.titulo; title.setAttribute("aria-label", "Título de la oferta"); titleWrap.append(el("label", "Título"), title);
    const typeWrap = el("div", null, "field"), type = document.createElement("select"); ["permanente", "temporal", "pasantia"].forEach(value => { const option = el("option", labels[value]); option.value = value; option.selected = value === offer.tipo_contratacion; type.append(option); }); typeWrap.append(el("label", "Tipo de contratación"), type);
    const descWrap = el("div", null, "field field-full"), desc = document.createElement("textarea"); desc.maxLength = 500; desc.required = true; desc.value = offer.descripcion; desc.setAttribute("aria-label", "Descripción de la oferta"); descWrap.append(el("label", "Descripción"), desc);
    grid.append(titleWrap, typeWrap, descWrap); editor.append(grid);
    const group = (heading, attr, options, selected) => {
      const fs = document.createElement("fieldset"); fs.className = "preference-group"; fs.append(el("legend", heading));
      options.forEach(value => { const label = el("label"), input = document.createElement("input"); input.type = "checkbox"; input.value = value; input.checked = selected.includes(value); input.dataset[attr] = ""; label.append(input, document.createTextNode(` ${labels[value] || value}`)); fs.append(label); });
      return fs;
    };
    editor.append(group("Jornadas aceptadas", "editJornada", ["tiempo_completo", "tiempo_parcial"], offer.jornadas), group("Modalidades aceptadas", "editModalidad", ["presencial", "remoto", "hibrido"], offer.modalidades));
    const languages = el("fieldset"), tools = el("fieldset"); languages.className = tools.className = "preference-group"; languages.append(el("legend", "Lenguajes requeridos")); tools.append(el("legend", "Herramientas requeridas"));
    renderCatalogChecks("lenguajes", languages, offer.lenguajes); renderCatalogChecks("herramientas", tools, offer.herramientas); editor.append(languages, tools);
    const feedback = el("p", "", "form-message"); feedback.setAttribute("role", "status");
    const save = el("button", "Guardar cambios", "button"); save.type = "submit"; editor.append(save, feedback); details.append(editor);
    editor.addEventListener("submit", async event => {
      event.preventDefault(); if (!editor.reportValidity()) return;
      const payload = { titulo: title.value.trim(), descripcion: desc.value.trim(), tipo_contratacion: type.value,
        jornadas: checked(editor, "data-edit-jornada", true), modalidades: checked(editor, "data-edit-modalidad", true),
        lenguajes: checked(editor, "data-edit-language").map(id => ({ id })), herramientas: checked(editor, "data-edit-tool").map(id => ({ id })) };
      save.disabled = true; feedback.textContent = "Guardando cambios…";
      try {
        const response = await api.authorizedFetch(`/api/solicitudes/${offer.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.mensaje || "No se pudo actualizar la oferta.");
        feedback.textContent = "Oferta actualizada correctamente."; await loadOffers(); listStatus.textContent = "Oferta actualizada correctamente.";
      } catch (error) { feedback.textContent = error.message || "No fue posible conectar con el servidor."; }
      finally { save.disabled = false; }
    });
    return details;
  }

  async function loadOffers() {
    const response = await api.authorizedFetch("/api/solicitudes");
    if (!response.ok) { listStatus.textContent = "No se pudieron cargar las ofertas."; return; }
    const result = await response.json();
    list.replaceChildren(...result.datos.map(offer => {
      const card = el("article", null, "request-card"), copy = el("div", null, "request-card-copy");
      copy.append(el("h3", offer.titulo), el("p", offer.descripcion), el("p", `Estado: ${labels[offer.estado_publicacion] || "Borrador"} · ${labels[offer.tipo_contratacion] || ""}`));
      copy.append(el("p", `Jornadas: ${offer.jornadas.map(x => labels[x] || x).join(", ")} · Modalidades: ${offer.modalidades.map(x => labels[x] || x).join(", ")}`));
      copy.append(el("p", `Lenguajes: ${offer.lenguajes.map(x => x.nombre).join(", ") || "—"} · Herramientas: ${offer.herramientas.map(x => x.nombre).join(", ") || "—"}`));
      const state = document.createElement("select"); ["borrador", "publicada", "cerrada"].forEach(value => { const option = el("option", labels[value]); option.value = value; option.selected = value === offer.estado_publicacion; state.append(option); });
      state.dataset.confirmedState = offer.estado_publicacion;
      state.addEventListener("change", () => saveStatus(state, `/api/solicitudes/${offer.id}/estado`, "offer"));
      const candidates = el("button", "Ver candidaturas", "button button-outline button-small"); candidates.type = "button"; candidates.addEventListener("click", () => loadCandidates(offer.id, card));
      card.append(copy, makeEditor(offer), state, candidates); return card;
    }));
    listStatus.textContent = `${result.datos.length} oferta(s).`;
  }

  async function loadCandidates(offerId, card) {
    card.querySelector(".matches-list")?.remove();
    const box = el("div", null, "matches-list"); box.setAttribute("aria-live", "polite"); box.append(el("p", "Cargando candidaturas…")); card.append(box);
    try {
      const response = await api.authorizedFetch(`/api/solicitudes/${offerId}/candidaturas`), result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.mensaje || "No se pudieron cargar las candidaturas.");
      if (!result.datos.length) box.replaceChildren(el("p", "Aún no hay candidaturas."));
      else box.replaceChildren(...result.datos.map(candidate => {
        const row = el("div", null, "request-card-copy"), fullName = `${candidate.nombre} ${candidate.apellido}`.trim();
        row.append(el("strong", fullName), el("p", `${candidate.correo || "Sin correo"} · ${new Date(candidate.postulada_en).toLocaleString()}`));
        const profile = el("a", "Consultar perfil", "button button-outline button-small"); profile.href = `detalle.html?id=${encodeURIComponent(candidate.postulante_id)}`; row.append(profile);
        const select = document.createElement("select"); ["pendiente", "en_revision", "aceptada", "rechazada"].forEach(value => { const option = el("option", labels[value]); option.value = value; option.selected = value === candidate.estado; select.append(option); });
        select.dataset.confirmedState = candidate.estado;
        const message = el("span", "", "form-message"); message.dataset.stateMessage = ""; message.setAttribute("role", "status"); row.append(el("label", "Estado de candidatura"), select, message);
        select.addEventListener("change", () => saveStatus(select, `/api/solicitudes/candidaturas/${candidate.id}/estado`, "candidate"));
        return row;
      }));
    } catch (error) { box.replaceChildren(el("p", error.message || "No fue posible conectar con el servidor.", "form-message error")); }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const payload = { titulo: document.querySelector("#solicitud-titulo").value.trim(), descripcion: document.querySelector("#solicitud-descripcion").value.trim(),
      tipo_contratacion: document.querySelector("#solicitud-tipo-contratacion").value,
      jornadas: checked(form, "data-request-jornada", true), modalidades: checked(form, "data-request-modalidad", true),
      lenguajes: [], herramientas: [],
      estado_publicacion: document.querySelector("#estado-publicacion").value };
    payload.lenguajes = [...form.querySelectorAll('[data-knowledge="lenguajes"]:checked')].map(input => ({ id: Number(input.value) }));
    payload.herramientas = [...form.querySelectorAll('[data-knowledge="herramientas"]:checked')].map(input => ({ id: Number(input.value) }));
    status.textContent = "Guardando oferta…";
    try {
      const response = await api.authorizedFetch("/api/solicitudes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.mensaje || "No se pudo guardar la oferta.");
      form.reset(); status.textContent = "Oferta creada correctamente."; await loadOffers();
    } catch (error) { status.textContent = error.message || "No fue posible conectar con el servidor."; }
  });
  loadCatalogs().then(loadOffers).catch(error => { status.textContent = error.message; });
})();
