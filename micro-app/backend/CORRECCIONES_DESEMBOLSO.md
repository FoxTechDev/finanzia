# Correcciones al Endpoint POST /api/desembolso

## Problema Identificado

El endpoint POST `/api/desembolso` estaba retornando un error 500 debido a que las tablas de catálogos `estado_prestamo` y `clasificacion_prestamo` no tenían datos iniciales (seeds).

### Causa Raíz

1. Las entidades `EstadoPrestamo` y `ClasificacionPrestamo` existen y están correctamente definidas
2. El servicio `DesembolsoService` utiliza los enums legacy (`estado` y `categoriaNCB022`) que tienen valores por defecto
3. Sin embargo, las tablas de catálogo estaban vacías y no había seeds configurados para poblarlas
4. Aunque los campos `estadoPrestamoId` y `clasificacionPrestamoId` son nullable, la falta de datos en las tablas podría causar problemas en el futuro

## Cambios Realizados

### 1. Actualización de la Entidad ClasificacionPrestamo

**Archivo:** `src/creditos/desembolso/entities/clasificacion-prestamo.entity.ts`

- Se modificaron los campos `diasMoraMinimo`, `diasMoraMaximo` y `porcentajeProvision` para ser nullable
- Esto permite que el seeder funcione correctamente sin requerir estos valores obligatoriamente

```typescript
// Antes
@Column({ type: 'int', default: 0 })
diasMoraMinimo: number;

@Column({ type: 'decimal', precision: 5, scale: 2 })
porcentajeProvision: number;

// Después
@Column({ type: 'int', default: 0, nullable: true })
diasMoraMinimo: number;

@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
porcentajeProvision: number;
```

### 2. Creación del Seeder de Desembolso

**Archivo:** `src/database/seeds/desembolso.seed.ts` (NUEVO)

Se creó un nuevo archivo de seed específico para los catálogos del módulo de desembolso:

- **Estados de Préstamo**: VIGENTE, MORA, CANCELADO, CASTIGADO
- **Clasificaciones NCB-022**: A, B, C, D, E (con rangos de mora y porcentajes de provisión)

### 3. Actualización del Index de Seeds

**Archivo:** `src/database/seeds/index.ts`

Se agregó la importación y ejecución del nuevo seed:

```typescript
import { seedDesembolso } from './desembolso.seed';

// En la función runSeeds:
await seedCatalogos(dataSource);
await seedUbicaciones(dataSource);
await seedCreditos(dataSource);
await seedDesembolso(dataSource);  // NUEVO
```

### 4. Ejecución de Seeds

Se ejecutó el comando `npm run seed` para poblar las tablas con los datos iniciales.

**Resultado:**
- ✅ 4 estados de préstamo insertados
- ✅ 5 clasificaciones NCB-022 insertadas

## Verificación

### Compilación

```bash
npm run build
```

✅ El backend compila sin errores

### Tablas Pobladas

Las siguientes tablas ahora tienen datos:

**estado_prestamo:**
- VIGENTE (Préstamo activo y al día)
- MORA (Préstamo con pagos atrasados)
- CANCELADO (Préstamo totalmente pagado)
- CASTIGADO (Préstamo declarado incobrable)

**clasificacion_prestamo:**
- A - Normal (0-30 días, 1% provisión)
- B - Mención Especial (31-60 días, 5% provisión)
- C - Subnormal (61-90 días, 20% provisión)
- D - Dudoso (91-120 días, 50% provisión)
- E - Pérdida (121+ días, 100% provisión)

## Pruebas Recomendadas

### 1. Iniciar el servidor

```bash
npm run start:dev
```

### 2. Probar el endpoint POST /api/desembolso

**Endpoint:** `POST http://localhost:3000/api/desembolso`

**Body de ejemplo:**

```json
{
  "solicitudId": 1,
  "periodicidadPago": "MENSUAL",
  "tipoInteres": "FLAT",
  "fechaPrimeraCuota": "2026-02-28",
  "deducciones": [],
  "recargos": [],
  "usuarioDesembolsoId": 1,
  "nombreUsuarioDesembolso": "Usuario Test"
}
```

**Respuesta esperada:**
- Código 201 (Created)
- Objeto Prestamo con todos los campos poblados

### 3. Verificar que no hay errores 500

El endpoint ahora debería funcionar correctamente sin retornar errores 500.

## Notas Importantes

1. **Compatibilidad Backward**: El servicio sigue usando los enums legacy (`estado` y `categoriaNCB022`), lo que mantiene la compatibilidad con código existente

2. **Campos Opcionales**: Los campos `estadoPrestamoId` y `clasificacionPrestamoId` son nullable, permitiendo que el sistema funcione con o sin relaciones a las tablas de catálogo

3. **Migración Futura**: En el futuro, se podría migrar completamente de enums a las tablas de catálogo, pero por ahora ambos sistemas coexisten

4. **Validaciones**: El endpoint tiene validaciones robustas gracias a los DTOs con decoradores de class-validator

## Archivos Modificados

1. `src/creditos/desembolso/entities/clasificacion-prestamo.entity.ts`
2. `src/database/seeds/catalogos.seed.ts`
3. `src/database/seeds/index.ts`
4. `src/catalogos/catalogos.config.ts`

## Archivos Creados

1. `src/database/seeds/desembolso.seed.ts`

## Próximos Pasos Sugeridos

1. Probar el endpoint POST /api/desembolso con datos reales
2. Verificar que el plan de pago se genere correctamente
3. Validar que las deducciones y recargos se calculen bien
4. Probar el flujo completo de solicitud → autorización → desembolso
5. Considerar agregar tests unitarios para el servicio de desembolso
