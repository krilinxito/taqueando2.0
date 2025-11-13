-- defaultdb.productos definition
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- defaultdb.usuarios definition
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `rol` enum('admin','empleado') DEFAULT 'empleado',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);

-- defaultdb.arqueos_caja definition
CREATE TABLE `arqueos_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `billete_200` int NOT NULL DEFAULT '0',
  `billete_100` int NOT NULL DEFAULT '0',
  `billete_50` int NOT NULL DEFAULT '0',
  `billete_20` int NOT NULL DEFAULT '0',
  `billete_10` int NOT NULL DEFAULT '0',
  `moneda_5` int NOT NULL DEFAULT '0',
  `moneda_2` int NOT NULL DEFAULT '0',
  `moneda_1` int NOT NULL DEFAULT '0',
  `total_contado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `caja_chica` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_sistema` decimal(10,2) NOT NULL DEFAULT '0.00',
  `diferencia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` enum('cuadrado','sobrante','faltante') NOT NULL,
  `observaciones` text,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `arqueos_caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
);

-- defaultdb.caja definition
CREATE TABLE `caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `saldo_inicial` decimal(10,2) DEFAULT '0.00',
  `saldo_final` decimal(10,2) DEFAULT '0.00',
  `observaciones` text,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
);

-- defaultdb.pedidos definition
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int DEFAULT NULL,
  `estado` enum('pendiente','cancelado') DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
);

-- defaultdb.user_logs definition
CREATE TABLE `user_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `login_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_login_date` (`login_date`),
  CONSTRAINT `user_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
);

-- defaultdb.contiene definition
CREATE TABLE `contiene` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  `cantidad` int DEFAULT '1',
  `anulado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `contiene_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `contiene_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
);

-- defaultdb.pagos definition
CREATE TABLE `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `metodo` enum('efectivo','tarjeta','qr','online', 'efectivo-py') DEFAULT NULL,
  `hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`)
);
