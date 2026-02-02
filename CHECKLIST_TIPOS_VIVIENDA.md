# Checklist de Implementación: Tipos de Vivienda

Usa este checklist para verificar que la implementación esté completa y funcionando correctamente.

## Preparación

- [ ] Leer `INSTRUCCIONES_TIPOS_VIVIENDA.md`
- [ ] Leer `RESUMEN_IMPLEMENTACION_TIPOS_VIVIENDA.md`
- [ ] Backup de la base de datos actual

## Backend - Configuración

- [ ] Verificar que existe el módulo `tipo-vivienda` en `src/tipo-vivienda/`
- [ ] Verificar que la entidad tiene campos `codigo` y `orden`
- [ ] Verificar que el DTO incluye validaciones para `codigo` y `orden`
- [ ] Verificar que el controlador tiene endpoint `toggle-activo`
- [ ] Verificar que el servicio tiene método `toggleActivo()`

## Backend - Base de Datos

- [ ] Ejecutar migración: `npm run migration:run`
- [ ] Verificar que columnas `codigo` y `orden` existen en `tipo_vivienda`
  ```sql
  DESCRIBE tipo_vivienda;
  ```
- [ ] Insertar datos iniciales: ejecutar `seed-tipos-vivienda.sql`
- [ ] Verificar que hay 5 tipos de vivienda predeterminados
  ```sql
  SELECT * FROM tipo_vivienda ORDER BY orden;
  ```

## Backend - Testing de Endpoints

- [ ] Iniciar servidor: `npm run start:dev`
- [ ] GET `/tipo-vivienda` - Debe retornar todos los tipos
- [ ] GET `/tipo-vivienda/activos` - Debe retornar solo activos
- [ ] GET `/tipo-vivienda/1` - Debe retornar tipo con ID 1
- [ ] POST `/tipo-vivienda` - Debe crear nuevo tipo
- [ ] PATCH `/tipo-vivienda/1` - Debe actualizar tipo
- [ ] PATCH `/tipo-vivienda/1/toggle-activo` - Debe cambiar estado
- [ ] DELETE `/tipo-vivienda/X` - Debe eliminar tipo (usar ID de prueba)

Puedes usar el archivo `test-tipos-vivienda.http` para estas pruebas.

## Frontend - Archivos

- [ ] Verificar que existe componente en `catalogos/components/tipos-vivienda/`
- [ ] Verificar que `cliente.model.ts` tiene interface `TipoVivienda`
- [ ] Verificar que `catalogos.service.ts` tiene método `getTiposVivienda()`
- [ ] Verificar que `catalogos.routes.ts` incluye ruta `tipos-vivienda`
- [ ] Verificar que `cliente-form.component.ts` tiene signal `tiposVivienda`
- [ ] Verificar que `cliente-form.component.html` usa `tipoViviendaId`

## Frontend - Testing de Vista de Administración

- [ ] Iniciar servidor: `npm start`
- [ ] Navegar a `http://localhost:4200/catalogos/tipos-vivienda`
- [ ] Verificar que la tabla muestra los 5 tipos predeterminados
- [ ] Verificar que hay columnas: ID, Código, Nombre, Descripción, Activo, Orden, Acciones
- [ ] Probar búsqueda: escribir en campo de filtro y verificar resultados
- [ ] Probar ordenamiento: hacer clic en headers de columnas
- [ ] Probar paginación: cambiar tamaño de página y navegar entre páginas

## Frontend - Testing de Formulario CRUD

### Crear Nuevo Tipo

- [ ] Hacer clic en botón "Agregar"
- [ ] Completar formulario:
  - Código: `HIPOTECADA`
  - Nombre: `Hipotecada`
  - Descripción: `Vivienda adquirida mediante hipoteca`
  - Activo: ✓
  - Orden: `25`
- [ ] Hacer clic en "Guardar"
- [ ] Verificar mensaje de éxito
- [ ] Verificar que aparece en la tabla

### Editar Tipo Existente

- [ ] Hacer clic en botón "Editar" de un registro
- [ ] Modificar descripción
- [ ] Guardar cambios
- [ ] Verificar mensaje de éxito
- [ ] Verificar que se actualizó en la tabla

### Activar/Desactivar

- [ ] Hacer clic en botón de toggle de estado
- [ ] Verificar mensaje de confirmación
- [ ] Verificar que cambia el estado visual (chip)

### Eliminar

- [ ] Hacer clic en botón "Eliminar" de un registro de prueba
- [ ] Confirmar en el diálogo
- [ ] Verificar mensaje de éxito
- [ ] Verificar que desaparece de la tabla

### Validaciones

- [ ] Intentar crear tipo sin código (debe mostrar error)
- [ ] Intentar crear tipo sin nombre (debe mostrar error)
- [ ] Intentar crear tipo con código duplicado (debe mostrar error de conflicto)
- [ ] Intentar crear tipo con nombre duplicado (debe mostrar error de conflicto)
- [ ] Intentar cerrar formulario con cambios sin guardar (debe pedir confirmación)

## Frontend - Testing de Integración con Formulario de Clientes

### Crear Nuevo Cliente

- [ ] Navegar a `http://localhost:4200/clientes/nuevo`
- [ ] Ir al paso "Dirección"
- [ ] Verificar que campo "Tipo de Vivienda" existe
- [ ] Hacer clic en selector
- [ ] Verificar que se muestran los tipos de vivienda cargados desde el backend
- [ ] Verificar que solo se muestran tipos activos
- [ ] Seleccionar un tipo
- [ ] Completar formulario y guardar
- [ ] Verificar que se guarda correctamente

### Editar Cliente Existente

- [ ] Navegar a edición de un cliente existente
- [ ] Ir al paso "Dirección"
- [ ] Verificar que el tipo de vivienda actual se muestra correctamente
- [ ] Cambiar tipo de vivienda
- [ ] Guardar cambios
- [ ] Verificar que se actualizó correctamente

## Migración de Datos Existentes (si aplica)

Si ya tienes clientes con datos en el sistema:

- [ ] Revisar script `migrate-existing-tipos-vivienda.sql`
- [ ] Ejecutar PASO 1: Ver distribución de valores actuales
- [ ] Ejecutar PASO 2: Ver tipos disponibles en catálogo
- [ ] Ejecutar PASO 4-5: Migrar datos automáticamente
- [ ] Ejecutar PASO 6: Verificar resultados de migración
- [ ] Ejecutar PASO 7: Ver detalles de mapeo
- [ ] Ejecutar PASO 8: Identificar registros no migrados
- [ ] Si todo está correcto, ejecutar PASO 9 (opcional): Limpiar campo string

## Verificación Final

### Backend

- [ ] No hay errores en consola del servidor
- [ ] Logs muestran respuestas exitosas
- [ ] Base de datos tiene datos consistentes

### Frontend

- [ ] No hay errores en consola del navegador
- [ ] No hay warnings de TypeScript
- [ ] Todas las llamadas HTTP retornan 200/201/204
- [ ] Navegación funciona correctamente
- [ ] Responsive design funciona en móvil/tablet/desktop

## Documentación

- [ ] Actualizar manual de usuario (si existe)
- [ ] Documentar proceso en wiki/confluence (si aplica)
- [ ] Agregar enlace en menú de navegación principal
- [ ] Actualizar diagramas de base de datos
- [ ] Crear video tutorial (opcional)

## Performance

- [ ] Carga de tipos de vivienda es rápida (< 1 segundo)
- [ ] Búsqueda en tabla responde instantáneamente
- [ ] No hay memory leaks (verificar en DevTools)
- [ ] Paginación funciona eficientemente con muchos registros

## Accesibilidad

- [ ] Navegación por teclado funciona correctamente
- [ ] Labels están asociados a inputs
- [ ] Mensajes de error son leídos por screen readers
- [ ] Contraste de colores es adecuado
- [ ] Áreas de toque son suficientemente grandes (44x44px)

## Seguridad

- [ ] Validaciones en backend previenen inyección SQL
- [ ] Validaciones en frontend previenen XSS
- [ ] Solo usuarios autorizados pueden acceder a catálogos (si aplica auth)
- [ ] Logs no exponen información sensible

## Deployment

- [ ] Código está en control de versiones (git)
- [ ] Migración está incluida en deployment script
- [ ] Seeds están documentados para ambientes de staging/producción
- [ ] Rollback plan está definido (si es necesario)
- [ ] Variables de entorno están configuradas

## Monitoreo Post-Deployment

- [ ] Verificar que migración se ejecutó correctamente en producción
- [ ] Verificar que datos se insertaron
- [ ] Monitorear errores en logs
- [ ] Verificar que usuarios pueden usar la funcionalidad
- [ ] Revisar métricas de performance

## Resolución de Problemas

### Error: "Tipo de vivienda no existe"
- Verificar que se ejecutó el seed de datos iniciales
- Verificar conectividad con base de datos

### Error: "Duplicate entry for key 'codigo'"
- El código ya existe, usar uno diferente
- Verificar que migración generó códigos únicos

### Frontend no carga tipos de vivienda
- Verificar que backend está corriendo
- Verificar endpoint en DevTools > Network
- Verificar CORS si backend está en diferente dominio

### Tipos de vivienda no aparecen en formulario
- Verificar que `loadCatalogos()` se llama en `ngOnInit()`
- Verificar que signal `tiposVivienda` tiene datos
- Verificar template HTML usa `tiposVivienda()` correctamente

## Notas Adicionales

- Este checklist debe ejecutarse en ambiente de desarrollo primero
- Luego repetir en ambiente de staging
- Finalmente ejecutar en producción
- Documentar cualquier problema encontrado
- Actualizar checklist basado en lecciones aprendidas

## Sign-off

- [ ] Desarrollador verificó funcionalidad
- [ ] QA aprobó pruebas
- [ ] Product Owner revisó funcionalidad
- [ ] DevOps aprobó deployment
- [ ] Documentación actualizada

---

**Fecha de verificación:** _______________

**Verificado por:** _______________

**Ambiente:** [ ] Desarrollo [ ] Staging [ ] Producción

**Resultado:** [ ] Aprobado [ ] Requiere correcciones

**Notas:**
