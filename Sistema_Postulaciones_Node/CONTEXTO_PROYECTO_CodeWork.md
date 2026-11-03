# CONTEXTO DEL PROYECTO --- CodeWork

> Documento de contexto para trabajar con ChatGPT, Codex y otros
> asistentes de programación. Última actualización: 3 de noviembre de
> 2026.

## 1. Cómo trabajar en este proyecto

Este proyecto es un trabajo universitario de la materia **Programación
Web III (INF-133)**, desarrollado por un estudiante de segundo año de
Ingeniería Informática.

El objetivo es construir una versión funcional, comprensible y
defendible académicamente. No se busca convertirlo en un sistema
empresarial complejo ni agregar funciones que no exige el alcance
actual.

**Reglas de trabajo para cualquier asistente o colaborador:**

1.  Antes de modificar código, revisar la estructura y los archivos
    existentes.
2.  No rehacer ni reemplazar el proyecto completo sin autorización.
3.  Preservar el trabajo y la identidad visual del frontend original del
    equipo.
4.  Hacer cambios pequeños, coherentes y comprobables.
5.  Antes de editar, explicar qué archivos se modificarán y por qué,
    especialmente si el cambio afecta varias partes.
6.  No inventar funcionalidades. Diferenciar claramente entre
    implementado, pendiente y propuesta futura.
7.  No cambiar nombres de tablas, columnas, rutas o funciones sin
    revisar sus dependencias.
8.  No exponer credenciales, tokens JWT, claves ni contenido de `.env`.
    Nunca solicitar que se peguen en el chat.
9.  Probar cada cambio con el método adecuado y explicar cómo
    verificarlo.
10. Mantener el código sencillo y acorde al nivel de un proyecto
    universitario de segundo año.
11. Cuando se entregue código, indicar la ruta exacta y si se debe
    reemplazar una función o un archivo completo.
12. El estudiante quiere comprender la implementación y poder explicarla
    al docente. No limitarse a producir código que funcione sin explicar
    sus decisiones.

## 2. Objetivo de CodeWork

CodeWork representa una consultora que busca, evalúa y selecciona
profesionales de diseño y programación para proyectos de software de sus
clientes.

El sistema debe permitir almacenar y consultar perfiles profesionales
con información como:

-   Datos personales y de contacto.
-   Formación académica.
-   Experiencia laboral.
-   Lenguajes de programación.
-   Herramientas y tecnologías.
-   Proyectos realizados y enlaces de referencia.

La aplicación contempla dos tipos de usuario:

-   **Postulante:** registra una cuenta, administra su propio perfil
    profesional y puede consultar o actualizar únicamente su
    información.
-   **Administrador:** accede a la gestión de postulantes y puede
    consultar los perfiles para apoyar los procesos de búsqueda y
    selección.

La información de los postulantes no debe quedar expuesta para
navegación pública sin autenticación.

## 3. Alcance funcional esperado

### 3.1 Parte pública

-   Página de inicio que presente CodeWork, sus servicios y propósito.
-   Acceso a registro e inicio de sesión.
-   No permitir que visitantes anónimos naveguen libremente por la base
    de postulantes.

### 3.2 Portal del postulante

-   Registro de cuenta y perfil profesional.
-   Inicio de sesión.
-   Consulta del perfil propio.
-   Edición de sus datos personales y profesionales.
-   No puede consultar ni modificar perfiles ajenos.

### 3.3 Panel administrativo

-   Inicio de sesión de administrador.
-   Listado de postulantes.
-   Consulta de perfiles completos.
-   Búsqueda y filtros de candidatos, según los criterios disponibles en
    el proyecto.
-   Acceso administrativo protegido por rol.

### 3.4 Funciones futuras, no asumir como implementadas

Estas ideas se han considerado como posibles extensiones, pero no deben
presentarse como funcionalidades actuales salvo que se desarrollen y
prueben: - Publicación y gestión de vacantes. - Postulaciones a vacantes
concretas. - Notificaciones y recordatorios. - Historial de entrevistas,
evaluaciones y selección. - Archivo automático de perfiles
desactualizados. - Recordatorios para que los postulantes actualicen su
información.

La disponibilidad laboral y modalidad de contratación deben responder a
las necesidades definidas por la consultora o por cada vacante; no
convertirlas sin justificación en estados obligatorios que cada
postulante define libremente.

## 4. Identidad visual

El frontend original del equipo debe servir como punto de partida. No
reemplazarlo por una plantilla genérica.

Paleta identificada en el diseño original: - Oscuro: `#1E1F26` - Verde
azulado: `#045c6b` - Naranja: `#ED5C26` - Verde menta: `#98d8c4` - Fondo
claro: `#E6F3F5` - Texto: `#4D4730`

Tipografías observadas: Google Sans Code y Source Code Pro.

La marca del proyecto es **CodeWork**. Conservar los recursos gráficos,
logotipo e imágenes existentes cuando estén disponibles. Mantener
coherencia entre página pública, registro, inicio de sesión, portal del
postulante y panel administrativo.

## 5. Tecnologías y entorno

### Backend

-   Node.js
-   Express
-   MySQL
-   `mysql2/promise`
-   `bcrypt` para el hash de contraseñas
-   `jsonwebtoken` para autenticación JWT
-   `dotenv` para variables de entorno

### Herramientas de desarrollo

-   Visual Studio Code
-   Postman
-   XAMPP / MySQL
-   Git y GitHub

### Datos de entorno conocidos

-   Repositorio: https://github.com/Dangcy7/Web3-sistemapostulaciones
-   Rama principal conocida: `main`
-   Base de datos local: `sistema_postulaciones`
-   Backend local: `http://localhost:3000`
-   MySQL local de XAMPP; el entorno de desarrollo usado tenía usuario
    `root` y contraseña vacía. Confirmar la configuración local en lugar
    de asumirla.
-   Versión de Node probada: `v24.22.1`.

No incluir contraseñas ni secretos en este documento. El archivo `.env`
debe permanecer fuera del control de versiones.

## 6. Estructura conocida del backend

Raíz del proyecto: `Sistema_Postulaciones_Node/`

Backend: - `backend/src/app.js` - `backend/src/config/database.js` -
`backend/src/routes/postulantes.routes.js` -
`backend/src/routes/auth.routes.js` -
`backend/src/controllers/postulantes.controller.js` -
`backend/src/controllers/auth.controller.js` -
`backend/src/services/postulantes.service.js` -
`backend/src/services/auth.service.js` -
`backend/src/middlewares/auth.middleware.js` - `backend/.env` (secreto
local; no leer ni mostrar su contenido en respuestas)

El servidor se inicia desde la carpeta `backend` con:

``` powershell
node src/app.js
```

En `app.js`, `express.json()` debe ejecutarse antes de montar las rutas
para que `req.body` esté disponible en peticiones JSON.

## 7. Base de datos conocida

Base: `sistema_postulaciones`.

Tablas principales: - `postulante`: `id`, `nombre`, `apellido`,
`telefono`, `correo`, `ciudad`. - `formacion`: `id`, `postulante_id`,
`nivel`, `carrera`, `institucion`. - `experiencia_laboral`: `id`,
`postulante_id`, `lugar`, `tipo`, `puesto`, `años_experiencia`. -
`proyecto`: `id`, `postulante_id`, `nombre`, `descripcion`, `enlace`. -
`lenguaje`: catálogo de lenguajes. - `postulante_lenguaje`: relación
entre postulantes y lenguajes. - `herramienta`: catálogo de
herramientas. - `postulante_herramienta`: relación entre postulantes y
herramientas. - `usuario`: cuenta de acceso con `id`, `usuario`,
`contrasena`, `rol` y `postulante_id`.

La tabla `usuario` usa los roles `postulante` y `admin`. El campo
`postulante_id` permite vincular la cuenta de un postulante con su
perfil; para administradores puede ser `NULL`. La relación se diseñó
como opcional uno a uno.

Catálogos conocidos en los datos de prueba: - Herramientas: Git, GitHub,
Docker, MySQL, React, Node.js y Flask. - Lenguajes: Python, Java,
JavaScript, C++ y PHP.

Verificar siempre el esquema real del SQL del proyecto antes de cambiar
consultas o relaciones.

## 8. Estado de implementación conocido al 3 de noviembre de 2026

### Backend implementado y probado en conversación

-   Conexión a MySQL mediante un pool de `mysql2/promise`.
-   Registro de postulante con perfil profesional completo.
-   Creación de cuenta de usuario vinculada al perfil.
-   Hash de contraseña mediante bcrypt.
-   Inicio de sesión y emisión de JWT.
-   Middleware de verificación de token.
-   Middleware de verificación de rol administrador.
-   Listado de postulantes protegido para administrador.
-   Consulta de perfil con comprobación de propiedad o rol
    administrador.
-   Actualización de perfil con comprobación de propiedad o rol
    administrador.

### Pruebas confirmadas

-   Login de administrador: probado correctamente.
-   Petición de listado sin token: devolvió `401`.
-   Listado con token de administrador: devolvió registros.
-   Registro completo de postulante: devolvió `201` y se confirmó la
    creación de la cuenta en la tabla `usuario`.
-   Login del postulante: probado correctamente.
-   Consulta del perfil propio con token de postulante: devolvió `200`.
-   Consulta de perfil ajeno con token de postulante: devolvió `403`.

### Prueba pendiente

-   Actualización del perfil propio: debe devolver `200`.
-   Intento de actualización de perfil ajeno: debe devolver `403`.
-   Volver a revisar validaciones y manejo de errores después de
    integrar el frontend.

Los resultados anteriores son el estado conocido por las pruebas
conversacionales. Codex debe volver a inspeccionar el código actual y no
asumir que el repositorio remoto contiene exactamente los mismos cambios
que la copia local.

## 9. Frontend: estado y advertencia

La estructura del frontend identificada incluye: -
`frontend/index.html` - `frontend/pages/registro.html` -
`frontend/pages/postulantes.html` - `frontend/pages/detalle.html` -
`frontend/css/styles.css` - `frontend/css/formularios.css` -
`frontend/js/api.js` - `frontend/js/registro.js` -
`frontend/js/postulante.js` - `frontend/js/detalle.js` -
`frontend/assets/`

El frontend debe inspeccionarse directamente en la carpeta local abierta
en VS Code. No asumir que todos los archivos están completos ni que
están vacíos basándose en una copia comprimida anterior.

Pendientes principales: - Completar o verificar la página pública. -
Completar el formulario de registro, incluyendo usuario y contraseña. -
Crear o completar la pantalla de inicio de sesión. - Implementar el
portal de postulante. - Implementar el panel administrativo. - Conectar
las vistas con los endpoints reales. - Manejar token, sesión, errores y
cierre de sesión. - Respetar la identidad visual original.

## 10. Rutas del backend conocidas

Autenticación: - `POST /api/auth/login`

Postulantes: - `GET /api/postulantes/` --- requiere token y rol
administrador. - `POST /api/postulantes/` --- registro simple de datos
personales; revisar si sigue siendo necesario. -
`POST /api/postulantes/completo` --- registro completo con cuenta de
acceso. - `GET /api/postulantes/:id` --- requiere token; el usuario debe
ser administrador o dueño del perfil. - `PUT /api/postulantes/:id` ---
requiere token; el usuario debe ser administrador o dueño del perfil.

Confirmar estas rutas en el código actual antes de usarlas o
modificarlas.

## 11. Próximas etapas recomendadas

1.  Diagnóstico integral del repositorio local: frontend, backend, base
    de datos, recursos e integración. No modificar archivos durante este
    diagnóstico.
2.  Comparar el estado local con el repositorio GitHub y revisar cambios
    sin guardar o archivos ignorados.
3.  Terminar las pruebas pendientes de autorización y actualización.
4.  Completar el frontend conservando el diseño del equipo.
5.  Conectar registro, login, perfil y panel administrativo con la API.
6.  Probar flujos completos con una cuenta de administrador y una cuenta
    de postulante.
7.  Corregir errores, revisar seguridad básica y preparar capturas.
8.  Terminar el informe universitario, describiendo como implementado
    únicamente lo que realmente funcione. Documentar las ideas futuras
    como propuestas.

## 12. Primera instrucción sugerida para Codex

Antes de realizar cualquier cambio, leer este documento y analizar el
proyecto completo.

Entregar un diagnóstico dividido en: 1. Estructura real del proyecto. 2.
Estado del frontend. 3. Estado del backend. 4. Estado de la base de
datos y sus relaciones. 5. Integración entre frontend y backend. 6.
Requisitos implementados, pendientes y parcialmente implementados. 7.
Errores, riesgos y archivos involucrados. 8. Plan de trabajo ordenado
por prioridad.

**No modificar, eliminar, mover ni crear archivos durante el
diagnóstico.** No mostrar secretos ni contenido de `.env`. Distinguir lo
que se comprobó ejecutando o leyendo del código de lo que solo se
infiere.
