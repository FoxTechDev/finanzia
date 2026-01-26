# Sistema de Catálogos - Guía Rápida

> Conversión de Enums a Tablas de Catálogo en Base de Datos

## Inicio Rápido

### Opción 1: Automática (Recomendada) ⚡

```bash
# Ejecutar script de configuración automática
setup-catalogos.bat
```

Este script ejecutará automáticamente:
1. Generación de 72 archivos TypeScript
2. Creación de 13 tablas en la base de datos
3. Inserción de 57 valores iniciales
4. Migración de datos existentes
5. Compilación del proyecto

### Opción 2: Manual 🔧

```bash
# 1. Generar módulos TypeScript
node generate-catalogos.js

# 2. Crear tablas
mysql -u root -p micro_app < src/database/migrations/create-catalogos-tables.sql

# 3. Insertar datos
mysql -u root -p micro_app < src/database/seeds/catalogos-data.sql

# 4. Migrar relaciones
mysql -u root -p micro_app < src/database/migrations/add-catalog-foreign-keys.sql

# 5. Verificar
mysql -u root -p micro_app < verify-catalogos.sql

# 6. Compilar
npm run build
```

---

## ¿Qué es este Sistema?

Este sistema convierte **13 enums** del proyecto en **tablas de catálogo dinámicas** en la base de datos.

### Antes (Enum) ❌

```typescript
export enum EstadoGarantia {
  PENDIENTE = 'PENDIENTE',
  CONSTITUIDA = 'CONSTITUIDA',
  LIBERADA = 'LIBERADA',
  EJECUTADA = 'EJECUTADA',
}
```

### Después (Tabla de Catálogo) ✅

```sql
CREATE TABLE estado_garantia (
  id INT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  nombre VARCHAR(100),
  descripcion TEXT,
  activo BOOLEAN,
  orden INT,
  color VARCHAR(7)
);
```

```typescript
@Entity('estado_garantia')
export class EstadoGarantia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
  color?: string;
}
```

---

## 13 Catálogos Implementados

| # | Catálogo | Valores | Usado en |
|---|----------|---------|----------|
| 1 | Estado de Garantía | 4 | Garantía |
| 2 | Recomendación de Asesor | 3 | Solicitud |
| 3 | Tipo Decisión Comité | 3 | Decisión Comité |
| 4 | Tipo de Pago | 4 | Pago |
| 5 | Estado de Pago | 2 | Pago |
| 6 | Sexo | 3 | Persona |
| 7 | Estado de Solicitud | 11 | Solicitud |
| 8 | Destino de Crédito | 11 | Solicitud |
| 9 | Estado de Cuota | 4 | Plan de Pago |
| 10 | Tipo de Interés | 2 | Préstamo |
| 11 | Periodicidad de Pago | 8 | Préstamo |
| 12 | Categoría NCB-022 | 5 | Préstamo |
| 13 | Tipo de Cálculo | 2 | Tipo Deducción |

**Total:** 57 valores precargados

---

## Endpoints Disponibles

Cada catálogo expone endpoints REST:

```http
GET    /catalogos/estado-garantia          # Listar todos
GET    /catalogos/estado-garantia/activos  # Solo activos
GET    /catalogos/estado-garantia/:id      # Por ID
GET    /catalogos/estado-garantia/codigo/PENDIENTE  # Por código
POST   /catalogos/estado-garantia          # Crear
PATCH  /catalogos/estado-garantia/:id      # Actualizar
DELETE /catalogos/estado-garantia/:id      # Eliminar
```

📝 Ver `test-catalogos.http` para ejemplos completos

---

## Ejemplo de Uso en Código

### Crear una Solicitud con Catálogos

```typescript
// solicitud.service.ts
async create(dto: CreateSolicitudDto): Promise<Solicitud> {
  // Obtener estado por código
  const estado = await this.estadoSolicitudService.findByCodigo('CREADA');

  const solicitud = this.solicitudRepository.create({
    ...dto,
    estadoSolicitudId: estado.id,
    fechaSolicitud: new Date(),
  });

  return await this.solicitudRepository.save(solicitud);
}
```

### Consultar con Relaciones

```typescript
const solicitudes = await this.solicitudRepository.find({
  relations: [
    'estadoSolicitud',
    'destinoCredito',
    'recomendacionAsesor'
  ],
});

// Resultado incluye datos del catálogo:
{
  id: 1,
  numeroSolicitud: 'SOL2026000001',
  estadoSolicitud: {
    id: 1,
    codigo: 'CREADA',
    nombre: 'Creada',
    color: '#6C757D',
  },
  // ...
}
```

---

## Ventajas del Sistema

### 🔧 Flexibilidad
- Modificar valores sin cambiar código
- Agregar nuevos valores dinámicamente
- No requiere despliegues

### 🎨 UI Mejorada
- Colores personalizables
- Ordenamiento configurable
- Filtrado por activo/inactivo

### 📊 Auditoría
- Timestamps de cambios
- Trazabilidad completa

### 🌐 Extensibilidad
- Fácil agregar traducciones
- Campos personalizables
- Listo para i18n

### ⚡ Performance
- Índices optimizados
- Cacheable
- Eager loading

---

## Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| `README_CATALOGOS.md` | Este archivo - Guía rápida |
| `CATALOGOS_RESUMEN.md` | Resumen ejecutivo completo |
| `INSTRUCCIONES_CATALOGOS.md` | Guía paso a paso detallada |
| `EJEMPLOS_USO_CATALOGOS.md` | Ejemplos de código en contexto |
| `ARCHIVOS_CREADOS_CATALOGOS.md` | Índice de todos los archivos |

---

## Verificación

Después de ejecutar los scripts, verificar con:

```bash
mysql -u root -p micro_app < verify-catalogos.sql
```

Este script verifica:
- ✅ 13 tablas creadas
- ✅ 57 registros insertados
- ✅ Códigos únicos
- ✅ Foreign keys creadas
- ✅ Índices agregados
- ✅ Datos migrados correctamente

---

## Estructura de Archivos

```
backend/
├── src/
│   ├── catalogos/
│   │   ├── catalogos.config.ts
│   │   ├── catalogos.module.ts
│   │   ├── estado-garantia/  ✅ (completo)
│   │   └── [12 más por generar]
│   │
│   └── database/
│       ├── migrations/
│       │   ├── create-catalogos-tables.sql
│       │   ├── add-catalog-foreign-keys.sql
│       │   └── drop-enum-columns.sql
│       └── seeds/
│           ├── catalogos.seed.ts
│           └── catalogos-data.sql
│
├── generate-catalogos.js
├── setup-catalogos.bat
├── verify-catalogos.sql
├── test-catalogos.http
└── Documentación (5 archivos .md)
```

---

## Pasos Siguientes

### 1. Ejecutar Implementación ✅
```bash
setup-catalogos.bat
```

### 2. Actualizar Entidades 🔄

Modificar las entidades existentes para usar relaciones ManyToOne:

```typescript
// Antes
@Column({ type: 'enum', enum: EstadoGarantia })
estado: EstadoGarantia;

// Después
@Column()
estadoGarantiaId: number;

@ManyToOne(() => EstadoGarantia)
@JoinColumn({ name: 'estadoGarantiaId' })
estadoGarantia: EstadoGarantia;
```

Ver `INSTRUCCIONES_CATALOGOS.md` sección 5 para detalles.

### 3. Actualizar Servicios 🔄

```typescript
// Antes
const solicitud = { ...dto, estado: EstadoSolicitud.CREADA };

// Después
const estado = await this.estadoSolicitudService.findByCodigo('CREADA');
const solicitud = { ...dto, estadoSolicitudId: estado.id };
```

### 4. Registrar Módulos 📦

En `app.module.ts`:

```typescript
import { CatalogosModule } from './catalogos/catalogos.module';

@Module({
  imports: [
    // ... otros imports
    CatalogosModule,
  ],
})
export class AppModule {}
```

### 5. Probar 🧪

```bash
npm run start:dev
```

Usar `test-catalogos.http` para probar todos los endpoints.

---

## Troubleshooting

### Error: Tabla ya existe
```bash
# Eliminar tablas y recrear
DROP TABLE estado_garantia;  # Para cada tabla
# Luego ejecutar create-catalogos-tables.sql
```

### Error: Módulo no encontrado
```bash
# Asegurarse de ejecutar el generador
node generate-catalogos.js
```

### Error: FK constraint fails
```bash
# Verificar que las tablas de catálogo tengan datos
mysql> SELECT COUNT(*) FROM estado_garantia;
```

### Error de compilación TypeScript
- Verificar imports en las entidades actualizadas
- Asegurar que CatalogosModule esté importado

---

## Comandos Útiles

```bash
# Ver catálogos disponibles
npm run catalogos:list

# Agregar valor a un catálogo
npm run catalogos:add estado-garantia NUEVO_ESTADO "Nuevo Estado"

# Verificar integridad
npm run catalogos:verify

# Compilar proyecto
npm run build

# Iniciar desarrollo
npm run start:dev

# Ejecutar tests
npm run test
```

---

## Soporte

### Documentación
- **Inicio Rápido:** README_CATALOGOS.md (este archivo)
- **Guía Completa:** INSTRUCCIONES_CATALOGOS.md
- **Ejemplos:** EJEMPLOS_USO_CATALOGOS.md
- **Referencia:** CATALOGOS_RESUMEN.md

### Scripts
- **Generador:** `generate-catalogos.js`
- **Automatización:** `setup-catalogos.bat`
- **Verificación:** `verify-catalogos.sql`
- **Pruebas:** `test-catalogos.http`

### Base de Datos
- **Crear Tablas:** `create-catalogos-tables.sql`
- **Datos Iniciales:** `catalogos-data.sql`
- **Migraciones:** `add-catalog-foreign-keys.sql`
- **Limpieza:** `drop-enum-columns.sql` (opcional)

---

## Checklist de Implementación

- [ ] Ejecutar `setup-catalogos.bat` o scripts manuales
- [ ] Verificar con `verify-catalogos.sql`
- [ ] Actualizar 8 entidades para usar ManyToOne
- [ ] Actualizar DTOs (cambiar enum por number)
- [ ] Actualizar servicios (usar findByCodigo)
- [ ] Importar CatalogosModule en AppModule
- [ ] Compilar sin errores
- [ ] Probar endpoints con test-catalogos.http
- [ ] Verificar relaciones en queries
- [ ] Ejecutar tests
- [ ] [Opcional] Eliminar columnas enum con drop-enum-columns.sql

---

## Estado del Proyecto

### ✅ Completado
- [x] Configuración de 13 catálogos
- [x] Scripts SQL (crear, poblar, migrar)
- [x] Generador de módulos TypeScript
- [x] Módulo ejemplo completo (estado-garantia)
- [x] Documentación completa (5 archivos)
- [x] Scripts de automatización
- [x] Suite de pruebas HTTP

### ⏳ Pendiente
- [ ] Ejecutar generador (crea 72 archivos)
- [ ] Ejecutar scripts SQL
- [ ] Actualizar entidades existentes
- [ ] Actualizar servicios
- [ ] Pruebas integradas

### 📊 Progreso
**Infraestructura:** 100% ✅
**Código Base:** 10% ⏳ (1 de 13 catálogos completo)
**Migración:** 0% ⏳ (pendiente ejecutar scripts)
**Testing:** 0% ⏳ (scripts listos, falta ejecutar)

---

## Próxima Acción Recomendada

```bash
# Ejecutar esto ahora:
setup-catalogos.bat

# Luego verificar:
mysql -u root -p micro_app < verify-catalogos.sql

# Finalmente compilar:
npm run build
```

---

**Versión:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** NestJS Backend Architect
**Proyecto:** micro-app-backend
**Status:** ✅ Listo para ejecutar
