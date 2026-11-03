(() => {
  const STORAGE_KEY = "codework.session";
  const validRoles = new Set(["admin", "postulante"]);

  function normalizeSession(value) {
    if (!value || typeof value !== "object") return null;
    if (typeof value.token !== "string" || !value.token.trim()) return null;
    if (typeof value.usuario !== "string" || !value.usuario.trim()) return null;
    if (!validRoles.has(value.rol)) return null;

    if (value.rol === "admin") {
      return { token: value.token, usuario: value.usuario, rol: value.rol, postulante_id: null };
    }

    const postulanteId = Number(value.postulante_id);
    if (!Number.isSafeInteger(postulanteId) || postulanteId <= 0) return null;
    return { token: value.token, usuario: value.usuario, rol: value.rol, postulante_id: postulanteId };
  }

  function getSession() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const session = normalizeSession(JSON.parse(raw));
      if (!session) sessionStorage.removeItem(STORAGE_KEY);
      return session;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  function saveSession(value) {
    const session = normalizeSession(value);
    if (!session) return false;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  }

  function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function destinationFor(session) {
    return session.rol === "admin" ? "/pages/postulantes.html" : "/pages/perfil.html";
  }

  function requireRole(role) {
    // This only guides navigation. Protected operations must still be authorized by the API.
    const session = getSession();
    if (!session) {
      window.location.replace("/pages/login.html");
      return null;
    }
    if (session.rol !== role) {
      window.location.replace(destinationFor(session));
      return null;
    }
    return session;
  }

  function authorizedFetch(url, options = {}) {
    const requestUrl = new URL(url, window.location.origin);
    if (requestUrl.origin !== window.location.origin || !requestUrl.pathname.startsWith("/api/")) {
      return Promise.reject(new TypeError("Las solicitudes autenticadas deben dirigirse a la API local."));
    }

    const headers = new Headers(options.headers || {});
    const session = getSession();
    if (session) headers.set("Authorization", `Bearer ${session.token}`);
    return fetch(requestUrl.pathname + requestUrl.search, { ...options, headers });
  }

  function updateSessionNavigation() {
    const loginLink = document.querySelector("[data-nav-login]");
    const registerLink = document.querySelector("[data-nav-register]");
    const dashboardLink = document.querySelector("[data-nav-dashboard]");
    const logoutButton = document.querySelector("[data-nav-logout]");
    const session = getSession();

    if (loginLink) loginLink.hidden = Boolean(session);
    if (registerLink) registerLink.hidden = Boolean(session);
    if (dashboardLink) {
      dashboardLink.hidden = !session;
      if (session) {
        dashboardLink.href = destinationFor(session);
        dashboardLink.innerHTML = `${session.rol === "admin" ? "Panel administrativo" : "Mi perfil"} <span aria-hidden="true">→</span>`;
      }
    }
    if (logoutButton) logoutButton.hidden = !session;

    document.querySelectorAll("[data-session-destination]").forEach(link => {
      if (!session) return;
      link.href = destinationFor(session);
      link.innerHTML = `${session.rol === "admin" ? "Ir al panel" : "Ir a mi perfil"} <span aria-hidden="true">→</span>`;
    });
  }

  document.addEventListener("click", event => {
    const logoutButton = event.target.closest("[data-logout]");
    if (!logoutButton) return;
    clearSession();
    window.location.replace("/index.html");
  });

  window.CodeWorkSession = {
    get: getSession,
    save: saveSession,
    clear: clearSession,
    destinationFor,
    requireRole,
    authorizedFetch
  };

  updateSessionNavigation();
  const requiredRole = document.body.dataset.requiredRole;
  if (requiredRole) requireRole(requiredRole);
})();
