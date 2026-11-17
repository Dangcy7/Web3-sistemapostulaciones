function filtrarYOrdenarPostulantes(perfiles, filtros) {
    const idsLenguajes = new Set(filtros.lenguajes);
    const idsHerramientas = new Set(filtros.herramientas);
    const hayFiltroTecnico = idsLenguajes.size + idsHerramientas.size > 0;

    return perfiles
        .map(perfil => {
            const lenguajesCoincidentes = (perfil.lenguajes || []).filter(item => idsLenguajes.has(Number(item.id))).length;
            const herramientasCoincidentes = (perfil.herramientas || []).filter(item => idsHerramientas.has(Number(item.id))).length;
            return { ...perfil, conocimientosCoincidentes: lenguajesCoincidentes + herramientasCoincidentes };
        })
        .filter(perfil => !hayFiltroTecnico || perfil.conocimientosCoincidentes > 0)
        .filter(perfil => !filtros.soloDisponibles || perfil.disponibilidad === "disponible")
        .filter(perfil => !filtros.jornadas.length || filtros.jornadas.some(item => (perfil.jornadas || []).includes(item)))
        .filter(perfil => !filtros.modalidades.length || filtros.modalidades.some(item => (perfil.modalidades || []).includes(item)))
        .sort((a, b) => b.conocimientosCoincidentes - a.conocimientosCoincidentes ||
            `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es"))
        .map(({ conocimientosCoincidentes, ...perfil }) => perfil);
}

module.exports = { filtrarYOrdenarPostulantes };
