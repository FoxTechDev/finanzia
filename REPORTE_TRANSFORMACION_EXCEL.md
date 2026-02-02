# REPORTE DE TRANSFORMACIÓN Y MAPEO

Fecha: 26/1/2026, 4:48:19 a. m.

## Resumen de la Migración

- **Clientes procesados**: 67
- **Solicitudes generadas**: 170
- **Préstamos desembolsados**: 170
- **Pagos registrados**: 969
- **Fechas procesadas**: 232

## Estructura del Excel Original

- **Formato**: Matriz de pagos con fechas como columnas
- **Fila 0**: Fechas de transacciones
- **Fila 1**: Etiquetas (Desem., Pago, Saldo)
- **Filas 2+**: Datos de clientes con montos

## Transformaciones Aplicadas

1. **Fechas**: Convertidas de serial de Excel a formato MySQL (YYYY-MM-DD)
2. **Montos**: Limpiados de símbolos $ y formateados a DECIMAL(14,2)
3. **Nombres**: Asociados a IDs de persona según orden del archivo de personas
4. **Solicitudes**: Generadas automáticamente para cada desembolso
5. **Préstamos**: Calculados con tasa flat del 10%, 4 cuotas semanales
6. **Pagos**: Distribuidos 80% capital, 20% interés
7. **Estados**: Determinados según saldo (VIGENTE si saldo > 0, CANCELADO si = 0)

## Supuestos y Valores Por Defecto

- **Línea de crédito**: ID 1 (Crédito Personal)
- **Tipo de crédito**: ID 1 (Crédito Personal)
- **Destino**: CONSUMO_PERSONAL
- **Tasa de interés**: 10% flat
- **Tasa moratoria**: 5%
- **Plazo**: 4 cuotas
- **Periodicidad**: SEMANAL
- **Tipo de interés**: FLAT
- **Categoría NCB-022**: A (Normal)
- **Usuario**: ID 1 (Sistema)

## Validaciones Requeridas Post-Migración

1. Verificar que los IDs de persona coincidan con la tabla persona
2. Validar que todas las foreign keys sean correctas
3. Revisar los saldos calculados vs saldos reales
4. Confirmar las fechas de vencimiento
5. Validar la distribución de pagos (capital vs interés)

## Muestra de Datos Procesados

### Primeros 5 Clientes:

- ID 1: Alexander Estanley Mejía Gutiérrez
- ID 2: Karen Yaneth Chachagua García
- ID 3: Norma Isabel Cácamo Rodríguez
- ID 4: Juan José Danilo Lemus Gaitán
- ID 5: Reyna Carolina Morán Ramírez

### Primeros 5 Préstamos:

- CRE-000001: $200.00 - Cliente ID 1 - Fecha: 2025-02-03
- CRE-000002: $250.00 - Cliente ID 1 - Fecha: 2025-03-01
- CRE-000003: $200.00 - Cliente ID 2 - Fecha: 2025-02-03
- CRE-000004: $200.00 - Cliente ID 2 - Fecha: 2025-05-15
- CRE-000005: $300.00 - Cliente ID 2 - Fecha: 2025-06-12
