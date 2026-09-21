<?php
require_once "../Formulario/crud_sistema_postulaciones/conexion.php";
header("Content-Type: application/json; charset=utf-8");

function salida($ok, $mensaje="", $datos=null) {
    echo json_encode(["ok"=>$ok,"mensaje"=>$mensaje,"datos"=>$datos], JSON_UNESCAPED_UNICODE);
    exit;
}

$nivel = trim($_GET["nivel"] ?? "");
$experiencia = trim($_GET["experiencia"] ?? "");
$lenguaje = trim($_GET["lenguaje"] ?? "");
$herramienta = trim($_GET["herramienta"] ?? "");

if ($experiencia !== "" && (!ctype_digit($experiencia) || (int)$experiencia < 0)) {
    salida(false, "Años de experiencia inválidos.");
}

$sql = "SELECT DISTINCT p.id, p.nombre, p.apellido, p.ci, p.telefono, p.correo, p.ciudad
        FROM postulante p
        WHERE 1=1";
$params = [];
$types = "";

if ($nivel !== "") {
    $sql .= " AND EXISTS (
        SELECT 1 FROM formacion f
        WHERE f.postulante_id=p.id AND f.nivel=?
    )";
    $params[]=$nivel; $types.="s";
}

if ($experiencia !== "") {
    $sql .= " AND EXISTS (
        SELECT 1 FROM experiencia_laboral e
        WHERE e.postulante_id=p.id
          AND e.años_experiencia >= ?
    )";
    $params[]=(int)$experiencia; $types.="i";
}

if ($lenguaje !== "") {
    $sql .= " AND EXISTS (
        SELECT 1
        FROM postulante_lenguaje pl
        INNER JOIN lenguaje l ON l.id=pl.lenguaje_id
        WHERE pl.postulante_id=p.id AND l.nombre=?
    )";
    $params[]=$lenguaje; $types.="s";
}

if ($herramienta !== "") {
    $sql .= " AND EXISTS (
        SELECT 1
        FROM postulante_herramienta ph
        INNER JOIN herramienta h ON h.id=ph.herramienta_id
        WHERE ph.postulante_id=p.id AND h.nombre=?
    )";
    $params[]=$herramienta; $types.="s";
}

$sql .= " ORDER BY p.apellido, p.nombre";

$stmt = $conexion->prepare($sql);
if (!$stmt) salida(false, "No se pudo preparar la búsqueda.");

if ($types !== "") $stmt->bind_param($types, ...$params);
if (!$stmt->execute()) salida(false, "No se pudo ejecutar la búsqueda.");

$result = $stmt->get_result();
$datos=[];
while ($fila=$result->fetch_assoc()) $datos[]=$fila;

salida(true, "", $datos);
?>