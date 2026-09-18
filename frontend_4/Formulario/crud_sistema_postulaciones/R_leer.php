<?php
require_once "funciones.php";
$r = $conexion->query(
    "SELECT id,nombre,apellido
     FROM postulante
     ORDER BY id ASC"
);
$out = [];
while ($x = $r->fetch_assoc()) {

    $x["ci"] = tieneColumna("postulante", "ci")
        ? (string)($conexion->query(
            "SELECT ci
             FROM postulante
             WHERE id=" . (int)$x["id"]
        )->fetch_assoc()["ci"] ?? "")
        : "";

    $out[] = $x;
}
respuesta(true, "", $out);
?>