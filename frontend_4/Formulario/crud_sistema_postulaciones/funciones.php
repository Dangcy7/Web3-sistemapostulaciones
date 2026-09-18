<?php
require_once "conexion.php";
header("Content-Type: application/json; charset=utf-8");
function respuesta($ok,$mensaje="",$datos=null){ echo json_encode(["ok"=>$ok,"mensaje"=>$mensaje,"datos"=>$datos],JSON_UNESCAPED_UNICODE); exit; }
function tieneColumna($tabla,$col){ global $conexion; $tabla=$conexion->real_escape_string($tabla); $col=$conexion->real_escape_string($col); $r=$conexion->query("SHOW COLUMNS FROM `$tabla` LIKE '$col'"); return $r && $r->num_rows>0; }
function valorPost($nombre,$def=""){ return trim($_POST[$nombre]??$def); }
function listaPost($nombre){ return is_array($_POST[$nombre]??null) ? $_POST[$nombre] : []; }
function idValido($v){ return ctype_digit((string)$v) && (int)$v>0; }
?>