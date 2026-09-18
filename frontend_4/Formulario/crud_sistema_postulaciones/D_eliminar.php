<?php
require_once "funciones.php";
$id=$_POST["id"]??$_GET["id"]??"";if(!idValido($id))respuesta(false,"ID inválido.");$id=(int)$id;$conexion->begin_transaction();
try{foreach(["postulante_lenguaje","postulante_herramienta","formacion","experiencia_laboral","proyecto"] as $t){$st=$conexion->prepare("DELETE FROM `$t` WHERE postulante_id=?");$st->bind_param("i",$id);$st->execute();}$st=$conexion->prepare("DELETE FROM postulante WHERE id=?");$st->bind_param("i",$id);$st->execute();if($st->affected_rows===0)throw new Exception("Postulante no encontrado.");$conexion->commit();respuesta(true,"Postulante eliminado correctamente.");}catch(Throwable $e){$conexion->rollback();respuesta(false,"No se pudo eliminar: ".$e->getMessage());}
?>