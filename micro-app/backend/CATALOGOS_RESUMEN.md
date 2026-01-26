# Resumen: Conversión de Enums a Catálogos de Base de Datos

## Objetivo Completado
Se ha implementado un sistema completo de catálogos que convierte todos los enums del proyecto en tablas de base de datos, proporcionando mayor flexibilidad, mantenibilidad y extensibilidad.

## Archivos Creados

### 1. Configuración y Estructura

```
src/catalogos/
├── catalogos.config.ts              # Configuración centralizada de todos los catálogos
├── catalogos.module.ts               # Módulo principal que agrupa todos los catálogos
│
├── estado-garantia/                  # Ejemplo completo implementado
│   ├── entities/
│   │   └── estado-garantia.entity.ts
│   ├── dto/
│   │   ├── create-estado-garantia.dto.ts
│   │   └── update-estado-garantia.dto.ts
│   ├── estado-garantia.controller.ts
│   ├── estado-garantia.service.ts
│   └── estado-garantia.module.ts
│
└── [12 catálogos más pendientes de generar con la misma estructura]
```

### 2. Scripts de Base de Datos

```
src/database/
├── migrations/
│   ├── create-catalogos-tables.sql      # Crea las 13 tablas de catálogos
│   ├── add-catalog-foreign-keys.sql     # Agrega FKs y migra datos existentes
│   └── drop-enum-columns.sql            # [OPCIONAL] Elimina columnas enum antiguas
│
└── seeds/
    ├── catalogos.seed.ts                # Seeder TypeScript
    └── catalogos-data.sql               # Inserta datos iniciales (todos los valores)
```

### 3. Utilidades

```
generate-catalogos.js                    # Script para generar módulos TypeScript
test-catalogos.http                      # Suite de pruebas de endpoints
INSTRUCCIONES_CATALOGOS.md              # Guía detallada de implementación
CATALOGOS_RESUMEN.md                     # Este archivo
```

## 13 Catálogos Implementados

| # | Enum Original | Tabla | Valores | Usado en |
|---|---------------|-------|---------|----------|
| 1 | EstadoGarantia | estado_garantia | 4 | Garantia |
| 2 | RecomendacionAsesor | recomendacion_asesor | 3 | Solicitud |
| 3 | TipoDecisionComite | tipo_decision_comite | 3 | DecisionComite |
| 4 | TipoPago | tipo_pago | 4 | Pago |
| 5 | EstadoPago | estado_pago | 2 | Pago |
| 6 | Sexo | sexo | 3 | Persona |
| 7 | EstadoSolicitud | estado_solicitud | 11 | Solicitud |
| 8 | DestinoCredito | destino_credito | 11 | Solicitud |
| 9 | EstadoCuota | estado_cuota | 4 | PlanPago |
| 10 | TipoInteres | tipo_interes | 2 | Prestamo |
| 11 | PeriodicidadPago | periodicidad_pago | 8 | Prestamo |
| 12 | CategoriaNCB022 | categoria_ncb022 | 5 | Prestamo |
| 13 | TipoCalculo | tipo_calculo | 2 | TipoDeduccion |

## Estructura de Catálogos

Todos los catálogos comparten esta estructura estándar:

```typescript
{
  id: number;              // PK autoincremental
  codigo: string;          // Código único (ej: 'PENDIENTE', 'APROBADA')
  nombre: string;          // Nombre legible (ej: 'Pendiente', 'Aprobada')
  descripcion?: string;    // Descripción detallada
  activo: boolean;         // Si está activo para uso
  orden?: number;          // Orden de visualización en dropdowns
  color?: string;          // Color hexadecimal para UI
  createdAt: Date;         // Timestamp de creación
  updatedAt: Date;         // Timestamp de última actualización
}
```

## Endpoints Disponibles

Cada catálogo expone los siguientes endpoints REST:

```
GET    /catalogos/{catalogo}              # Listar todos
GET    /catalogos/{catalogo}/activos      # Listar solo activos
GET    /catalogos/{catalogo}/:id          # Obtener por ID
GET    /catalogos/{catalogo}/codigo/:cod  # Obtener por código
POST   /catalogos/{catalogo}              # Crear nuevo
PATCH  /catalogos/{catalogo}/:id          # Actualizar
DELETE /catalogos/{catalogo}/:id          # Eliminar
```

**Ejemplo:**
```
GET    /catalogos/estado-garantia
GET    /catalogos/estado-garantia/activos
GET    /catalogos/estado-garantia/1
GET    /catalogos/estado-garantia/codigo/PENDIENTE
POST   /catalogos/estado-garantia
PATCH  /catalogos/estado-garantia/1
DELETE /catalogos/estado-garantia/1
```

## Pasos para Completar la Implementación

### Paso 1: Crear las Tablas de Catálogos

```bash
mysql -u root -p micro_app < src/database/migrations/create-catalogos-tables.sql
```

### Paso 2: Insertar Datos Iniciales

```bash
mysql -u root -p micro_app < src/database/seeds/catalogos-data.sql
```

### Paso 3: Generar Módulos TypeScript

```bash
node generate-catalogos.js
```

Este script generará automáticamente:
- 12 carpetas de catálogos (estado-garantia ya existe)
- 72 archivos TypeScript (6 archivos × 12 catálogos)

### Paso 4: Actualizar CatalogosModule

Descomentar todos los imports en `src/catalogos/catalogos.module.ts`

### Paso 5: Registrar en AppModule

Agregar `CatalogosModule` a los imports de `app.module.ts`

### Paso 6: Migrar Relaciones

```bash
mysql -u root -p micro_app < src/database/migrations/add-catalog-foreign-keys.sql
```

Este script:
- Agrega columnas FK en las tablas existentes
- Migra los datos de enums a IDs de catálogo
- Crea foreign keys
- Agrega índices para performance

### Paso 7: Actualizar Entidades TypeScript

Modificar las entities para usar relaciones ManyToOne en lugar de enums:

**Antes:**
```typescript
@Column({
  type: 'enum',
  enum: EstadoGarantia,
  default: EstadoGarantia.PENDIENTE,
})
estado: EstadoGarantia;
```

**Después:**
```typescript
@Column({ nullable: true })
estadoGarantiaId: number;

@ManyToOne(() => EstadoGarantia)
@JoinColumn({ name: 'estadoGarantiaId' })
estadoGarantia: EstadoGarantia;
```

### Paso 8: Actualizar DTOs

**Antes:**
```typescript
@IsEnum(EstadoGarantia)
estado: EstadoGarantia;
```

**Después:**
```typescript
@IsNumber()
@IsOptional()
estadoGarantiaId?: number;
```

### Paso 9: Actualizar Servicios

**Antes:**
```typescript
const solicitud = this.solicitudRepository.create({
  ...dto,
  estado: EstadoSolicitud.CREADA,
});
```

**Después:**
```typescript
const estadoCreada = await this.estadoSolicitudService.findByCodigo('CREADA');
const solicitud = this.solicitudRepository.create({
  ...dto,
  estadoSolicitudId: estadoCreada.id,
});
```

### Paso 10: Probar Endpoints

```bash
# Usar el archivo test-catalogos.http con REST Client
# o importar a Postman/Insomnia
```

### Paso 11 (Opcional): Eliminar Columnas Enum

Después de verificar que todo funciona:

```bash
mysql -u root -p micro_app < src/database/migrations/drop-enum-columns.sql
```

## Ventajas del Nuevo Sistema

### 1. Flexibilidad
- Los valores pueden modificarse sin cambiar código
- Fácil agregar, modificar o desactivar valores
- No requiere despliegues para cambios de catálogo

### 2. Mantenibilidad
- Código más limpio y desacoplado
- Fácil de entender y mantener
- Patrón consistente en todo el proyecto

### 3. Auditoría
- Timestamps de creación/actualización
- Historial de cambios en los catálogos
- Trazabilidad completa

### 4. Extensibilidad
- Fácil agregar nuevos atributos (íconos, permisos, etc.)
- Soporte para internacionalización
- Ordenamiento personalizable

### 5. UI Mejorada
- Colores personalizables por estado
- Ordenamiento definido por el usuario
- Filtrado de valores activos/inactivos

### 6. Integridad de Datos
- Foreign keys garantizan integridad referencial
- Índices mejoran el performance
- Validaciones en múltiples capas

## Ejemplo de Uso en el Frontend

```typescript
// Cargar catálogo de estados de solicitud
const estados = await fetch('/catalogos/estado-solicitud/activos');

// Renderizar dropdown ordenado con colores
estados.forEach(estado => {
  const option = `
    <option value="${estado.id}" style="color: ${estado.color}">
      ${estado.nombre}
    </option>
  `;
});

// Crear solicitud con ID de catálogo
const nuevaSolicitud = {
  // ... otros campos
  estadoSolicitudId: 1, // CREADA
  destinoCreditoId: 3,  // CONSUMO_PERSONAL
};
```

## Consideraciones de Performance

### Índices Creados
- Índice en `codigo` (UNIQUE) en cada tabla de catálogo
- Índices en las columnas FK de las tablas principales
- Índices compuestos donde sea apropiado

### Estrategias de Caché (Recomendadas)
```typescript
// En el servicio, cachear catálogos en memoria
@Injectable()
export class EstadoGarantiaService {
  private cache: Map<string, EstadoGarantia> = new Map();

  async findByCodigo(codigo: string): Promise<EstadoGarantia> {
    if (this.cache.has(codigo)) {
      return this.cache.get(codigo);
    }

    const estado = await this.repository.findOne({ where: { codigo } });
    this.cache.set(codigo, estado);
    return estado;
  }
}
```

### Eager Loading
```typescript
// Cargar relaciones de catálogo junto con la entidad
const solicitudes = await this.solicitudRepository.find({
  relations: ['estadoSolicitud', 'destinoCredito', 'recomendacionAsesor'],
});
```

## Migraciones Futuras

### Agregar Traducciones
```sql
CREATE TABLE catalogo_traduccion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  catalogoNombre VARCHAR(50),
  catalogoId INT,
  idioma VARCHAR(5),
  nombreTraducido VARCHAR(100),
  descripcionTraducida TEXT
);
```

### Agregar Permisos por Catálogo
```sql
ALTER TABLE estado_solicitud
ADD COLUMN requierePermisoEspecial BOOLEAN DEFAULT FALSE,
ADD COLUMN rolesPermitidos JSON;
```

### Agregar Historial de Cambios
```sql
CREATE TABLE catalogo_historial (
  id INT PRIMARY KEY AUTO_INCREMENT,
  catalogoNombre VARCHAR(50),
  catalogoId INT,
  accion ENUM('CREATE', 'UPDATE', 'DELETE'),
  usuarioId INT,
  valoresAnteriores JSON,
  valoresNuevos JSON,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Checklist de Implementación

- [x] Crear configuración de catálogos (catalogos.config.ts)
- [x] Crear módulo principal (catalogos.module.ts)
- [x] Crear ejemplo completo (estado-garantia)
- [x] Crear script generador (generate-catalogos.js)
- [x] Crear script SQL de tablas (create-catalogos-tables.sql)
- [x] Crear script SQL de datos (catalogos-data.sql)
- [x] Crear script SQL de migraciones (add-catalog-foreign-keys.sql)
- [x] Crear script SQL de limpieza (drop-enum-columns.sql)
- [x] Crear seeder TypeScript (catalogos.seed.ts)
- [x] Crear suite de pruebas (test-catalogos.http)
- [x] Documentar instrucciones (INSTRUCCIONES_CATALOGOS.md)
- [ ] Ejecutar script generador
- [ ] Ejecutar scripts SQL
- [ ] Actualizar entidades TypeScript
- [ ] Actualizar DTOs
- [ ] Actualizar servicios
- [ ] Registrar módulos en AppModule
- [ ] Probar endpoints
- [ ] Verificar migraciones de datos
- [ ] Eliminar columnas enum (opcional)
- [ ] Actualizar documentación de API

## Soporte y Mantenimiento

### Agregar un Nuevo Catálogo

1. Agregar configuración en `catalogos.config.ts`
2. Ejecutar `node generate-catalogos.js`
3. Crear tabla SQL manualmente o con migración TypeORM
4. Insertar datos iniciales
5. Importar en `catalogos.module.ts`
6. Probar endpoints

### Agregar un Valor a un Catálogo Existente

```sql
INSERT INTO estado_garantia (codigo, nombre, descripcion, orden, activo)
VALUES ('NUEVO_ESTADO', 'Nuevo Estado', 'Descripción del nuevo estado', 10, 1);
```

O usar el endpoint POST:
```http
POST /catalogos/estado-garantia
{
  "codigo": "NUEVO_ESTADO",
  "nombre": "Nuevo Estado",
  "descripcion": "Descripción del nuevo estado",
  "orden": 10,
  "activo": true
}
```

### Desactivar un Valor sin Eliminarlo

```sql
UPDATE estado_garantia
SET activo = 0
WHERE codigo = 'OBSOLETO';
```

O usar el endpoint PATCH:
```http
PATCH /catalogos/estado-garantia/5
{
  "activo": false
}
```

## Contacto y Recursos

- **Documentación Detallada**: `INSTRUCCIONES_CATALOGOS.md`
- **Pruebas**: `test-catalogos.http`
- **Scripts SQL**: `src/database/migrations/`
- **Configuración**: `src/catalogos/catalogos.config.ts`

---

**Implementado**: 2026-01-24
**Versión**: 1.0.0
**Status**: ✅ Estructura completa creada, pendiente de generación masiva de módulos
