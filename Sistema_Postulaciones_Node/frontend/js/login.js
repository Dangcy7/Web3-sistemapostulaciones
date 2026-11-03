(() => {
  const form = document.querySelector("#login-form");
  if (!form || !window.CodeWorkSession) return;

  const username = document.querySelector("#usuario");
  const password = document.querySelector("#contrasena");
  const submitButton = document.querySelector("#login-submit");
  const message = document.querySelector("#login-message");

  function showMessage(text, kind = "error") {
    message.textContent = text;
    message.className = text ? `form-message ${kind}` : "form-message";
  }

  function destinationForExistingSession() {
    const session = window.CodeWorkSession.get();
    if (session) window.location.replace(window.CodeWorkSession.destinationFor(session));
  }

  function messageForResponse(status, body) {
    if (status === 400) return "Completa el usuario y la contraseña.";
    if (status === 401) return "Usuario o contraseña incorrectos.";
    if (status >= 500) return "El servidor no pudo completar el inicio de sesión. Inténtalo más tarde.";
    return body?.mensaje || "No se pudo iniciar sesión. Revisa los datos e inténtalo de nuevo.";
  }

  function setLoading(isLoading) {
    form.setAttribute("aria-busy", String(isLoading));
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading
      ? 'Validando…'
      : 'Iniciar sesión <span aria-hidden="true">→</span>';
  }

  form.addEventListener("input", event => {
    const field = event.target;
    if (!field.matches("input")) return;
    field.removeAttribute("aria-invalid");
    if (message.classList.contains("error")) showMessage("");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    showMessage("");
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          usuario: username.value.trim(),
          contraseña: password.value
        }),
        signal: controller.signal
      });

      let body = {};
      try {
        body = await response.json();
      } catch {
        body = {};
      }

      if (!response.ok) {
        showMessage(messageForResponse(response.status, body));
        return;
      }

      const session = {
        token: body.token,
        usuario: body.usuario || username.value.trim(),
        rol: body.rol,
        postulante_id: body.postulante_id
      };

      if (!window.CodeWorkSession.save(session)) {
        showMessage("El servidor no devolvió los datos de sesión esperados. Contacta al administrador.");
        return;
      }

      window.location.replace(window.CodeWorkSession.destinationFor(window.CodeWorkSession.get()));
    } catch (error) {
      if (error.name === "AbortError") {
        showMessage("El servidor tardó demasiado en responder. Inténtalo de nuevo.");
      } else {
        showMessage("No se pudo conectar con el servidor. Comprueba que esté iniciado e inténtalo de nuevo.");
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  });

  destinationForExistingSession();
})();
