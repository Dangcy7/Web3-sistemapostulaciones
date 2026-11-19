(() => {
  const api = window.CodeWorkSession, id = new URLSearchParams(location.search).get("id");
  if (!api || !api.requireRole("admin") || !id) return;
  const el = (tag, text) => { const n = document.createElement(tag); n.textContent = text || "—"; return n; };
  api.authorizedFetch(`/api/postulantes/${encodeURIComponent(id)}`).then(async response => {
    const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.mensaje || "No se pudo consultar el perfil.");
    const p = result.datos; document.querySelector(".detail-hero h2").textContent = `${p.nombre} ${p.apellido}`;
    document.querySelector(".detail-hero .detail-id").textContent = `ID · ${p.id}`;
    const sections = [
      ["Datos personales", [p.correo, p.telefono, p.ciudad]],
      ["Formación académica", (p.formacion || []).map(x => [x.nivel, x.carrera, x.institucion].filter(Boolean).join(" · "))],
      ["Experiencia", (p.experiencias || []).map(x => [x.puesto, x.lugar, x.tipo, x.años_experiencia].filter(Boolean).join(" · "))],
      ["Lenguajes y herramientas", [...(p.lenguajes || []), ...(p.herramientas || [])].map(x => x.nombre)],
      ["Proyectos", (p.proyectos || []).map(x => [x.nombre, x.descripcion, x.enlace].filter(Boolean).join(" · "))]
    ];
    document.querySelector(".detail-grid").replaceChildren(...sections.map(([title, values]) => {
      const article = document.createElement("article"); article.className = "panel-card"; article.append(el("h2", title));
      const list = document.createElement("ul"); (values.length ? values : ["Sin información registrada."]).forEach(x => list.append(el("li", x))); article.append(list); return article;
    }));
  }).catch(error => { document.querySelector(".detail-hero h2").textContent = error.message; });
})();
