<?php
require_once "../Formulario/crud_sistema_postulaciones/conexion.php";
header("Content-Type: application/json; charset=utf-8");

function salida($ok, $mensaje="", $datos=null) {
    echo json_encode(["ok"=>$ok,"mensaje"=>$mensaje,"datos"=>$datos], JSON_UNESCAPED_UNICODE);
    exit;
}

$r=$conexion->query("SELECT id, nombre, apellido FROM postulante ORDER BY apellido, nombre");
$datos=[];
while ($r && ($fila=$r->fetch_assoc())) $datos[]=$fila;

salida(true, "", $datos);
?>