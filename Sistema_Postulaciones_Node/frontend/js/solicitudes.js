(() => {
  const api = window.CodeWorkSession;
  const form = document.querySelector("#solicitud-form");
  if (!api || !form || !api.requireRole("admin")) return;
  const status = document.querySelector("#solicitud-form-status");
  const list = document.querySelector("#solicitudes-list");
  const catalogs = { lenguajes: [], herramientas: [] };
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };

  function showCatalogs(name) {
    const box = document.querySelector(`#solicitud-${name}-checks`);
    box.replaceChildren(...catalogs[name].map(item => {
      const label = el("label");
      const input = document.createElement("input"); input.type = "checkbox"; input.value = item.id; input.dataset.knowledge = name;
      label.append(input, document.createTextNode(` ${item.nombre}`)); return label;
    }));
  }
  async function loadCatalogs() {
    const response = await fetch("/api/catalogos/conocimientos");
    const result = await response.json(); if (!response.ok || !result.ok) throw new Error("No se cargaron los catálogos");
    catalogs.lenguajes = result.datos.lenguajes; catalogs.herramientas = result.datos.herramientas;
    showCatalogs("lenguajes"); showCatalogs("herramientas");
  }
  const labels = { permanente: "Permanente", temporal: "Temporal", pasantia: "Pasantía", borrador: "Borrador", publicada: "Publicada", cerrada: "Cerrada", pendiente: "Pendiente", en_revision: "En revisión", aceptada: "Aceptada", rechazada: "Rechazada" };
  async function loadOffers() {
    const response = await api.authorizedFetch("/api/solicitudes");
    if (!response.ok) { list.textContent = "No se pudieron cargar las ofertas."; return; }
    const result = await response.json();
    list.replaceChildren(...result.datos.map(offer => {
      const card = el("article", null, "request-card");
      const copy = el("div", null, "request-card-copy");
      copy.append(el("h3", offer.titulo), el("p", offer.descripcion), el("p", `Estado: ${labels[offer.estado_publicacion] || "Borrador"} · ${labels[offer.tipo_contratacion] || ""}`));
      copy.append(el("p", `Jornadas: ${offer.jornadas.join(", ")} · Modalidades: ${offer.modalidades.join(", ")}`));
      copy.append(el("p", `Lenguajes: ${offer.lenguajes.map(x => x.nombre).join(", ") || "—"} · Herramientas: ${offer.herramientas.map(x => x.nombre).join(", ") || "—"}`));
      const state = document.createElement("select"); ["borrador", "publicada", "cerrada"].forEach(value => { const option = el("option", labels[value]); option.value = value; option.selected = value === offer.estado_publicacion; state.append(option); });
      state.addEventListener("change", async () => { await api.authorizedFetch(`/api/solicitudes/${offer.id}/estado`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: state.value }) }); await loadOffers(); });
      const edit = el("button", "Editar título y descripción", "button button-outline button-small"); edit.type = "button";
      edit.addEventListener("click", async () => {
        const titulo = window.prompt("Título de la oferta", offer.titulo); if (titulo === null) return;
        const descripcion = window.prompt("Descripción de la oferta", offer.descripcion); if (descripcion === null) return;
        const response = await api.authorizedFetch(`/api/solicitudes/${offer.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo, descripcion }) });
        const result = await response.json(); if (!response.ok) { window.alert(result.mensaje || "No se pudo actualizar la oferta."); return; } await loadOffers();
      });
      const candidates = document.createElement("button"); candidates.type = "button"; candidates.className = "button button-outline button-small"; candidates.textContent = "Ver candidaturas";
      candidates.addEventListener("click", () => loadCandidates(offer.id, card));
      card.append(copy, edit, state, candidates); return card;
    }));
  }
  async function loadCandidates(offerId, card) {
    const response = await api.authorizedFetch(`/api/solicitudes/${offerId}/candidaturas`);
    const result = await response.json(); if (!response.ok) return;
    const box = el("div", null, "matches-list");
    if (!result.datos.length) box.append(el("p", "Aún no hay candidaturas."));
    result.datos.forEach(candidate => {
      const row = el("div", null, "request-card-copy");
      row.append(el("strong", `${candidate.nombre} ${candidate.apellido}`), el("p", `${candidate.correo || "Sin correo"} · ${new Date(candidate.postulada_en).toLocaleString()}`));
      const profile = el("a", "Consultar perfil", "button button-outline button-small"); profile.href = `postulante.html?id=${candidate.postulante_id}`; row.append(profile);
      const select = document.createElement("select"); ["pendiente", "en_revision", "aceptada", "rechazada"].forEach(value => { const option = el("option", labels[value]); option.value = value; option.selected = value === candidate.estado; select.append(option); });
      select.addEventListener("change", () => api.authorizedFetch(`/api/solicitudes/candidaturas/${candidate.id}/estado`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: select.value }) }));
      row.append(select); box.append(row);
    });
    card.append(box);
  }
  form.addEventListener("submit", async event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const payload = {
      titulo: document.querySelector("#solicitud-titulo").value.trim(),
      descripcion: document.querySelector("#solicitud-descripcion").value.trim(),
      tipo_contratacion: document.querySelector("#solicitud-tipo-contratacion").value,
      jornadas: [...form.querySelectorAll("[data-request-jornada]:checked")].map(x => x.value),
      modalidades: [...form.querySelectorAll("[data-request-modalidad]:checked")].map(x => x.value),
      lenguajes: [...form.querySelectorAll('[data-knowledge="lenguajes"]:checked')].map(x => ({ id: Number(x.value) })),
      herramientas: [...form.querySelectorAll('[data-knowledge="herramientas"]:checked')].map(x => ({ id: Number(x.value) })),
      estado_publicacion: document.querySelector("#estado-publicacion").value
    };
    status.textContent = "Guardando oferta…";
    try {
      const response = await api.authorizedFetch("/api/solicitudes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json(); if (!response.ok) throw new Error(result.mensaje || "No se pudo guardar la oferta.");
      form.reset(); status.textContent = "Oferta creada."; await loadOffers();
    } catch (error) { status.textContent = error.message; }
  });
  Promise.all([loadCatalogs(), loadOffers()]).catch(error => { status.textContent = error.message; });
})();
