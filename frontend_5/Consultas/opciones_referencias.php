<?php
require_once "../Formulario/crud_sistema_postulaciones/conexion.php";
header("Content-Type: application/json; charset=utf-8");

function salida($ok, $mensaje="", $datos=null) {
    echo json_encode(["ok"=>$ok,"mensaje"=>$mensaje,"datos"=>$datos], JSON_UNESCAPED_UNICODE);
    exit;
}

$niveles = [];
$r = $conexion->query("SELECT DISTINCT nivel FROM formacion WHERE nivel IS NOT NULL AND TRIM(nivel) <> '' ORDER BY nivel");
while ($r && ($row=$r->fetch_assoc())) $niveles[]=$row["nivel"];

$lenguajes = [];
$r = $conexion->query("SELECT DISTINCT nombre FROM lenguaje WHERE TRIM(nombre) <> '' ORDER BY nombre");
while ($r && ($row=$r->fetch_assoc())) $lenguajes[]=$row["nombre"];

$herramientas = [];
$r = $conexion->query("SELECT DISTINCT nombre FROM herramienta WHERE TRIM(nombre) <> '' ORDER BY nombre");
while ($r && ($row=$r->fetch_assoc())) $herramientas[]=$row["nombre"];

$experiencias = [];
$r = $conexion->query("SELECT DISTINCT años_experiencia AS anios FROM experiencia_laboral WHERE años_experiencia IS NOT NULL AND años_experiencia >= 0 ORDER BY años_experiencia");
while ($r && ($row=$r->fetch_assoc())) $experiencias[]=(int)$row["anios"];

salida(true, "", [
    "niveles"=>$niveles,
    "lenguajes"=>$lenguajes,
    "herramientas"=>$herramientas,
    "experiencias"=>$experiencias
]);
?>