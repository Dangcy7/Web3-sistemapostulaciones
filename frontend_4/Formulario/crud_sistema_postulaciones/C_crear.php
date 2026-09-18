<?php
require_once "funciones.php";
$nombre = valorPost("nombre");
$apellido = valorPost("apellido");
if ($nombre === "" || $apellido === "")
    respuesta(false, "Nombre y apellido son obligatorios.");
$conexion->begin_transaction();
try {
    $campos = ["nombre", "apellido"];
    $vals = [$nombre, $apellido];
    foreach (["ci", "telefono", "correo", "ciudad"] as $c)
        if (tieneColumna("postulante", $c)) {
            $campos[] = $c;
            $vals[] = valorPost($c);
        }
    $sql = "INSERT INTO postulante (`" . implode("`,`", $campos) . "`)
            VALUES (" . implode(",", array_fill(0, count($vals), "?")) . ")";
    $st = $conexion->prepare($sql);
    $types = str_repeat("s", count($vals));
    $st->bind_param($types, ...$vals);
    $st->execute();
    $id = $conexion->insert_id;
    $niv = listaPost("nivel");
    $car = listaPost("carrera");
    $ins = listaPost("institucion");
    $st = $conexion->prepare(
        "INSERT INTO formacion(postulante_id,nivel,carrera,institucion)
         VALUES(?,?,?,?)"
    );
    for ($i = 0; $i < count($niv); $i++) {
        $a = trim($niv[$i] ?? "");
        $b = trim($car[$i] ?? "");
        $c = trim($ins[$i] ?? "");
        if ($a !== "" || $b !== "" || $c !== "") {
            $st->bind_param("isss", $id, $a, $b, $c);
            $st->execute();
        }
    }
    $lug = listaPost("lugar");
    $tip = listaPost("tipo");
    $pue = listaPost("puesto");
    $ano = listaPost("anos_experiencia");
    $st = $conexion->prepare(
        "INSERT INTO experiencia_laboral(postulante_id,lugar,tipo,puesto,años_experiencia)
         VALUES(?,?,?,?,?)"
    );
    for ($i = 0; $i < count($lug); $i++) {
        $a = trim($lug[$i] ?? "");
        $b = trim($tip[$i] ?? "");
        $c = trim($pue[$i] ?? "");
        $d = ($ano[$i] ?? "") === "" ? null : (int)$ano[$i];
        if ($a !== "" || $b !== "" || $c !== "" || $d !== null) {
            $st->bind_param("isssi", $id, $a, $b, $c, $d);
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
        "INSERT IGNORE INTO postulante_lenguaje(postulante_id,lenguaje_id)
         VALUES(?,?)"
    );
    foreach (listaPost("lenguajes") as $n) {
        $n = trim($n);
        if ($n === "")
            continue;
        $sl->bind_param("s", $n);
        $sl->execute();
        $sl->store_result();
        if ($sl->num_rows) {
            $sl->bind_result($lid);
            $sl->fetch();
        } else {
            $il->bind_param("s", $n);
            $il->execute();
            $lid = $conexion->insert_id;
        }
        $rl->bind_param("ii", $id, $lid);
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
        "INSERT IGNORE INTO postulante_herramienta(postulante_id,herramienta_id)
         VALUES(?,?)"
    );

    foreach (listaPost("herramientas") as $n) {

        $n = trim($n);

        if ($n === "")
            continue;

        $sh->bind_param("s", $n);
        $sh->execute();
        $sh->store_result();

        if ($sh->num_rows) {

            $sh->bind_result($hid);
            $sh->fetch();

        } else {

            $ih->bind_param("s", $n);
            $ih->execute();
            $hid = $conexion->insert_id;
        }

        $rh->bind_param("ii", $id, $hid);
        $rh->execute();

        $sh->free_result();
    }

    $pn = listaPost("proyecto_nombre");
    $pd = listaPost("proyecto_descripcion");
    $pe = listaPost("proyecto_enlace");

    $st = $conexion->prepare(
        "INSERT INTO proyecto(postulante_id,nombre,descripcion,enlace)
         VALUES(?,?,?,?)"
    );

    for ($i = 0; $i < count($pn); $i++) {

        $a = trim($pn[$i] ?? "");
        $b = trim($pd[$i] ?? "");
        $c = trim($pe[$i] ?? "");

        if ($a !== "") {
            $st->bind_param("isss", $id, $a, $b, $c);
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