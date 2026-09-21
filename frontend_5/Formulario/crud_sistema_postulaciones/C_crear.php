<?php

require_once "funciones.php";

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
    $campos = ["nombre", "apellido"];
    $vals = [$nombre, $apellido];

    foreach (["ci", "telefono", "correo", "ciudad"] as $c) {
        if (tieneColumna("postulante", $c)) {
            $campos[] = $c;
            $vals[] = valorPost($c);
        }
    }

    $sql = "INSERT INTO postulante (`" . implode("`,`", $campos) . "`)
            VALUES (" . implode(",", array_fill(0, count($vals), "?")) . ")";

    $st = $conexion->prepare($sql);
    $types = str_repeat("s", count($vals));
    $st->bind_param($types, ...$vals);
    $st->execute();

    $id = $conexion->insert_id;

    $car = listaPost("carrera");
    $ins = listaPost("institucion");

    $st = $conexion->prepare(
        "INSERT INTO formacion(postulante_id,nivel,carrera,institucion)
         VALUES(?,?,?,?)"
    );

    for ($i = 0; $i < count($niveles); $i++) {
        $nivel = trim($niveles[$i] ?? "");
        $carrera = trim($car[$i] ?? "");
        $institucion = trim($ins[$i] ?? "");

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

    respuesta(
        true,
        "Postulante registrado correctamente.",
        ["id" => $id]
    );
} catch (Throwable $e) {
    $conexion->rollback();

    respuesta(
        false,
        "Error al registrar: " . $e->getMessage()
    );
}
?>
