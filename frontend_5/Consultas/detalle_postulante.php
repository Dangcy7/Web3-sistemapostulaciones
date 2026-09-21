<?php
require_once "../Formulario/crud_sistema_postulaciones/conexion.php";
header("Content-Type: application/json; charset=utf-8");

function salida($ok, $mensaje="", $datos=null) {
    echo json_encode(["ok"=>$ok,"mensaje"=>$mensaje,"datos"=>$datos], JSON_UNESCAPED_UNICODE);
    exit;
}

$id=$_GET["id"] ?? "";
if (!ctype_digit((string)$id) || (int)$id <= 0) salida(false, "Postulante inválido.");
$id=(int)$id;

$stmt=$conexion->prepare("SELECT id,nombre,apellido,ci,telefono,correo,ciudad FROM postulante WHERE id=?");
$stmt->bind_param("i",$id);
$stmt->execute();
$postulante=$stmt->get_result()->fetch_assoc();

if (!$postulante) salida(false, "Postulante no encontrado.");

$stmt=$conexion->prepare("SELECT id,nombre,descripcion,enlace FROM proyecto WHERE postulante_id=? ORDER BY id");
$stmt->bind_param("i",$id);
$stmt->execute();
$proyectos=[];
$r=$stmt->get_result();
while ($fila=$r->fetch_assoc()) $proyectos[]=$fila;

salida(true, "", ["postulante"=>$postulante, "proyectos"=>$proyectos]);
?>