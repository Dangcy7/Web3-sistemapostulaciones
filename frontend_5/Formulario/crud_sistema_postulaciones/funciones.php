<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=utf-8");

function respuesta($ok, $mensaje = "", $datos = null)
{
    echo json_encode(
        [
            "ok" => $ok,
            "mensaje" => $mensaje,
            "datos" => $datos
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function tieneColumna($tabla, $col)
{
    global $conexion;

    $tabla = $conexion->real_escape_string($tabla);
    $col = $conexion->real_escape_string($col);

    $r = $conexion->query(
        "SHOW COLUMNS FROM `$tabla` LIKE '$col'"
    );

    return $r && $r->num_rows > 0;
}

function valorPost($nombre, $def = "")
{
    return trim($_POST[$nombre] ?? $def);
}

function listaPost($nombre)
{
    return is_array($_POST[$nombre] ?? null)
        ? $_POST[$nombre]
        : [];
}

function idValido($v)
{
    return ctype_digit((string)$v) && (int)$v > 0;
}

function lenguajesPermitidos()
{
    return [
        "C#",
        "C++",
        "Dart",
        "Go",
        "Java",
        "JavaScript",
        "Kotlin",
        "PHP",
        "Python",
        "R",
        "Ruby",
        "Rust",
        "SQL",
        "Swift",
        "TypeScript"
    ];
}

function nivelesPermitidos()
{
    return [
        "Técnico Medio",
        "Técnico Superior",
        "Universitario",
        "Licenciatura",
        "Postgrado",
        "Especialidad Profesional",
        "Maestría",
        "Doctorado",
        "Postdoctorado",
        "Formación Autodidacta"
    ];
}

function herramientasPermitidas()
{
    return [
        "Git / GitHub / GitLab",
        "Visual Studio Code",
        "Visual Studio / .NET",
        "IntelliJ IDEA / JetBrains",
        "Android Studio",
        "MySQL / MySQL Workbench",
        "PostgreSQL",
        "Microsoft SQL Server / SQL Server Management Studio",
        "Oracle Database / Oracle SQL Developer",
        "Docker",
        "Kubernetes",
        "Postman",
        "Linux",
        "AWS",
        "Microsoft Azure",
        "Jira / Confluence",
        "Jenkins",
        "Figma",
        "Node.js / npm",
        "Google Cloud / Firebase"
    ];
}



function localidadesPermitidas()
{
    return [
        "La Paz",
        "Cochabamba",
        "Santa Cruz",
        "Oruro",
        "Potosí",
        "Chuquisaca",
        "Tarija",
        "Beni",
        "Pando",
        "Internacional"
    ];
}

function validarListaPermitida($valores, $permitidos, $nombre)
{
    foreach ($valores as $valor) {
        $valor = trim($valor);

        if ($valor === "") {
            continue;
        }

        if (!in_array($valor, $permitidos, true)) {
            respuesta(false, "$nombre no permitido: $valor");
        }
    }
}
?>
