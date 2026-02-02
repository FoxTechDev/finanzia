# Configuración de Tipos de Vivienda

Este documento describe los cambios realizados para implementar el catálogo de Tipos de Vivienda en el sistema.

## Cambios Realizados

### Backend

1. **Actualización de Entidad** (`tipo-vivienda.entity.ts`):
   - Agregado campo `codigo` (string, único)
   - Agregado campo `orden` (number, opcional)
   - Estos campos son necesarios para compatibilidad con el sistema genérico de catálogos

2. **Actualización de DTO** (`create-tipo-vivienda.dto.ts`):
   - Agregado validación para `codigo` (requerido, máximo 50 caracteres)
   - Agregado validación para `orden` (opcional, número >= 0)

3. **Migración de Base de Datos**:
   - Archivo: `src/database/migrations/1770100000000-AddCodigoOrdenToTipoVivienda.ts`
   - Agrega columnas `codigo` y `orden` a la tabla `tipo_vivienda`
   - Genera códigos automáticos para registros existentes

4. **Script de Semilla**:
   - Archivo: `seed-tipos-vivienda.sql`
   - Inserta 5 tipos de vivienda predeterminados si la tabla está vacía

### Frontend

1. **Modelo de Datos** (`cliente.model.ts`):
   - Agregada interface `TipoVivienda`
   - Actualizada interface `Direccion` para incluir:
     - `tipoViviendaId` (number) - nueva relación con el catálogo
     - `tipoVivienda` (string) - mantener compatibilidad con datos antiguos
     - `tipoViviendaRelacion` - relación con el objeto TipoVivienda

2. **Servicio de Catálogos** (`catalogos.service.ts`):
   - Agregado método `getTiposVivienda(soloActivos = true)`

3. **Componente de Administración**:
   - Archivo: `catalogos/components/tipos-vivienda/tipos-vivienda.component.ts`
   - Utiliza el componente genérico `CatalogoListaComponent`
   - Proporciona CRUD completo para tipos de vivienda

4. **Rutas**:
   - Agregada ruta `/catalogos/tipos-vivienda` en `catalogos.routes.ts`

5. **Formulario de Clientes** (`cliente-form.component.ts`):
   - Agregado signal `tiposVivienda` para almacenar los tipos cargados
   - Eliminado array estático `tipoViviendaOptions`
   - Carga tipos de vivienda desde el backend en `loadCatalogos()`
   - Cambiado campo del formulario de `tipoVivienda` a `tipoViviendaId`
   - Actualizado HTML para mostrar select con datos del backend

## Instrucciones de Instalación

### 1. Ejecutar Migración de Base de Datos

```bash
cd micro-app/backend
npm run migration:run
```

### 2. Insertar Datos Iniciales (Opcional)

Si la tabla `tipo_vivienda` está vacía, ejecuta el script de semilla:

```bash
# Desde MySQL client o MySQL Workbench
mysql -u usuario -p nombre_base_datos < seed-tipos-vivienda.sql
```

O ejecuta el SQL directamente en tu cliente de base de datos preferido.

### 3. Verificar Backend

Inicia el servidor backend y verifica que los endpoints funcionen:

```bash
cd micro-app/backend
npm run start:dev
```

Prueba los endpoints:
- GET `http://localhost:3000/tipo-vivienda` - Listar todos
- GET `http://localhost:3000/tipo-vivienda/activos` - Listar solo activos
- POST `http://localhost:3000/tipo-vivienda` - Crear nuevo
- PATCH `http://localhost:3000/tipo-vivienda/:id` - Actualizar
- DELETE `http://localhost:3000/tipo-vivienda/:id` - Eliminar

### 4. Verificar Frontend

Inicia el servidor frontend:

```bash
cd micro-app/frontend
npm start
```

Accede a:
- **Administración de Tipos de Vivienda**: `http://localhost:4200/catalogos/tipos-vivienda`
- **Formulario de Cliente**: Verifica que el campo "Tipo de Vivienda" cargue los datos del catálogo

## Características del Catálogo

### Vista de Administración

La vista de administración en `/catalogos/tipos-vivienda` proporciona:

- **Tabla con columnas**:
  - ID
  - Código
  - Nombre
  - Descripción
  - Activo (estado)
  - Orden
  - Acciones (Editar/Eliminar/Activar-Desactivar)

- **Funcionalidades**:
  - Búsqueda en tiempo real por código, nombre o descripción
  - Ordenamiento por cualquier columna
  - Paginación configurable (5, 10, 25, 50 registros)
  - Agregar nuevo tipo de vivienda
  - Editar tipos existentes
  - Activar/Desactivar tipos
  - Eliminar tipos (con confirmación)

### Formulario de Creación/Edición

El diálogo de formulario incluye:

- **Código** (requerido, máximo 50 caracteres)
- **Nombre** (requerido, máximo 100 caracteres)
- **Descripción** (opcional, máximo 500 caracteres)
- **Activo** (checkbox, por defecto true)
- **Orden** (opcional, número entre 0 y 9999)

### Validaciones

- Código y nombre son únicos en la base de datos
- Validaciones en tiempo real con mensajes de error específicos
- Confirmación antes de descartar cambios
- Feedback visual de estados (loading, error, éxito)

## Integración con Formulario de Clientes

El formulario de clientes ahora:

1. **Carga tipos de vivienda** automáticamente desde el backend al inicializar
2. **Muestra solo tipos activos** en el selector
3. **Envía `tipoViviendaId`** (número) en lugar de string al backend
4. **Incluye hint contextual** para guiar al usuario
5. **Valida** que se seleccione un tipo antes de guardar

## Datos Predeterminados

El script de semilla crea estos tipos de vivienda:

| Código     | Nombre     | Descripción                             | Orden |
|------------|------------|-----------------------------------------|-------|
| PROPIA     | Propia     | Vivienda de propiedad del cliente      | 10    |
| ALQUILADA  | Alquilada  | Vivienda alquilada por el cliente      | 20    |
| FAMILIAR   | Familiar   | Vivienda proporcionada por familiares  | 30    |
| PRESTADA   | Prestada   | Vivienda prestada temporalmente        | 40    |
| OTRA       | Otra       | Otro tipo de vivienda no especificado  | 50    |

## Notas de Compatibilidad

### Migración de Datos Existentes

Si ya tienes clientes con el campo `tipoVivienda` como string:

1. Los datos existentes se mantendrán en el campo `tipoVivienda` (string)
2. Nuevos registros usarán `tipoViviendaId` (number)
3. Considera crear un script de migración de datos para convertir strings existentes a IDs

### Script de Migración de Datos (Opcional)

```sql
-- Ejemplo: Convertir tipos de vivienda de string a ID
UPDATE direccion d
INNER JOIN tipo_vivienda tv ON LOWER(d.tipoVivienda) = LOWER(tv.nombre)
SET d.tipoViviendaId = tv.id
WHERE d.tipoVivienda IS NOT NULL
  AND d.tipoViviendaId IS NULL;
```

## Próximos Pasos

1. **Agregar al menú de navegación**: Incluir enlace a "Tipos de Vivienda" en el menú de catálogos
2. **Migrar datos existentes**: Ejecutar script de conversión de strings a IDs si es necesario
3. **Actualizar vistas de listado**: Mostrar nombre del tipo de vivienda en lugar de ID en las tablas de clientes
4. **Documentación de usuario**: Crear manual de uso para el catálogo de tipos de vivienda

## Soporte

Para cualquier problema o pregunta sobre esta funcionalidad, consulta la documentación técnica o contacta al equipo de desarrollo.
