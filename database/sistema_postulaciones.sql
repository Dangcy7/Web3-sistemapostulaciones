-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-09-2026 a las 18:41:42
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `herramienta`
--

CREATE TABLE `herramienta` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lenguaje`
--

CREATE TABLE `lenguaje` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_herramienta`
--

CREATE TABLE `postulante_herramienta` (
  `postulante_id` int(11) NOT NULL,
  `herramienta_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_lenguaje`
--

CREATE TABLE `postulante_lenguaje` (
  `postulante_id` int(11) NOT NULL,
  `lenguaje_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `experiencia_laboral`
--
ALTER TABLE `experiencia_laboral`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `formacion`
--
ALTER TABLE `formacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `herramienta`
--
ALTER TABLE `herramienta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lenguaje`
--
ALTER TABLE `lenguaje`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `postulante`
--
ALTER TABLE `postulante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
