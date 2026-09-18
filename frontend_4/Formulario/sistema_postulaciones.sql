-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-09-2026 a las 04:42:49
-- Versión del servidor: 10.4.16-MariaDB
-- Versión de PHP: 7.4.12

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `experiencia_laboral`
--

INSERT INTO `experiencia_laboral` (`id`, `postulante_id`, `lugar`, `tipo`, `puesto`, `años_experiencia`) VALUES
(1, 1, 'xxxx', 'yyyyy', 'dddd', 1),
(2, 2, 'xxxx', 'pppppp', 'dddd', 5),
(3, 2, 'ppppp', 'ggggg', 'jkkkkk', 5),
(4, 3, 'ppppp', 'yyyyy', 'jkkkkk', 8),
(5, 3, 'xxxx', 'pppppp', 'dddd', 2),
(6, 4, 'hhhhh', 'ddddd', 'sssss', 1),
(7, 4, 'oooooo', 'fffff', 'zzzzzz', 2);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `formacion`
--

INSERT INTO `formacion` (`id`, `postulante_id`, `nivel`, `carrera`, `institucion`) VALUES
(1, 1, 'Universitario', 'info', 'umsa'),
(2, 2, 'Universitario', 'info', 'umsa'),
(3, 2, 'lic', 'sis', 'emi'),
(4, 3, 'lic', 'sis', 'umsa'),
(5, 3, 'lic', 'info', 'emi'),
(6, 4, 'Universitario', 'sistemas', 'uagrm'),
(7, 4, 'dr', 'Redes', 'umsa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `herramienta`
--

CREATE TABLE `herramienta` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `herramienta`
--

INSERT INTO `herramienta` (`id`, `nombre`) VALUES
(1, 'visual'),
(2, 'xxxx'),
(3, 'fffff'),
(4, 'rrrrr'),
(5, 'PyCharm:'),
(6, 'IntelliJ IDEA'),
(7, 'Git'),
(8, 'html'),
(9, 'css');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lenguaje`
--

CREATE TABLE `lenguaje` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `lenguaje`
--

INSERT INTO `lenguaje` (`id`, `nombre`) VALUES
(1, 'html'),
(2, 'css'),
(3, 'js'),
(4, 'java'),
(5, 'php'),
(6, 'python'),
(7, 'c'),
(8, 'c++');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante`
--

CREATE TABLE `postulante` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `ci` int(35) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `ciudad` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `postulante`
--

INSERT INTO `postulante` (`id`, `nombre`, `apellido`, `ci`, `telefono`, `correo`, `ciudad`) VALUES
(1, 'Tommy', 'Rojas', 123456, '21345622', 'aaaa@gmail.com', 'La Paz'),
(2, 'Juan', 'Mamani', 9875234, '2432351', 'bbb@gmail.com', 'La Paz'),
(3, 'Pedro', 'Martínez', 97732564, '23253456', 'rrrfd@gmail.com', 'Oruro'),
(4, 'Mario', 'Carrasco', 789456123, '223335', 'rtygrfd@gmail.com', 'Santa Cruz');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_herramienta`
--

CREATE TABLE `postulante_herramienta` (
  `postulante_id` int(11) NOT NULL,
  `herramienta_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `postulante_herramienta`
--

INSERT INTO `postulante_herramienta` (`postulante_id`, `herramienta_id`) VALUES
(1, 1),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(3, 5),
(3, 6),
(3, 7),
(4, 1),
(4, 5),
(4, 8),
(4, 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_lenguaje`
--

CREATE TABLE `postulante_lenguaje` (
  `postulante_id` int(11) NOT NULL,
  `lenguaje_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `postulante_lenguaje`
--

INSERT INTO `postulante_lenguaje` (`postulante_id`, `lenguaje_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 3),
(2, 4),
(2, 5),
(3, 3),
(3, 4),
(3, 6),
(3, 7),
(4, 1),
(4, 3),
(4, 4),
(4, 7),
(4, 8);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `proyecto`
--

INSERT INTO `proyecto` (`id`, `postulante_id`, `nombre`, `descripcion`, `enlace`) VALUES
(1, 1, 'ventas', 'ssssss', 'www.ventas.com'),
(2, 2, 'qqqq', 'qqqq', 'www.venqqqtas.com'),
(3, 3, 'ooooo', 'xxxxxxxxxxxx', 'www.oooooo.com'),
(4, 3, 'qqqq', 'pppppppppp', 'www.qqqqqq.com'),
(5, 3, 'iiiiiiiii', 'iiiiiiiiiiii', 'www.iiii.com'),
(6, 4, 'tienda', 'xxxdgwergw', 'www.tienda.com'),
(7, 4, 'ggggg', 'ewfqrherhgyq', 'www.ggg.com');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `formacion`
--
ALTER TABLE `formacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `herramienta`
--
ALTER TABLE `herramienta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `lenguaje`
--
ALTER TABLE `lenguaje`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `postulante`
--
ALTER TABLE `postulante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
