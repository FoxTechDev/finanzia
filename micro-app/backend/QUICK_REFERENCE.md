# Guía Rápida - API de Ingresos y Gastos

## Ejecutar Migración

```bash
cd micro-app/backend
npm run migration:run
```

## Endpoints Principales

### Obtener Catálogos

```bash
# Tipos de gasto
curl http://localhost:3000/tipo-gasto/activos

# Tipos de ingreso
curl http://localhost:3000/tipo-ingreso/activos
```

### Crear Gasto para Cliente

```bash
curl -X POST http://localhost:3000/gasto-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoGastoId": 1,
    "monto": 350.00,
    "descripcion": "Alquiler mensual"
  }'
```

### Crear Ingreso para Cliente

```bash
curl -X POST http://localhost:3000/ingreso-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoIngresoId": 1,
    "monto": 1200.00,
    "descripcion": "Salario mensual"
  }'
```

### Consultar Gastos de un Cliente

```bash
# Todos los gastos
curl http://localhost:3000/gasto-cliente/persona/1

# Total de gastos
curl http://localhost:3000/gasto-cliente/persona/1/total
```

### Consultar Ingresos de un Cliente

```bash
# Todos los ingresos
curl http://localhost:3000/ingreso-cliente/persona/1

# Total de ingresos
curl http://localhost:3000/ingreso-cliente/persona/1/total
```

## Estructura de Datos

### TipoGasto / TipoIngreso
```json
{
  "id": 1,
  "nombre": "Vivienda",
  "descripcion": "Gastos de vivienda",
  "activo": true
}
```

### GastoCliente / IngresoCliente
```json
{
  "id": 1,
  "personaId": 1,
  "tipoGastoId": 1,
  "monto": 350.00,
  "descripcion": "Alquiler mensual"
}
```

## IDs de Catálogos por Defecto

### Tipos de Gasto
1. Vivienda
2. Alimentación
3. Transporte
4. Servicios Básicos
5. Educación
6. Gastos Médicos
7. Otros

### Tipos de Ingreso
1. Salario Principal
2. Ingresos Adicionales
3. Negocio Propio
4. Remesas
5. Alquileres
6. Otros

## Calcular Capacidad de Pago

```bash
# 1. Obtener total de ingresos
INGRESOS=$(curl -s http://localhost:3000/ingreso-cliente/persona/1/total)

# 2. Obtener total de gastos
GASTOS=$(curl -s http://localhost:3000/gasto-cliente/persona/1/total)

# 3. Calcular capacidad de pago = Ingresos - Gastos
echo "Ingresos: $INGRESOS"
echo "Gastos: $GASTOS"
echo "Capacidad de pago: $(echo "$INGRESOS - $GASTOS" | bc)"
```

## Respuestas HTTP

### Éxito
- `200 OK` - GET exitoso
- `201 Created` - POST exitoso
- `204 No Content` - DELETE exitoso

### Errores
- `404 Not Found` - Registro no encontrado
- `409 Conflict` - Conflicto (ej: nombre duplicado)
- `400 Bad Request` - Validación fallida

## Ejemplo Completo: Crear Cliente con Finanzas

```bash
# 1. Crear ingresos
curl -X POST http://localhost:3000/ingreso-cliente \
  -H "Content-Type: application/json" \
  -d '{"personaId": 1, "tipoIngresoId": 1, "monto": 1200.00, "descripcion": "Salario"}'

curl -X POST http://localhost:3000/ingreso-cliente \
  -H "Content-Type: application/json" \
  -d '{"personaId": 1, "tipoIngresoId": 3, "monto": 500.00, "descripcion": "Negocio"}'

# 2. Crear gastos
curl -X POST http://localhost:3000/gasto-cliente \
  -H "Content-Type: application/json" \
  -d '{"personaId": 1, "tipoGastoId": 1, "monto": 350.00, "descripcion": "Alquiler"}'

curl -X POST http://localhost:3000/gasto-cliente \
  -H "Content-Type: application/json" \
  -d '{"personaId": 1, "tipoGastoId": 2, "monto": 200.00, "descripcion": "Comida"}'

curl -X POST http://localhost:3000/gasto-cliente \
  -H "Content-Type: application/json" \
  -d '{"personaId": 1, "tipoGastoId": 3, "monto": 75.00, "descripcion": "Transporte"}'

# 3. Verificar totales
curl http://localhost:3000/ingreso-cliente/persona/1/total
# Output: 1700.00

curl http://localhost:3000/gasto-cliente/persona/1/total
# Output: 625.00

# Capacidad de pago: 1075.00
```

## Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm run build
```

### Error: "Table doesn't exist"
```bash
npm run migration:run
```

### Error: "Foreign key constraint fails"
Asegúrate de que:
1. El `personaId` existe en la tabla `persona`
2. El `tipoGastoId` o `tipoIngresoId` existe en los catálogos

### Ver logs de la aplicación
```bash
npm run start:dev
```

## Variables de Entorno Requeridas

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=finanzia_db
```

## Comandos Útiles

```bash
# Desarrollo con hot reload
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm test

# Ver todas las migraciones
npx typeorm migration:show -d src/config/typeorm.config.ts

# Crear nueva migración
npx typeorm migration:create src/database/migrations/NombreMigracion
```
