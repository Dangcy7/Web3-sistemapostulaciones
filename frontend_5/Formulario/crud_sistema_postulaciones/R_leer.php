<?php

require_once "funciones.php";

$r = $conexion->query(
    "SELECT id,nombre,apellido,ci,ciudad
     FROM postulante
     ORDER BY id ASC"
);

$out = [];

while ($x = $r->fetch_assoc()) {
    $out[] = $x;
}

respuesta(true, "", $out);
?>
