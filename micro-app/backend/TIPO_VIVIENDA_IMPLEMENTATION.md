# Implementación del Módulo Tipo Vivienda

## Resumen

Este documento describe la implementación completa del módulo de tipos de vivienda, que reemplaza el enum `TipoVivienda` por una tabla en la base de datos con un CRUD completo.

## Cambios Realizados

### 1. Nuevo Módulo: TipoVivienda

#### Estructura de Archivos

```
src/tipo-vivienda/
├── entities/
│   └── tipo-vivienda.entity.ts
├── dto/
│   ├── create-tipo-vivienda.dto.ts
│   └── update-tipo-vivienda.dto.ts
├── tipo-vivienda.controller.ts
├── tipo-vivienda.service.ts
└── tipo-vivienda.module.ts
```

#### Entidad TipoVivienda

**Archivo:** `src/tipo-vivienda/entities/tipo-vivienda.entity.ts`

```typescript
@Entity('tipo_vivienda')
export class TipoVivienda {
  @PrimaryGeneratedColumn({ name: 'idTipoVivienda' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Direccion, (direccion) => direccion.tipoVivienda)
  direcciones: Direccion[];
}
```

#### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/tipo-vivienda` | Crear nuevo tipo de vivienda |
| GET | `/api/tipo-vivienda` | Obtener todos los tipos |
| GET | `/api/tipo-vivienda/activos` | Obtener solo tipos activos |
| GET | `/api/tipo-vivienda/:id` | Obtener un tipo específico |
| PATCH | `/api/tipo-vivienda/:id` | Actualizar un tipo |
| DELETE | `/api/tipo-vivienda/:id` | Eliminar un tipo |

### 2. Modificaciones en la Entidad Direccion

#### Antes (usando enum)

```typescript
export enum TipoVivienda {
  PROPIA = 'Propia',
  ALQUILADA = 'Alquilada',
  FAMILIAR = 'Familiar',
  PRESTADA = 'Prestada',
  OTRA = 'Otra',
}

@Column({
  name: 'tipoVivienda',
  type: 'enum',
  enum: TipoVivienda,
  nullable: true,
})
tipoVivienda: TipoVivienda;
```

#### Después (usando relación)

```typescript
@ManyToOne(() => TipoVivienda, (tipoVivienda) => tipoVivienda.direcciones, { nullable: true })
@JoinColumn({ name: 'idTipoVivienda' })
tipoVivienda: TipoVivienda;

@Column({ name: 'idTipoVivienda', nullable: true })
tipoViviendaId: number;
```

### 3. Modificaciones en CreateDireccionDto

#### Antes

```typescript
@IsOptional()
@IsEnum(TipoVivienda)
tipoVivienda?: TipoVivienda;
```

#### Después

```typescript
@IsOptional()
@IsNumber()
tipoViviendaId?: number;
```

### 4. Registro en AppModule

El módulo `TipoViviendaModule` fue agregado a los imports de `AppModule`.

## Migración de Datos

### Opción 1: TypeORM Migration

Se creó una migración de TypeORM en:
- **Archivo:** `src/database/migrations/1770100000000-AddTipoViviendaTable.ts`

Para ejecutar:
```bash
npm run migration:run
```

Para revertir:
```bash
npm run migration:revert
```

### Opción 2: Script SQL Manual

Se creó un script SQL para ejecutar manualmente en:
- **Archivo:** `migracion-tipo-vivienda.sql`

#### Pasos de la migración:

1. Crear tabla `tipo_vivienda`
2. Insertar datos iniciales (Propia, Alquilada, Familiar, Prestada, Otra)
3. Agregar columna `idTipoVivienda` a `direccion`
4. Migrar datos del enum a la nueva columna
5. Crear foreign key
6. Verificar migración
7. Eliminar columna enum antigua

#### Para ejecutar el script:

```bash
mysql -u usuario -p nombre_base_datos < migracion-tipo-vivienda.sql
```

## Datos Iniciales

La migración inserta automáticamente los siguientes tipos de vivienda:

| ID | Nombre | Descripción | Activo |
|----|--------|-------------|--------|
| 1 | Propia | Vivienda en propiedad | true |
| 2 | Alquilada | Vivienda en alquiler | true |
| 3 | Familiar | Vivienda familiar | true |
| 4 | Prestada | Vivienda prestada | true |
| 5 | Otra | Otro tipo de vivienda | true |

## Validaciones Implementadas

### En el Servicio

- **Duplicados:** No permite crear tipos de vivienda con nombres duplicados
- **Existencia:** Valida que el tipo exista antes de actualizar o eliminar
- **Conflictos:** Detecta conflictos al actualizar nombres

### En los DTOs

- **CreateTipoViviendaDto:**
  - `nombre`: string, requerido, máximo 100 caracteres
  - `descripcion`: string, opcional
  - `activo`: boolean, opcional

- **CreateDireccionDto:**
  - `tipoViviendaId`: number, opcional

## Uso en el Frontend

### Obtener tipos de vivienda activos

```typescript
// En el servicio de catálogos
getTiposVivienda(): Observable<TipoVivienda[]> {
  return this.http.get<TipoVivienda[]>(`${API_URL}/tipo-vivienda/activos`);
}
```

### Ejemplo de uso en formulario

```typescript
tiposVivienda: TipoVivienda[] = [];

ngOnInit() {
  this.catalogosService.getTiposVivienda().subscribe(tipos => {
    this.tiposVivienda = tipos;
  });
}

// En el formulario
<select formControlName="tipoViviendaId">
  <option [value]="null">Seleccione un tipo</option>
  <option *ngFor="let tipo of tiposVivienda" [value]="tipo.id">
    {{ tipo.nombre }}
  </option>
</select>
```

## Ventajas de este Cambio

1. **Flexibilidad:** Permite agregar/modificar tipos de vivienda sin cambiar código
2. **Internacionalización:** Facilita la traducción de tipos de vivienda
3. **Auditoría:** Permite activar/desactivar tipos sin eliminarlos
4. **Extensibilidad:** Fácil agregar campos adicionales (ej: icono, orden, categoría)
5. **Consistencia:** Sigue el mismo patrón que tipo_ingreso y tipo_gasto

## Retrocompatibilidad

La migración mantiene la compatibilidad con datos existentes:
- Mapea automáticamente los valores del enum anterior a los IDs de la nueva tabla
- Preserva todos los datos existentes
- Incluye un script de rollback en caso de necesidad

## Testing

### Endpoints a probar

1. **Crear tipo de vivienda:**
```bash
curl -X POST http://localhost:3000/api/tipo-vivienda \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Compartida", "descripcion": "Vivienda compartida"}'
```

2. **Listar tipos activos:**
```bash
curl http://localhost:3000/api/tipo-vivienda/activos
```

3. **Crear dirección con tipo de vivienda:**
```bash
curl -X POST http://localhost:3000/api/direccion \
  -H "Content-Type: application/json" \
  -d '{
    "departamentoId": 1,
    "municipioId": 1,
    "distritoId": 1,
    "tipoViviendaId": 1,
    "tiempoResidenciaAnios": 5
  }'
```

## Próximos Pasos

1. Ejecutar la migración en desarrollo
2. Probar los endpoints del nuevo módulo
3. Actualizar el frontend para usar `tipoViviendaId` en lugar del enum
4. Actualizar componentes de formularios de cliente
5. Ejecutar la migración en producción
6. Actualizar documentación de API

## Notas Importantes

- El campo `tipoViviendaId` es nullable (opcional) en direcciones
- Los tipos de vivienda no se eliminan físicamente, se desactivan con el campo `activo`
- La relación usa `ON DELETE SET NULL` para evitar inconsistencias
- El script SQL incluye verificación antes de eliminar la columna enum antigua
