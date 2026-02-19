# MICRO - Sistema de Créditos

## Descripción del Proyecto
Sistema de gestión de microcréditos desarrollado con NestJS (backend) y Angular (frontend).

---

## Trabajo Realizado

### Importación de Desembolsos (2026-02-03)

Se procesó el archivo `desembolsos.xlsx` para importar préstamos históricos al sistema.

**Datos procesados:**
- 69 clientes
- 173 desembolsos
- $49,352.50 monto total
- Rango de fechas: 2025-02-03 a 2026-01-23

**Lógica implementada:**
- Clientes con múltiples desembolsos: solo el último queda VIGENTE, los anteriores CANCELADO
- Resultado: 69 préstamos VIGENTE + 104 CANCELADO

**Archivos generados:**
- `desembolsos_lista.json` - Datos normalizados (173 registros)
- `importar_desembolsos.sql` - Script SQL para ejecutar
- `generar_sql_desembolsos.js` - Generador de SQL (configurable)
- `INSTRUCCIONES_IMPORTACION.md` - Guía detallada
- `RESUMEN_IMPORTACION.md` - Resumen ejecutivo

**Configuración del SQL:**
- Tipo crédito: Microcrédito (ID: 12)
- Tasa interés: 120% anual (10% mensual)
- Plazo: 12 meses
- Periodicidad: Mensual

---

### Generación de Planes de Pago (2026-02-08)

Se creó un procedimiento SQL para generar automáticamente los planes de pago de los préstamos importados.

**Archivo:** `generar_plan_pagos_desde_bd.sql`

**Lógica:**
- Lee préstamos existentes sin plan de pago
- Calcula cuotas según interés FLAT: Capital/N + Interés/N
- Genera fechas de vencimiento según periodicidad
- Crea registros en tabla `plan_pago`

**Resultado:**
- 173 préstamos × 12 cuotas = 2,076 cuotas generadas

---

### Importación de Pagos (2026-02-08)

Se procesó el archivo `PAGOS.xlsx` (Hoja5) para importar pagos históricos.

**Datos del Excel:**
- 392 pagos
- 41 personas con pagos
- Monto total: $6,472.60
- Columnas: idpersona, fechapago, montopagado

**Archivos generados:**
- `procesar_pagos.js` - Lee y normaliza datos del Excel
- `pagos_procesados.json` - Pagos normalizados
- `ejecutar_migracion_pagos.js` - Script Node.js para importar

**Lógica de distribución:**
1. Buscar préstamo VIGENTE de la persona
2. Distribuir pago en cuotas pendientes (orden cronológico)
3. Primero aplicar a interés, luego a capital
4. Actualizar estado de cuotas (PENDIENTE → PARCIAL → PAGADA)
5. Actualizar saldos del préstamo
6. Si saldo = 0, marcar préstamo como CANCELADO

**Resultado de la migración:**
| Métrica | Valor |
|---------|-------|
| Total procesados | 392 |
| Exitosos | 387 (98.7%) |
| Fallidos | 5 |

**Pagos fallidos:** Personas 65, 68, 69 no tienen préstamos activos.

**Estado final de préstamos:**
| Estado | Cantidad |
|--------|----------|
| CANCELADO | 138 |
| VIGENTE | 35 |

**Estado final de cuotas:**
| Estado | Cantidad |
|--------|----------|
| PAGADA | 209 |
| PARCIAL | 17 |
| PENDIENTE | 1,596 |

---

## Correcciones de Bugs

### Bug: Datos del cliente no se muestran en detalle de préstamo (2026-02-08)

**Problema:** En la vista de detalle de préstamos, pestaña "Información General", no se mostraban los datos del cliente (nombre, DUI).

**Causa raíz:** Desajuste de nombres entre backend y frontend:
- Backend envía: `prestamo.cliente`
- Frontend esperaba: `prestamo.persona`

**Archivos modificados:**

1. `frontend/src/app/core/models/credito.model.ts`
   - Agregada interface `cliente` a `Prestamo`

2. `frontend/src/app/features/creditos/components/prestamos/prestamo-detail.component.ts`
   - Actualizado método `getNombreCompleto()` para usar `cliente`
   - Actualizado template para buscar DUI en `cliente` primero

**Solución:** El frontend ahora busca datos en `cliente` (del backend) con fallback a `persona`.

---

### Bug: Línea de crédito y periodicidad no se muestran en reporte de colocación (2026-02-08)

**Problema:** En la vista `/creditos/reportes/colocacion`, no se mostraba la información de línea de crédito ni la periodicidad de pago.

**Causa raíz:** El backend no incluía estos campos en el DTO de resumen:
- Faltaba el join con `tipoCredito.lineaCredito`
- `PrestamoResumenDto` no incluía `lineaCredito` ni `periodicidadPago`

**Archivos modificados:**

1. `backend/src/creditos/desembolso/services/prestamo-consulta.service.ts`
   - Agregado join: `.leftJoinAndSelect('tipoCredito.lineaCredito', 'lineaCredito')`
   - Mapeados campos en `transformarAResumen()`: `lineaCredito` y `periodicidadPago`

2. `backend/src/creditos/desembolso/dto/prestamo-detalle.dto.ts`
   - Agregado `lineaCredito` dentro de `tipoCredito`
   - Agregado campo `periodicidadPago: string`

**Solución:** El backend ahora envía `tipoCredito.lineaCredito` y `periodicidadPago` en el DTO de resumen.

---

## Notas Técnicas

### Stack Tecnológico
- Backend: NestJS (puerto 3001)
- Frontend: Angular con Angular Material (puerto 4200)
- Base de datos: MySQL/MariaDB

### Comandos para levantar el proyecto
```bash
# Backend
cd micro-app/backend
npm run start:dev

# Frontend
cd micro-app/frontend
npm start
```

### Conexión a Base de Datos
- Host: localhost
- Puerto: 3306
- Usuario: root
- Password: root
- Database: micro_app

---

## Archivos de Migración

```
C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\
├── desembolsos.xlsx                    # Excel original de préstamos
├── desembolsos_lista.json              # Préstamos normalizados
├── importar_desembolsos.sql            # SQL de préstamos
├── generar_sql_desembolsos.js          # Generador de SQL préstamos
├── generar_plan_pagos_desde_bd.sql     # SQL para planes de pago
├── PAGOS.xlsx                          # Excel original de pagos
├── pagos_procesados.json               # Pagos normalizados
├── ejecutar_migracion_pagos.js         # Script de migración de pagos
├── INSTRUCCIONES_IMPORTACION.md        # Guía detallada
└── RESUMEN_IMPORTACION.md              # Resumen ejecutivo
```

---

## Commits Recientes
- Mover rol de usuario al pie del menu en móviles
- Ocultar menu y toolbar al imprimir recibos
- Mejoras responsive y correcciones estado de cuenta
- Tipografía Consolas para impresoras térmicas
