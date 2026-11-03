-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-11-2026 a las 14:31:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_postulaciones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `experiencia_laboral`
--

CREATE TABLE `experiencia_laboral` (
  `id` int(11) NOT NULL,
  `postulante_id` int(11) NOT NULL,
  `lugar` varchar(100) DEFAULT NULL,
  `tipo` varchar(30) DEFAULT NULL,
  `puesto` varchar(100) DEFAULT NULL,
  `años_experiencia` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `experiencia_laboral`
--

INSERT INTO `experiencia_laboral` (`id`, `postulante_id`, `lugar`, `tipo`, `puesto`, `años_experiencia`) VALUES
(1, 1, 'Empresa ABC', 'Empresa', 'Desarrollador Backend', 3),
(2, 1, 'Proyecto Independiente', 'Freelance', 'Desarrollador Web', 2),
(3, 2, 'Diseños Creativos', 'Empresa', 'Diseñadora Gráfica', 4),
(4, 3, 'Software Bolivia', 'Empresa', 'Programador Junior', 2),
(5, 5, 'Empresa de prueba', 'Empresa', 'Desarrolladora Web', 2),
(7, 6, 'Empresa de prueba', 'Empresa', 'Desarrolladora Web', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formacion`
--

CREATE TABLE `formacion` (
  `id` int(11) NOT NULL,
  `postulante_id` int(11) NOT NULL,
  `nivel` varchar(30) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `institucion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `formacion`
--

INSERT INTO `formacion` (`id`, `postulante_id`, `nivel`, `carrera`, `institucion`) VALUES
(1, 1, 'Licenciatura', 'Informática', 'UMSA'),
(2, 2, 'Licenciatura', 'Diseño Gráfico', 'UMSA'),
(3, 3, 'Técnico', 'Programación', 'Instituto Técnico'),
(4, 5, 'Licenciatura', 'Informática', 'UMSA'),
(6, 6, 'Licenciatura', 'Informática', 'UMSA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `herramienta`
--

CREATE TABLE `herramienta` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `herramienta`
--

INSERT INTO `herramienta` (`id`, `nombre`) VALUES
(1, 'Git'),
(2, 'GitHub'),
(3, 'Docker'),
(4, 'MySQL'),
(5, 'React'),
(6, 'Node.js'),
(7, 'Flask');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lenguaje`
--

CREATE TABLE `lenguaje` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lenguaje`
--

INSERT INTO `lenguaje` (`id`, `nombre`) VALUES
(1, 'Python'),
(2, 'Java'),
(3, 'JavaScript'),
(4, 'C++'),
(5, 'PHP');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante`
--

CREATE TABLE `postulante` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `ciudad` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `postulante`
--

INSERT INTO `postulante` (`id`, `nombre`, `apellido`, `telefono`, `correo`, `ciudad`) VALUES
(1, 'Carlos', 'Pérez', '70000001', 'carlos@test.com', 'La Paz'),
(2, 'María', 'López', '70000002', 'maria@test.com', 'Cochabamba'),
(3, 'Luis', 'Gómez', '70000003', 'luis@test.com', 'La Paz'),
(4, 'Ana', 'Prueba', '70000123', 'ana.prueba@example.com', 'La Paz'),
(5, 'Andrea', 'Prueba', '70000999', 'andrea.prueba@example.com', 'La Paz'),
(6, 'Andrea', 'Prueba', '70000888', 'andrea.prueba@example.com', 'La Paz'),
(7, 'Pedro', 'Prueba', '70000111', 'pedro@example.com', 'La Paz'),
(8, 'Pedro', 'Prueba', '70000111', 'pedro2@example.com', 'La Paz');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_herramienta`
--

CREATE TABLE `postulante_herramienta` (
  `postulante_id` int(11) NOT NULL,
  `herramienta_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `postulante_herramienta`
--

INSERT INTO `postulante_herramienta` (`postulante_id`, `herramienta_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 7),
(2, 1),
(2, 2),
(2, 5),
(3, 1),
(3, 3),
(3, 4),
(3, 6),
(5, 1),
(5, 2),
(6, 1),
(6, 2),
(6, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_lenguaje`
--

CREATE TABLE `postulante_lenguaje` (
  `postulante_id` int(11) NOT NULL,
  `lenguaje_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `postulante_lenguaje`
--

INSERT INTO `postulante_lenguaje` (`postulante_id`, `lenguaje_id`) VALUES
(1, 1),
(1, 3),
(2, 2),
(2, 5),
(3, 1),
(3, 3),
(3, 4),
(5, 1),
(5, 2),
(6, 1),
(6, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto`
--

CREATE TABLE `proyecto` (
  `id` int(11) NOT NULL,
  `postulante_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `enlace` varchar(225) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyecto`
--

INSERT INTO `proyecto` (`id`, `postulante_id`, `nombre`, `descripcion`, `enlace`) VALUES
(1, 1, 'Sistema de Ventas', 'Sistema web para gestionar productos y ventas', 'https://github.com/carlos/sistema-ventas'),
(2, 1, 'API de Biblioteca', 'API REST para gestionar libros y usuarios', 'https://github.com/carlos/api-biblioteca'),
(3, 2, 'Identidad Visual', 'Proyecto de diseño de identidad para una empresa', 'https://github.com/maria/identidad-visual'),
(4, 3, 'Aplicación de Tareas', 'Aplicación web para gestionar tareas', 'https://github.com/luis/app-tareas'),
(5, 5, 'Sistema de prueba', 'Aplicación web para gestionar información', 'https://github.com/ejemplo/proyecto'),
(7, 6, 'Sistema de prueba', 'Aplicación web para gestionar información', 'https://github.com/ejemplo/proyecto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('postulante','admin') NOT NULL DEFAULT 'postulante',
  `postulante_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `usuario`, `contrasena`, `rol`, `postulante_id`) VALUES
(1, 'admin_codework', '$2b$10$9MSiioZhdE7Bz/qQBsUFh.zd3dEtapdQzrTag3r9dSq.vvYzCjogW', 'admin', NULL),
(2, 'pedro_prueba2', '$2b$10$kHM8WlqU10Hqb.z.7cTaOeFFWIzXTlVNs0wv.f9mpmQap93KDzh.y', 'postulante', 8);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `experiencia_laboral`
--
ALTER TABLE `experiencia_laboral`
  ADD PRIMARY KEY (`id`),
  ADD KEY `postulante_id` (`postulante_id`);

--
-- Indices de la tabla `formacion`
--
ALTER TABLE `formacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `postulante_id` (`postulante_id`);

--
-- Indices de la tabla `herramienta`
--
ALTER TABLE `herramienta`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `lenguaje`
--
ALTER TABLE `lenguaje`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `postulante`
--
ALTER TABLE `postulante`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `postulante_herramienta`
--
ALTER TABLE `postulante_herramienta`
  ADD PRIMARY KEY (`postulante_id`,`herramienta_id`),
  ADD KEY `herramienta_id` (`herramienta_id`);

--
-- Indices de la tabla `postulante_lenguaje`
--
ALTER TABLE `postulante_lenguaje`
  ADD PRIMARY KEY (`postulante_id`,`lenguaje_id`),
  ADD KEY `lenguaje_id` (`lenguaje_id`);

--
-- Indices de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `postulante_id` (`postulante_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`usuario`),
  ADD UNIQUE KEY `postulante_id` (`postulante_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `experiencia_laboral`
--
ALTER TABLE `experiencia_laboral`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `formacion`
--
ALTER TABLE `formacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `herramienta`
--
ALTER TABLE `herramienta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `lenguaje`
--
ALTER TABLE `lenguaje`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `postulante`
--
ALTER TABLE `postulante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `experiencia_laboral`
--
ALTER TABLE `experiencia_laboral`
  ADD CONSTRAINT `experiencia_laboral_ibfk_1` FOREIGN KEY (`postulante_id`) REFERENCES `postulante` (`id`);

--
-- Filtros para la tabla `formacion`
--
ALTER TABLE `formacion`
  ADD CONSTRAINT `formacion_ibfk_1` FOREIGN KEY (`postulante_id`) REFERENCES `postulante` (`id`);

--
-- Filtros para la tabla `postulante_herramienta`
--
ALTER TABLE `postulante_herramienta`
  ADD CONSTRAINT `postulante_herramienta_ibfk_1` FOREIGN KEY (`postulante_id`) REFERENCES `postulante` (`id`),
  ADD CONSTRAINT `postulante_herramienta_ibfk_2` FOREIGN KEY (`herramienta_id`) REFERENCES `herramienta` (`id`);

--
-- Filtros para la tabla `postulante_lenguaje`
--
ALTER TABLE `postulante_lenguaje`
  ADD CONSTRAINT `postulante_lenguaje_ibfk_1` FOREIGN KEY (`postulante_id`) REFERENCES `postulante` (`id`),
  ADD CONSTRAINT `postulante_lenguaje_ibfk_2` FOREIGN KEY (`lenguaje_id`) REFERENCES `lenguaje` (`id`);

--
-- Filtros para la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD CONSTRAINT `proyecto_ibfk_1` FOREIGN KEY (`postulante_id`) REFERENCES `postulante` (`id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_postulante` FOREIGN KEY (`postulante_id`) REFERENCES `postulante` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
