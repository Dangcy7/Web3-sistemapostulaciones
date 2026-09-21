<?php

require_once "funciones.php";

$id = $_POST["id"] ?? "";

if (!idValido($id)) {
    respuesta(false, "ID inválido.");
}

$id = (int)$id;
$nombre = valorPost("nombre");
$apellido = valorPost("apellido");

if ($nombre === "" || $apellido === "") {
    respuesta(false, "Nombre y apellido son obligatorios.");
}

$ciudad = valorPost("ciudad");

if ($ciudad !== "" && !in_array($ciudad, localidadesPermitidas(), true)) {
    respuesta(false, "Localidad no permitida.");
}

$niveles = listaPost("nivel");
$lenguajes = listaPost("lenguajes");
$herramientas = listaPost("herramientas");

validarListaPermitida($niveles, nivelesPermitidos(), "Nivel académico");
validarListaPermitida($lenguajes, lenguajesPermitidos(), "Lenguaje");
validarListaPermitida($herramientas, herramientasPermitidas(), "Herramienta");

$conexion->begin_transaction();

try {
    $sets = ["nombre=?", "apellido=?"];
    $vals = [$nombre, $apellido];

    foreach (["ci", "telefono", "correo", "ciudad"] as $c) {
        if (tieneColumna("postulante", $c)) {
            $sets[] = "`$c`=?";
            $vals[] = valorPost($c);
        }
    }

    $vals[] = $id;

    $st = $conexion->prepare(
        "UPDATE postulante SET " . implode(",", $sets) . " WHERE id=?"
    );

    $types = str_repeat("s", count($vals) - 1) . "i";
    $st->bind_param($types, ...$vals);
    $st->execute();

    foreach ([
        "formacion",
        "experiencia_laboral",
        "proyecto",
        "postulante_lenguaje",
        "postulante_herramienta"
    ] as $tabla) {
        $st = $conexion->prepare(
            "DELETE FROM `$tabla` WHERE postulante_id=?"
        );

        $st->bind_param("i", $id);
        $st->execute();
    }

    $carreras = listaPost("carrera");
    $instituciones = listaPost("institucion");

    $st = $conexion->prepare(
        "INSERT INTO formacion(
            postulante_id,
            nivel,
            carrera,
            institucion
        ) VALUES(?,?,?,?)"
    );

    for ($i = 0; $i < count($niveles); $i++) {
        $nivel = trim($niveles[$i] ?? "");
        $carrera = trim($carreras[$i] ?? "");
        $institucion = trim($instituciones[$i] ?? "");

        if ($nivel !== "" || $carrera !== "" || $institucion !== "") {
            $st->bind_param(
                "isss",
                $id,
                $nivel,
                $carrera,
                $institucion
            );

            $st->execute();
        }
    }

    $lugares = listaPost("lugar");
    $tipos = listaPost("tipo");
    $puestos = listaPost("puesto");
    $anos = listaPost("anos_experiencia");

    $st = $conexion->prepare(
        "INSERT INTO experiencia_laboral(
            postulante_id,
            lugar,
            tipo,
            puesto,
            años_experiencia
        ) VALUES(?,?,?,?,?)"
    );

    for ($i = 0; $i < count($lugares); $i++) {
        $lugar = trim($lugares[$i] ?? "");
        $tipo = trim($tipos[$i] ?? "");
        $puesto = trim($puestos[$i] ?? "");
        $ano = ($anos[$i] ?? "") === ""
            ? null
            : (int)$anos[$i];

        if (
            $lugar !== "" ||
            $tipo !== "" ||
            $puesto !== "" ||
            $ano !== null
        ) {
            $st->bind_param(
                "isssi",
                $id,
                $lugar,
                $tipo,
                $puesto,
                $ano
            );

            $st->execute();
        }
    }

    $sl = $conexion->prepare(
        "SELECT id FROM lenguaje WHERE nombre=?"
    );

    $il = $conexion->prepare(
        "INSERT INTO lenguaje(nombre) VALUES(?)"
    );

    $rl = $conexion->prepare(
        "INSERT IGNORE INTO postulante_lenguaje(
            postulante_id,
            lenguaje_id
        ) VALUES(?,?)"
    );

    foreach ($lenguajes as $nombreLenguaje) {
        $nombreLenguaje = trim($nombreLenguaje);

        if ($nombreLenguaje === "") {
            continue;
        }

        $sl->bind_param("s", $nombreLenguaje);
        $sl->execute();
        $sl->store_result();

        if ($sl->num_rows) {
            $sl->bind_result($lenguajeId);
            $sl->fetch();
        } else {
            $il->bind_param("s", $nombreLenguaje);
            $il->execute();
            $lenguajeId = $conexion->insert_id;
        }

        $rl->bind_param("ii", $id, $lenguajeId);
        $rl->execute();
        $sl->free_result();
    }

    $sh = $conexion->prepare(
        "SELECT id FROM herramienta WHERE nombre=?"
    );

    $ih = $conexion->prepare(
        "INSERT INTO herramienta(nombre) VALUES(?)"
    );

    $rh = $conexion->prepare(
        "INSERT IGNORE INTO postulante_herramienta(
            postulante_id,
            herramienta_id
        ) VALUES(?,?)"
    );

    foreach ($herramientas as $nombreHerramienta) {
        $nombreHerramienta = trim($nombreHerramienta);

        if ($nombreHerramienta === "") {
            continue;
        }

        $sh->bind_param("s", $nombreHerramienta);
        $sh->execute();
        $sh->store_result();

        if ($sh->num_rows) {
            $sh->bind_result($herramientaId);
            $sh->fetch();
        } else {
            $ih->bind_param("s", $nombreHerramienta);
            $ih->execute();
            $herramientaId = $conexion->insert_id;
        }

        $rh->bind_param("ii", $id, $herramientaId);
        $rh->execute();
        $sh->free_result();
    }

    $proyectoNombres = listaPost("proyecto_nombre");
    $proyectoDescripciones = listaPost("proyecto_descripcion");
    $proyectoEnlaces = listaPost("proyecto_enlace");

    $st = $conexion->prepare(
        "INSERT INTO proyecto(
            postulante_id,
            nombre,
            descripcion,
            enlace
        ) VALUES(?,?,?,?)"
    );

    for ($i = 0; $i < count($proyectoNombres); $i++) {
        $nombreProyecto = trim($proyectoNombres[$i] ?? "");
        $descripcion = trim($proyectoDescripciones[$i] ?? "");
        $enlace = trim($proyectoEnlaces[$i] ?? "");

        if ($nombreProyecto !== "") {
            $st->bind_param(
                "isss",
                $id,
                $nombreProyecto,
                $descripcion,
                $enlace
            );

            $st->execute();
        }
    }

    $conexion->commit();

    respuesta(true, "Postulante modificado correctamente.");
} catch (Throwable $e) {
    $conexion->rollback();

    respuesta(
        false,
        "Error al modificar: " . $e->getMessage()
    );
}
?>
