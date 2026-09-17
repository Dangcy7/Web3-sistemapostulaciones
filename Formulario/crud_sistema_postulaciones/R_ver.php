<?php
require_once "funciones.php";
$id = $_GET["id"] ?? "";
if (!idValido($id))
    respuesta(false, "ID inválido.");
$id = (int)$id;
$r = $conexion->query("SELECT * FROM postulante WHERE id=$id");
$p = $r ? $r->fetch_assoc() : null;
if (!$p)
    respuesta(false, "Postulante no encontrado.");
if (!array_key_exists("ci", $p))
    $p["ci"] = "";
function rows($sql)
{
    global $conexion;
    $r = $conexion->query($sql);
    $a = [];
    while ($x = $r->fetch_assoc())
        $a[] = $x;
    return $a;
}
respuesta(
    true,
    "",
    [
        "postulante" => $p,
        "formacion" => rows(
            "SELECT * FROM formacion WHERE postulante_id=$id"
        ),
        "experiencia_laboral" => rows(
            "SELECT * FROM experiencia_laboral WHERE postulante_id=$id"
        ),
        "lenguajes" => rows(
            "SELECT l.id,l.nombre
             FROM lenguaje l
             INNER JOIN postulante_lenguaje pl
             ON l.id=pl.lenguaje_id
             WHERE pl.postulante_id=$id"
        ),
        "herramientas" => rows(
            "SELECT h.id,h.nombre
             FROM herramienta h
             INNER JOIN postulante_herramienta ph
             ON h.id=ph.herramienta_id
             WHERE ph.postulante_id=$id"
        ),
        "proyectos" => rows(
            "SELECT * FROM proyecto WHERE postulante_id=$id"
        )
    ]
);
?>