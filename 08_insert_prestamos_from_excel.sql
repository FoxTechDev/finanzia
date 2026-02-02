-- =====================================================
-- INSERTAR PRÉSTAMOS (DESEMBOLSOS)
-- Total: 170 préstamos
-- Generado automáticamente desde prestamos.xlsx
-- =====================================================

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  1,
  1,
  1,
  'CRE-000001',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  2,
  2,
  1,
  'CRE-000002',
  1, -- tipoCreditoId
  250.00,
  250.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  68.75,
  68.75,
  4, -- numeroCuotas
  25.00,
  0.00, -- totalRecargos
  275.00,
  275.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-03-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  3,
  3,
  2,
  'CRE-000003',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-03-01',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  4,
  4,
  2,
  'CRE-000004',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-15',
  '2025-05-21',
  '2025-06-11',
  '2025-06-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  5,
  5,
  2,
  'CRE-000005',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  360.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-12',
  '2025-06-18',
  '2025-07-09',
  '2025-07-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  6,
  6,
  2,
  'CRE-000006',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  480.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-02',
  '2025-09-08',
  '2025-09-29',
  '2025-10-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  7,
  7,
  2,
  'CRE-000007',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  600.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-08',
  '2025-11-14',
  '2025-12-05',
  '2026-01-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  8,
  8,
  2,
  'CRE-000008',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  500.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-05',
  '2026-01-11',
  '2026-02-01',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  9,
  9,
  3,
  'CRE-000009',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  10,
  10,
  3,
  'CRE-000010',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-03-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  11,
  11,
  3,
  'CRE-000011',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-04-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  12,
  12,
  3,
  'CRE-000012',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-05-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  13,
  13,
  3,
  'CRE-000013',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-24',
  '2025-05-30',
  '2025-06-20',
  '2025-06-20',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  14,
  14,
  3,
  'CRE-000014',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-21',
  '2025-06-27',
  '2025-07-18',
  '2025-07-18',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  15,
  15,
  3,
  'CRE-000015',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-19',
  '2025-07-25',
  '2025-08-15',
  '2025-08-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  16,
  16,
  3,
  'CRE-000016',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-16',
  '2025-08-22',
  '2025-09-12',
  '2025-09-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  17,
  17,
  4,
  'CRE-000017',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  18,
  18,
  4,
  'CRE-000018',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-25',
  '2025-03-03',
  '2025-03-24',
  '2025-04-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  19,
  19,
  4,
  'CRE-000019',
  1, -- tipoCreditoId
  455.00,
  455.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  125.13,
  125.13,
  4, -- numeroCuotas
  45.50,
  0.00, -- totalRecargos
  500.50,
  546.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-31',
  '2025-06-06',
  '2025-06-27',
  '2026-01-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  20,
  20,
  5,
  'CRE-000020',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  21,
  21,
  5,
  'CRE-000021',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-03-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  22,
  22,
  5,
  'CRE-000022',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-22',
  '2025-03-28',
  '2025-04-18',
  '2025-12-13',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  23,
  23,
  6,
  'CRE-000023',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  24,
  24,
  6,
  'CRE-000024',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-05-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  25,
  25,
  7,
  'CRE-000025',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-02-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  26,
  26,
  7,
  'CRE-000026',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-22',
  '2025-02-28',
  '2025-03-21',
  '2025-03-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  27,
  27,
  7,
  'CRE-000027',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  480.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-22',
  '2025-03-28',
  '2025-04-18',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  28,
  28,
  8,
  'CRE-000028',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-03-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  29,
  29,
  9,
  'CRE-000029',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-02-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  30,
  30,
  9,
  'CRE-000030',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  360.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-18',
  '2025-04-24',
  '2025-05-15',
  '2025-06-19',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  31,
  31,
  9,
  'CRE-000031',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  390.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-25',
  '2025-07-01',
  '2025-07-22',
  '2025-09-21',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  32,
  32,
  10,
  'CRE-000032',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-03-01',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  33,
  33,
  11,
  'CRE-000033',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-03-18',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  34,
  34,
  12,
  'CRE-000034',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-03',
  '2025-02-09',
  '2025-03-02',
  '2025-03-01',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  35,
  35,
  13,
  'CRE-000035',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-08',
  '2025-02-14',
  '2025-03-07',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  36,
  36,
  13,
  'CRE-000036',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-04-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  37,
  37,
  13,
  'CRE-000037',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  240.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-12',
  '2025-04-18',
  '2025-05-09',
  '2025-05-31',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  38,
  38,
  13,
  'CRE-000038',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  240.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-07',
  '2025-06-13',
  '2025-07-04',
  '2025-07-19',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  39,
  39,
  13,
  'CRE-000039',
  1, -- tipoCreditoId
  120.00,
  120.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  33.00,
  33.00,
  4, -- numeroCuotas
  12.00,
  0.00, -- totalRecargos
  132.00,
  144.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-02',
  '2025-08-08',
  '2025-08-29',
  '2026-01-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  40,
  40,
  14,
  'CRE-000040',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-08',
  '2025-02-14',
  '2025-03-07',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  41,
  41,
  14,
  'CRE-000041',
  1, -- tipoCreditoId
  310.00,
  310.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  85.25,
  85.25,
  4, -- numeroCuotas
  31.00,
  0.00, -- totalRecargos
  341.00,
  310.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-03-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  42,
  42,
  14,
  'CRE-000042',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-22',
  '2025-03-28',
  '2025-04-18',
  '2025-04-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  43,
  43,
  14,
  'CRE-000043',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  480.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-12',
  '2025-04-18',
  '2025-05-09',
  '2025-05-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  44,
  44,
  14,
  'CRE-000044',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  600.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-24',
  '2025-05-30',
  '2025-06-20',
  '2026-01-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  45,
  45,
  15,
  'CRE-000045',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-08',
  '2025-02-14',
  '2025-03-07',
  '2025-03-08',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  46,
  46,
  16,
  'CRE-000046',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-08',
  '2025-02-14',
  '2025-03-07',
  '2025-03-08',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  47,
  47,
  17,
  'CRE-000047',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-08',
  '2025-02-14',
  '2025-03-07',
  '2025-02-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  48,
  48,
  17,
  'CRE-000048',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-25',
  '2025-03-03',
  '2025-03-24',
  '2026-01-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  49,
  49,
  18,
  'CRE-000049',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-15',
  '2025-02-21',
  '2025-03-14',
  '2025-03-01',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  50,
  50,
  18,
  'CRE-000050',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  480.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-08',
  '2025-03-14',
  '2025-04-04',
  '2025-04-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  51,
  51,
  18,
  'CRE-000051',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  480.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-06-24',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  52,
  52,
  18,
  'CRE-000052',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  480.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-25',
  '2025-07-01',
  '2025-07-22',
  '2025-09-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  53,
  53,
  19,
  'CRE-000053',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-15',
  '2025-02-21',
  '2025-03-14',
  '2025-05-31',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  54,
  54,
  20,
  'CRE-000054',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-22',
  '2025-02-28',
  '2025-03-21',
  '2025-03-08',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  55,
  55,
  20,
  'CRE-000055',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-22',
  '2025-03-28',
  '2025-04-18',
  '2025-06-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  56,
  56,
  21,
  'CRE-000056',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-22',
  '2025-02-28',
  '2025-03-21',
  '2025-03-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  57,
  57,
  21,
  'CRE-000057',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  440.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-06-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  58,
  58,
  22,
  'CRE-000058',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-02-22',
  '2025-02-28',
  '2025-03-21',
  '2025-03-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  59,
  59,
  22,
  'CRE-000059',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  600.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-22',
  '2025-03-28',
  '2025-04-18',
  '2025-04-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  60,
  60,
  22,
  'CRE-000060',
  1, -- tipoCreditoId
  622.50,
  622.50,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  171.19,
  171.19,
  4, -- numeroCuotas
  62.25,
  0.00, -- totalRecargos
  684.75,
  747.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-17',
  '2025-05-23',
  '2025-06-13',
  '2025-12-04',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  61,
  61,
  23,
  'CRE-000061',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-03-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  62,
  62,
  23,
  'CRE-000062',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-22',
  '2025-03-28',
  '2025-04-18',
  '2025-04-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  63,
  63,
  23,
  'CRE-000063',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  440.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-12',
  '2025-04-18',
  '2025-05-09',
  '2025-04-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  64,
  64,
  23,
  'CRE-000064',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-03',
  '2025-05-09',
  '2025-05-30',
  '2025-10-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  65,
  65,
  24,
  'CRE-000065',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  110.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-03-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  66,
  66,
  25,
  'CRE-000066',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-01',
  '2025-03-07',
  '2025-03-28',
  '2025-03-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  67,
  67,
  25,
  'CRE-000067',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-04-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  68,
  68,
  25,
  'CRE-000068',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  240.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-10-18',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  69,
  69,
  26,
  'CRE-000069',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-08',
  '2025-03-14',
  '2025-04-04',
  '2025-05-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  70,
  70,
  27,
  'CRE-000070',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-15',
  '2025-03-21',
  '2025-04-11',
  '2025-04-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  71,
  71,
  27,
  'CRE-000071',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-12',
  '2025-04-18',
  '2025-05-09',
  '2025-05-20',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  72,
  72,
  28,
  'CRE-000072',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  440.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-15',
  '2025-03-21',
  '2025-04-11',
  '2025-03-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  73,
  73,
  28,
  'CRE-000073',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  440.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-05',
  '2025-04-11',
  '2025-05-02',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  74,
  74,
  29,
  'CRE-000074',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-15',
  '2025-03-21',
  '2025-04-11',
  '2025-04-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  75,
  75,
  29,
  'CRE-000075',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-03',
  '2025-05-09',
  '2025-05-30',
  '2025-09-20',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  76,
  76,
  30,
  'CRE-000076',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-15',
  '2025-03-21',
  '2025-04-11',
  '2025-03-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  77,
  77,
  30,
  'CRE-000077',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  480.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-05',
  '2025-04-11',
  '2025-05-02',
  '2025-05-14',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  78,
  78,
  31,
  'CRE-000078',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  110.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-15',
  '2025-03-21',
  '2025-04-11',
  NULL,
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  79,
  79,
  31,
  'CRE-000079',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-03-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  80,
  80,
  31,
  'CRE-000080',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  550.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-12',
  '2025-04-18',
  '2025-05-09',
  '2025-04-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  81,
  81,
  31,
  'CRE-000081',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-04-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  82,
  82,
  31,
  'CRE-000082',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-24',
  '2025-05-30',
  '2025-06-20',
  '2025-05-24',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  83,
  83,
  31,
  'CRE-000083',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-21',
  '2025-06-27',
  '2025-07-18',
  '2025-06-21',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  84,
  84,
  31,
  'CRE-000084',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-19',
  '2025-07-25',
  '2025-08-15',
  '2025-07-19',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  85,
  85,
  31,
  'CRE-000085',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-23',
  '2025-08-29',
  '2025-09-19',
  '2025-08-23',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  86,
  86,
  31,
  'CRE-000086',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-27',
  '2025-10-03',
  '2025-10-24',
  '2025-09-27',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  87,
  87,
  31,
  'CRE-000087',
  1, -- tipoCreditoId
  600.00,
  600.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  165.00,
  165.00,
  4, -- numeroCuotas
  60.00,
  0.00, -- totalRecargos
  660.00,
  660.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-25',
  '2025-10-31',
  '2025-11-21',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  88,
  88,
  32,
  'CRE-000088',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  110.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-15',
  '2025-03-21',
  '2025-04-11',
  NULL,
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  89,
  89,
  32,
  'CRE-000089',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-03-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  90,
  90,
  32,
  'CRE-000090',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  550.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-05',
  '2025-04-11',
  '2025-05-02',
  '2025-04-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  91,
  91,
  32,
  'CRE-000091',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  550.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-04-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  92,
  92,
  32,
  'CRE-000092',
  1, -- tipoCreditoId
  700.00,
  700.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  192.50,
  192.50,
  4, -- numeroCuotas
  70.00,
  0.00, -- totalRecargos
  770.00,
  770.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-03',
  '2025-05-09',
  '2025-05-30',
  '2025-05-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  93,
  93,
  32,
  'CRE-000093',
  1, -- tipoCreditoId
  700.00,
  700.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  192.50,
  192.50,
  4, -- numeroCuotas
  70.00,
  0.00, -- totalRecargos
  770.00,
  770.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-24',
  '2025-05-30',
  '2025-06-20',
  '2025-05-24',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  94,
  94,
  32,
  'CRE-000094',
  1, -- tipoCreditoId
  700.00,
  700.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  192.50,
  192.50,
  4, -- numeroCuotas
  70.00,
  0.00, -- totalRecargos
  770.00,
  770.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-21',
  '2025-06-27',
  '2025-07-18',
  '2025-06-21',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  95,
  95,
  32,
  'CRE-000095',
  1, -- tipoCreditoId
  700.00,
  700.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  192.50,
  192.50,
  4, -- numeroCuotas
  70.00,
  0.00, -- totalRecargos
  770.00,
  770.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-19',
  '2025-07-25',
  '2025-08-15',
  '2025-07-19',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  96,
  96,
  32,
  'CRE-000096',
  1, -- tipoCreditoId
  700.00,
  700.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  192.50,
  192.50,
  4, -- numeroCuotas
  70.00,
  0.00, -- totalRecargos
  770.00,
  770.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-23',
  '2025-08-29',
  '2025-09-19',
  '2025-08-23',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  97,
  97,
  32,
  'CRE-000097',
  1, -- tipoCreditoId
  700.00,
  700.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  192.50,
  192.50,
  4, -- numeroCuotas
  70.00,
  0.00, -- totalRecargos
  770.00,
  770.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-27',
  '2025-10-03',
  '2025-10-24',
  '2025-09-27',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  98,
  98,
  32,
  'CRE-000098',
  1, -- tipoCreditoId
  700.00,
  700.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  192.50,
  192.50,
  4, -- numeroCuotas
  70.00,
  0.00, -- totalRecargos
  770.00,
  770.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-25',
  '2025-10-31',
  '2025-11-21',
  '2026-01-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  99,
  99,
  33,
  'CRE-000099',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-22',
  '2025-03-28',
  '2025-04-18',
  '2025-04-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  100,
  100,
  33,
  'CRE-000100',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  270.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-18',
  '2025-04-24',
  '2025-05-15',
  '2025-05-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  101,
  101,
  33,
  'CRE-000101',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-12',
  '2025-05-18',
  '2025-06-08',
  '2025-09-27',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  102,
  102,
  34,
  'CRE-000102',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2026-01-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  103,
  103,
  35,
  'CRE-000103',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-04-24',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  104,
  104,
  35,
  'CRE-000104',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-10-18',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  105,
  105,
  36,
  'CRE-000105',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-04-24',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  106,
  106,
  36,
  'CRE-000106',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2026-01-10',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  107,
  107,
  37,
  'CRE-000107',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  108,
  108,
  38,
  'CRE-000108',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-03-28',
  '2025-04-03',
  '2025-04-24',
  '2025-05-11',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  109,
  109,
  39,
  'CRE-000109',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-12',
  '2025-04-18',
  '2025-05-09',
  '2025-05-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  110,
  110,
  40,
  'CRE-000110',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-06-19',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  111,
  111,
  40,
  'CRE-000111',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  330.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-27',
  '2025-07-03',
  '2025-07-24',
  '2025-12-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  112,
  112,
  41,
  'CRE-000112',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-04-26',
  '2025-05-02',
  '2025-05-23',
  '2025-11-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  113,
  113,
  42,
  'CRE-000113',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-03',
  '2025-05-09',
  '2025-05-30',
  '2025-05-25',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  114,
  114,
  42,
  'CRE-000114',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  360.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-31',
  '2025-06-06',
  '2025-06-27',
  '2025-07-04',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  115,
  115,
  42,
  'CRE-000115',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  360.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-16',
  '2025-08-22',
  '2025-09-12',
  '2025-08-23',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  116,
  116,
  42,
  'CRE-000116',
  1, -- tipoCreditoId
  345.00,
  345.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  94.88,
  94.88,
  4, -- numeroCuotas
  34.50,
  0.00, -- totalRecargos
  379.50,
  414.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-08',
  '2025-11-14',
  '2025-12-05',
  '2025-12-24',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  117,
  117,
  43,
  'CRE-000117',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-24',
  '2025-05-30',
  '2025-06-20',
  '2025-05-31',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  118,
  118,
  44,
  'CRE-000118',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-05-29',
  '2025-06-04',
  '2025-06-25',
  '2025-06-23',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  119,
  119,
  44,
  'CRE-000119',
  1, -- tipoCreditoId
  250.00,
  250.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  68.75,
  68.75,
  4, -- numeroCuotas
  25.00,
  0.00, -- totalRecargos
  275.00,
  275.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-24',
  '2025-06-30',
  '2025-07-21',
  '2025-07-24',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  120,
  120,
  45,
  'CRE-000120',
  1, -- tipoCreditoId
  150.00,
  150.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  41.25,
  41.25,
  4, -- numeroCuotas
  15.00,
  0.00, -- totalRecargos
  165.00,
  180.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-06-24',
  '2025-06-30',
  '2025-07-21',
  '2025-07-31',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  121,
  121,
  46,
  'CRE-000121',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  115.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-04',
  '2025-07-10',
  '2025-07-31',
  '2025-07-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  122,
  122,
  46,
  'CRE-000122',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  115.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-29',
  '2025-08-04',
  '2025-08-25',
  '2025-08-19',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  123,
  123,
  46,
  'CRE-000123',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-21',
  '2025-08-27',
  '2025-09-17',
  '2025-09-13',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  124,
  124,
  46,
  'CRE-000124',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  230.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-16',
  '2025-09-22',
  '2025-10-13',
  '2025-10-06',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  125,
  125,
  46,
  'CRE-000125',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-07',
  '2025-10-13',
  '2025-11-03',
  '2025-10-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  126,
  126,
  46,
  'CRE-000126',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  230.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-31',
  '2025-11-06',
  '2025-11-27',
  '2025-11-20',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  127,
  127,
  46,
  'CRE-000127',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  230.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-21',
  '2025-11-27',
  '2025-12-18',
  '2025-12-11',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  128,
  128,
  46,
  'CRE-000128',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  345.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-12-12',
  '2025-12-18',
  '2026-01-08',
  '2026-01-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  129,
  129,
  46,
  'CRE-000129',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  300.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-06',
  '2026-01-12',
  '2026-02-02',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  130,
  130,
  47,
  'CRE-000130',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-07',
  '2025-07-13',
  '2025-08-03',
  '2025-07-31',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  131,
  131,
  48,
  'CRE-000131',
  1, -- tipoCreditoId
  150.00,
  150.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  41.25,
  41.25,
  4, -- numeroCuotas
  15.00,
  0.00, -- totalRecargos
  165.00,
  180.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-09',
  '2025-07-15',
  '2025-08-05',
  '2025-08-18',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  132,
  132,
  48,
  'CRE-000132',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-19',
  '2025-09-25',
  '2025-10-16',
  NULL,
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  133,
  133,
  49,
  'CRE-000133',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-26',
  '2025-08-01',
  '2025-08-22',
  '2025-09-04',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  134,
  134,
  49,
  'CRE-000134',
  1, -- tipoCreditoId
  125.00,
  125.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  34.38,
  34.38,
  4, -- numeroCuotas
  12.50,
  0.00, -- totalRecargos
  137.50,
  150.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-05',
  '2025-09-11',
  '2025-10-02',
  '2025-10-10',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  135,
  135,
  49,
  'CRE-000135',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  240.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-11',
  '2025-10-17',
  '2025-11-07',
  '2025-11-14',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  136,
  136,
  49,
  'CRE-000136',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  360.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-15',
  '2025-11-21',
  '2025-12-12',
  '2025-12-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  137,
  137,
  49,
  'CRE-000137',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  360.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-12-23',
  '2025-12-29',
  '2026-01-19',
  '2026-01-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  138,
  138,
  50,
  'CRE-000138',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  440.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-20',
  '2025-08-26',
  '2025-09-16',
  '2025-09-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  139,
  139,
  50,
  'CRE-000139',
  1, -- tipoCreditoId
  1000.00,
  1000.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  275.00,
  275.00,
  4, -- numeroCuotas
  100.00,
  0.00, -- totalRecargos
  1100.00,
  1200.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-16',
  '2025-10-22',
  '2025-11-12',
  '2025-12-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  140,
  140,
  50,
  'CRE-000140',
  1, -- tipoCreditoId
  1500.00,
  1500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  412.50,
  412.50,
  4, -- numeroCuotas
  150.00,
  0.00, -- totalRecargos
  1650.00,
  1500.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-09',
  '2026-01-15',
  '2026-02-05',
  NULL,
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  141,
  141,
  51,
  'CRE-000141',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-07-30',
  '2025-08-05',
  '2025-08-26',
  '2025-09-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  142,
  142,
  51,
  'CRE-000142',
  1, -- tipoCreditoId
  125.00,
  125.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  34.38,
  34.38,
  4, -- numeroCuotas
  12.50,
  0.00, -- totalRecargos
  137.50,
  150.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-17',
  '2025-09-23',
  '2025-10-14',
  '2025-11-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  143,
  143,
  51,
  'CRE-000143',
  1, -- tipoCreditoId
  125.00,
  125.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  34.38,
  34.38,
  4, -- numeroCuotas
  12.50,
  0.00, -- totalRecargos
  137.50,
  150.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-06',
  '2025-11-12',
  '2025-12-03',
  '2025-12-23',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  144,
  144,
  51,
  'CRE-000144',
  1, -- tipoCreditoId
  125.00,
  125.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  34.38,
  34.38,
  4, -- numeroCuotas
  12.50,
  0.00, -- totalRecargos
  137.50,
  150.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-12-24',
  '2025-12-30',
  '2026-01-20',
  '2026-01-05',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  145,
  145,
  52,
  'CRE-000145',
  1, -- tipoCreditoId
  250.00,
  250.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  68.75,
  68.75,
  4, -- numeroCuotas
  25.00,
  0.00, -- totalRecargos
  275.00,
  275.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-11',
  '2025-08-17',
  '2025-09-07',
  '2025-09-01',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  146,
  146,
  52,
  'CRE-000146',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  360.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-02',
  '2025-09-08',
  '2025-09-29',
  '2026-01-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  147,
  147,
  53,
  'CRE-000147',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  220.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-12',
  '2025-08-18',
  '2025-09-08',
  '2025-10-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  148,
  148,
  53,
  'CRE-000148',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  390.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-23',
  '2025-10-29',
  '2025-11-19',
  '2026-01-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  149,
  149,
  54,
  'CRE-000149',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-08-16',
  '2025-08-22',
  '2025-09-12',
  '2025-09-22',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  150,
  150,
  54,
  'CRE-000150',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-23',
  '2025-09-29',
  '2025-10-20',
  '2025-10-28',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  151,
  151,
  54,
  'CRE-000151',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-03',
  '2025-11-09',
  '2025-11-30',
  '2025-12-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  152,
  152,
  54,
  'CRE-000152',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-12-17',
  '2025-12-23',
  '2026-01-13',
  '2026-01-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  153,
  153,
  55,
  'CRE-000153',
  1, -- tipoCreditoId
  50.00,
  50.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  13.75,
  13.75,
  4, -- numeroCuotas
  5.00,
  0.00, -- totalRecargos
  55.00,
  60.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-09-05',
  '2025-09-11',
  '2025-10-02',
  '2025-09-30',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  154,
  154,
  55,
  'CRE-000154',
  1, -- tipoCreditoId
  50.00,
  50.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  13.75,
  13.75,
  4, -- numeroCuotas
  5.00,
  0.00, -- totalRecargos
  55.00,
  60.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-01',
  '2025-10-07',
  '2025-10-28',
  '2025-12-03',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  155,
  155,
  56,
  'CRE-000155',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-03',
  '2025-10-09',
  '2025-10-30',
  '2025-11-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  156,
  156,
  56,
  'CRE-000156',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  390.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-18',
  '2025-11-24',
  '2025-12-15',
  '2026-01-14',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  157,
  157,
  57,
  'CRE-000157',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  240.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-10-07',
  '2025-10-13',
  '2025-11-03',
  '2025-11-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  158,
  158,
  57,
  'CRE-000158',
  1, -- tipoCreditoId
  300.00,
  300.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  82.50,
  82.50,
  4, -- numeroCuotas
  30.00,
  0.00, -- totalRecargos
  330.00,
  300.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-27',
  '2025-12-03',
  '2025-12-24',
  '2026-01-16',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  159,
  159,
  58,
  'CRE-000159',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-15',
  '2025-11-21',
  '2025-12-12',
  '2025-12-26',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  160,
  160,
  58,
  'CRE-000160',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-12-27',
  '2026-01-02',
  '2026-01-23',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  161,
  161,
  59,
  'CRE-000161',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  100.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-11-27',
  '2025-12-03',
  '2025-12-24',
  '2026-01-07',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  162,
  162,
  59,
  'CRE-000162',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  240.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-08',
  '2026-01-14',
  '2026-02-04',
  '2026-01-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  163,
  163,
  60,
  'CRE-000163',
  1, -- tipoCreditoId
  500.00,
  500.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  137.50,
  137.50,
  4, -- numeroCuotas
  50.00,
  0.00, -- totalRecargos
  550.00,
  700.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-12-31',
  '2026-01-06',
  '2026-01-27',
  '2026-01-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  164,
  164,
  61,
  'CRE-000164',
  1, -- tipoCreditoId
  200.00,
  200.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  55.00,
  55.00,
  4, -- numeroCuotas
  20.00,
  0.00, -- totalRecargos
  220.00,
  240.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2025-12-31',
  '2026-01-06',
  '2026-01-27',
  '2026-01-12',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  165,
  165,
  62,
  'CRE-000165',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  110.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-08',
  '2026-01-14',
  '2026-02-04',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  166,
  166,
  63,
  'CRE-000166',
  1, -- tipoCreditoId
  400.00,
  400.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  110.00,
  110.00,
  4, -- numeroCuotas
  40.00,
  0.00, -- totalRecargos
  440.00,
  440.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-13',
  '2026-01-19',
  '2026-02-09',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  167,
  167,
  64,
  'CRE-000167',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-09',
  '2026-01-15',
  '2026-02-05',
  NULL,
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  168,
  168,
  65,
  'CRE-000168',
  1, -- tipoCreditoId
  100.00,
  100.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  27.50,
  27.50,
  4, -- numeroCuotas
  10.00,
  0.00, -- totalRecargos
  110.00,
  120.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-08',
  '2026-01-14',
  '2026-02-04',
  '2026-01-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  169,
  169,
  66,
  'CRE-000169',
  1, -- tipoCreditoId
  250.00,
  250.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  68.75,
  68.75,
  4, -- numeroCuotas
  25.00,
  0.00, -- totalRecargos
  275.00,
  325.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-08',
  '2026-01-14',
  '2026-02-04',
  '2026-01-15',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);

INSERT INTO prestamo (
  id, solicitudId, personaId, numeroCredito, tipoCreditoId,
  montoAutorizado, montoDesembolsado,
  plazoAutorizado, tasaInteres, tasaInteresMoratorio,
  tipoInteres, periodicidadPago,
  cuotaNormal, cuotaTotal, numeroCuotas,
  totalInteres, totalRecargos, totalPagar,
  saldoCapital, saldoInteres,
  capitalMora, interesMora, diasMora,
  fechaOtorgamiento, fechaPrimeraCuota, fechaVencimiento,
  fechaUltimoPago, fechaCancelacion,
  categoriaNCB022, estado,
  clasificacionPrestamoId, estadoPrestamoId,
  usuarioDesembolsoId, nombreUsuarioDesembolso,
  createdAt, updatedAt
) VALUES (
  170,
  170,
  67,
  'CRE-000170',
  1, -- tipoCreditoId
  150.00,
  150.00,
  4, -- plazoAutorizado (semanas)
  10.00,
  5.00, -- tasaInteresMoratorio
  'FLAT',
  'SEMANAL',
  41.25,
  41.25,
  4, -- numeroCuotas
  15.00,
  0.00, -- totalRecargos
  165.00,
  165.00,
  0.00, -- saldoInteres
  0.00, -- capitalMora
  0.00, -- interesMora
  0, -- diasMora
  '2026-01-12',
  '2026-01-18',
  '2026-02-08',
  '2026-01-17',
  NULL,
  'A', -- categoriaNCB022
  'VIGENTE',
  1, -- clasificacionPrestamoId (A - Vigente sin mora)
  1, -- estadoPrestamoId (1=VIGENTE, 3=CANCELADO)
  1, -- usuarioDesembolsoId
  'Sistema',
  NOW(),
  NOW()
);