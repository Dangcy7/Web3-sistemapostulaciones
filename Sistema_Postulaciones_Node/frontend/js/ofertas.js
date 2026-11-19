(() => {
  const api = window.CodeWorkSession, list = document.querySelector("#offers-list"), status = document.querySelector("#offers-status");
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
  const labels = { permanente: "Permanente", temporal: "Temporal", pasantia: "Pasantía", tiempo_completo: "Tiempo completo", tiempo_parcial: "Tiempo parcial", presencial: "Presencial", remoto: "Remoto", hibrido: "Híbrido", pendiente: "Pendiente", en_revision: "En revisión", aceptada: "Aceptada", rechazada: "Rechazada" };
  async function loadApplications() {
    const box = document.querySelector("#my-applications"), target = document.querySelector("#applications-list"); box.hidden = false;
    const response = await api.authorizedFetch("/api/solicitudes/mis-candidaturas"); if (!response.ok) return;
    const result = await response.json(); target.replaceChildren(...result.datos.map(item => el("p", `${item.titulo} · ${labels[item.estado] || item.estado} · ${new Date(item.postulada_en).toLocaleDateString()}`)));
  }
  async function load() {
    try {
      const response = await fetch("/api/solicitudes/publicadas"), result = await response.json();
      if (!response.ok || !result.ok) throw new Error("No se pudieron cargar las ofertas.");
      const session = api.get();
      list.replaceChildren(...result.datos.map(offer => {
        const card = el("article", null, "request-card"), copy = el("div", null, "request-card-copy");
        copy.append(el("h2", offer.titulo), el("p", offer.descripcion), el("p", `Contratación: ${labels[offer.tipo_contratacion] || offer.tipo_contratacion}`), el("p", `Jornadas: ${offer.jornadas.map(x => labels[x] || x).join(", ")} · Modalidades: ${offer.modalidades.map(x => labels[x] || x).join(", ")}`), el("p", `Lenguajes: ${offer.lenguajes.map(x => x.nombre).join(", ") || "—"}`), el("p", `Herramientas: ${offer.herramientas.map(x => x.nombre).join(", ") || "—"}`)); card.append(copy);
        const button = session?.rol === "postulante" ? el("button", "Postularme", "button") : el("a", "Inicia sesión para postularte", "button");
        if (session?.rol === "postulante") { button.type = "button"; button.addEventListener("click", async () => { button.disabled = true; try { const r = await api.authorizedFetch(`/api/solicitudes/${offer.id}/postular`, { method: "POST" }), body = await r.json(); status.textContent = body.mensaje || "No se pudo enviar la candidatura."; if (r.ok) { button.textContent = "Candidatura enviada"; await loadApplications(); } } catch { status.textContent = "No fue posible conectar con el servidor."; } finally { button.disabled = false; } }); }
        else if (!session) button.href = "login.html";
        else if (session.rol === "admin") button.hidden = true;
        card.append(button); return card;
      }));
      status.textContent = result.datos.length ? `${result.datos.length} oferta(s) disponible(s).` : "No hay ofertas publicadas en este momento.";
      if (session?.rol === "postulante") await loadApplications();
    } catch (error) { status.textContent = error.message; }
  }
  load();
})();
