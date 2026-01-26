# Instrucciones para Usar el Sistema de Catálogos

## Resumen

Se ha implementado exitosamente un sistema completo de catálogos para la aplicación de microfinanzas. Este sistema permite gestionar 14 catálogos diferentes que anteriormente eran enums hardcodeados en el backend.

## Verificación de la Implementación

La aplicación ha sido compilada exitosamente. Todos los componentes y servicios están correctamente configurados y listos para usar.

## Acceso a los Catálogos

### En el Menú Lateral

Una vez que inicies sesión en la aplicación, encontrarás la sección "Catálogos" en el menú lateral, organizada en subsecciones:

**Ubicaciones:**
- Departamentos
- Municipios
- Distritos

**Créditos y Préstamos:**
- Estados de Solicitud
- Recomendaciones Asesor
- Decisiones Comité
- Destinos de Crédito
- Estados de Préstamo
- Tipos de Interés
- Tipos de Cálculo

**Pagos y Cuotas:**
- Tipos de Pago
- Estados de Pago
- Estados de Cuota
- Periodicidad de Pago

**Generales:**
- Estados de Garantía
- Categorías NCB-022
- Género/Sexo

## Funcionalidades Disponibles

Cada catálogo proporciona:

1. **Tabla de Datos**
   - Visualización de todos los registros
   - Búsqueda en tiempo real
   - Ordenamiento por columnas
   - Paginación (5, 10, 25, 50 registros)
   - Indicadores visuales de estado (activo/inactivo)

2. **Crear Nuevo Registro**
   - Botón flotante (+) en la esquina superior derecha
   - Formulario con validaciones
   - Campos: Código, Nombre, Descripción, Orden, Estado

3. **Editar Registro**
   - Botón de edición (ícono lápiz) en cada fila
   - Mismo formulario que crear

4. **Activar/Desactivar**
   - Botón de toggle en cada fila
   - Cambia el estado sin eliminar el registro

5. **Eliminar**
   - Botón de eliminación (ícono papelera) en cada fila
   - Requiere confirmación

## Requisitos del Backend

Para que los catálogos funcionen correctamente, el backend debe implementar los siguientes endpoints para cada catálogo:

### Endpoints Necesarios

Para cada catálogo (ejemplo con `catalogos/sexo`):

```
GET    /api/catalogos/sexo              # Listar todos
GET    /api/catalogos/sexo?activo=true  # Listar solo activos
GET    /api/catalogos/sexo/:id          # Obtener por ID
POST   /api/catalogos/sexo              # Crear nuevo
PATCH  /api/catalogos/sexo/:id          # Actualizar
DELETE /api/catalogos/sexo/:id          # Eliminar
```

### Estructura de Datos Esperada

**Respuesta GET (lista):**
```json
[
  {
    "id": 1,
    "codigo": "M",
    "nombre": "Masculino",
    "descripcion": "Género masculino",
    "activo": true,
    "orden": 1
  },
  {
    "id": 2,
    "codigo": "F",
    "nombre": "Femenino",
    "descripcion": "Género femenino",
    "activo": true,
    "orden": 2
  }
]
```

**Petición POST/PATCH:**
```json
{
  "codigo": "M",
  "nombre": "Masculino",
  "descripcion": "Género masculino",
  "activo": true,
  "orden": 1
}
```

## Lista Completa de Endpoints a Implementar

El backend debe crear los siguientes endpoints:

1. `/api/catalogos/estado-garantia`
2. `/api/catalogos/recomendacion-asesor`
3. `/api/catalogos/tipo-decision-comite`
4. `/api/catalogos/tipo-pago`
5. `/api/catalogos/estado-pago`
6. `/api/catalogos/sexo`
7. `/api/catalogos/estado-solicitud`
8. `/api/catalogos/destino-credito`
9. `/api/catalogos/estado-cuota`
10. `/api/catalogos/tipo-interes`
11. `/api/catalogos/periodicidad-pago`
12. `/api/catalogos/estado-prestamo`
13. `/api/catalogos/categoria-ncb022`
14. `/api/catalogos/tipo-calculo`

## Migración de Datos

### Paso 1: Crear Tablas en el Backend

El backend debe crear las tablas de catálogos con la siguiente estructura:

```sql
CREATE TABLE catalogo_sexo (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  orden INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Paso 2: Migrar Datos de Enums

Convertir los valores de los enums actuales a registros en las tablas:

```sql
-- Ejemplo para Sexo
INSERT INTO catalogo_sexo (codigo, nombre, activo, orden) VALUES
  ('M', 'Masculino', true, 1),
  ('F', 'Femenino', true, 2),
  ('O', 'Otro', true, 3);
```

### Paso 3: Actualizar Referencias

Si las tablas relacionadas guardaban valores completos (ej: "Masculino"), actualizar a códigos:

```sql
UPDATE clientes SET sexo = 'M' WHERE sexo = 'Masculino';
UPDATE clientes SET sexo = 'F' WHERE sexo = 'Femenino';
```

## Uso en Formularios Existentes

### Migrar un Formulario

Para usar un catálogo en un formulario existente, consulta la guía detallada:
- `CATALOGO_MIGRATION_GUIDE.md` - Guía completa de migración
- `EJEMPLO_MIGRACION_CLIENTE_FORM.md` - Ejemplo práctico con código

**Resumen rápido:**

1. Importar el servicio:
```typescript
import { CatalogosService } from '@features/catalogos/services/catalogos.service';
```

2. Cargar el catálogo:
```typescript
private catalogosService = inject(CatalogosService);
sexoOptions = signal<CatalogoBase[]>([]);

ngOnInit(): void {
  this.catalogosService.getSexos().subscribe({
    next: (data) => this.sexoOptions.set(data)
  });
}
```

3. Usar en el template:
```html
<mat-select formControlName="sexo">
  @for (opcion of sexoOptions(); track opcion.id) {
    <mat-option [value]="opcion.codigo">
      {{ opcion.nombre }}
    </mat-option>
  }
</mat-select>
```

## Documentación Disponible

Tienes a tu disposición los siguientes documentos:

1. **CATALOGOS_README.md**
   - Documentación técnica completa
   - Arquitectura del sistema
   - Características implementadas
   - Cómo extender el sistema

2. **CATALOGO_MIGRATION_GUIDE.md**
   - Guía paso a paso para migrar formularios
   - Ejemplos de código
   - Best practices
   - Troubleshooting

3. **EJEMPLO_MIGRACION_CLIENTE_FORM.md**
   - Ejemplo completo de migración
   - Cambios en TypeScript y HTML
   - Manejo de datos legacy

4. **IMPLEMENTACION_CATALOGOS_RESUMEN.md**
   - Resumen de la implementación
   - Archivos creados y modificados
   - Métricas del proyecto

5. **INSTRUCCIONES_CATALOGOS.md** (este archivo)
   - Guía de inicio rápido
   - Requisitos del backend
   - Instrucciones de uso

## Pruebas

### Probar un Catálogo

1. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

2. **Navegar al catálogo:**
   - Ir a http://localhost:4200
   - Iniciar sesión
   - Click en "Catálogos" > Seleccionar un catálogo

3. **Probar funcionalidades:**
   - [ ] Ver lista de registros
   - [ ] Buscar registros
   - [ ] Ordenar columnas
   - [ ] Crear nuevo registro
   - [ ] Editar registro
   - [ ] Activar/Desactivar
   - [ ] Eliminar registro
   - [ ] Verificar paginación
   - [ ] Probar en móvil (diseño responsive)

### Errores Comunes

**Error: No se cargan los datos**
- Verificar que el endpoint del backend exista
- Revisar la consola del navegador para errores HTTP
- Verificar que `environment.apiUrl` sea correcto

**Error: No se pueden guardar cambios**
- Verificar validaciones del formulario
- Revisar respuesta del backend
- Verificar permisos del usuario

**Error: El menú no muestra el catálogo**
- Limpiar caché del navegador
- Verificar que las rutas estén correctas
- Recargar la página

## Próximos Pasos

1. **Implementar Backend:**
   - Crear controladores para cada catálogo
   - Crear servicios de negocio
   - Implementar validaciones
   - Crear pruebas unitarias

2. **Poblar Catálogos:**
   - Crear scripts de migración de datos
   - Insertar datos iniciales en cada catálogo
   - Verificar integridad de datos

3. **Actualizar Formularios:**
   - Identificar formularios que usan valores hardcodeados
   - Migrar a usar catálogos dinámicos
   - Probar cada formulario migrado

4. **Testing:**
   - Pruebas E2E de cada catálogo
   - Pruebas de integración con backend
   - Pruebas de performance

## Soporte y Ayuda

Si encuentras problemas o necesitas ayuda:

1. Revisa la documentación en los archivos .md mencionados
2. Verifica la consola del navegador para errores
3. Revisa los logs del backend
4. Consulta con el equipo de desarrollo

## Estado del Proyecto

- ✅ Frontend implementado y compilando correctamente
- ✅ 14 catálogos creados
- ✅ Componentes genéricos reutilizables
- ✅ Menú actualizado
- ✅ Documentación completa
- ⏳ Backend pendiente de implementación
- ⏳ Migración de datos pendiente
- ⏳ Actualización de formularios pendiente

---

**Última actualización:** 2026-01-24
**Versión:** 1.0.0
**Estado:** Listo para integración con backend
