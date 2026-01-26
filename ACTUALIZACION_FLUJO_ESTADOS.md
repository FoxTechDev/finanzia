# Actualización del Flujo de Estados de Solicitudes de Crédito

## Resumen de Cambios

Se ha actualizado el frontend Angular para implementar el nuevo flujo de estados dinámicos que se obtienen desde el backend, eliminando los enums hardcodeados.

---

## Cambios Realizados en el Frontend

### 1. Modelo de Datos (`credito.model.ts`)

**Ubicación:** `frontend/src/app/core/models/credito.model.ts`

#### Cambios principales:

- **Eliminado el enum `EstadoSolicitud`** hardcodeado
- **Creada la interface `EstadoSolicitud`** para representar estados dinámicos desde el catálogo:
  ```typescript
  export interface EstadoSolicitud {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    orden?: number;
  }
  ```

- **Actualizada la interface `Solicitud`**:
  - Agregado campo `estadoId: number` (FK al catálogo)
  - Cambiado `estado: EstadoSolicitud` a `estado?: EstadoSolicitud` (objeto completo)

- **Actualizada `SolicitudHistorial`**:
  - Agregados campos `estadoAnteriorId` y `estadoNuevoId`
  - Los objetos completos `estadoAnterior?` y `estadoNuevo?` son opcionales

- **Actualizada `CambiarEstadoSolicitudRequest`**:
  - Cambiado `nuevoEstado: EstadoSolicitud` a `nuevoEstadoId: number`

- **Eliminado `ESTADO_SOLICITUD_LABELS`** (ya no se necesita)

- **Creada constante `CODIGO_ESTADO_SOLICITUD`**:
  ```typescript
  export const CODIGO_ESTADO_SOLICITUD = {
    REGISTRADA: 'REGISTRADA',
    ANALIZADA: 'ANALIZADA',
    EN_COMITE: 'EN_COMITE',
    OBSERVADA: 'OBSERVADA',
    DENEGADA: 'DENEGADA',
    APROBADA: 'APROBADA',
    DESEMBOLSADA: 'DESEMBOLSADA',
  } as const;
  ```

---

### 2. Servicio de Solicitudes (`solicitud.service.ts`)

**Ubicación:** `frontend/src/app/features/creditos/services/solicitud.service.ts`

#### Métodos agregados:

```typescript
/**
 * Obtiene todos los estados de solicitud desde el catálogo
 */
getEstados(soloActivos = true): Observable<EstadoSolicitud[]> {
  const params = soloActivos ? new HttpParams().set('activos', 'true') : new HttpParams();
  return this.http.get<EstadoSolicitud[]>(`${environment.apiUrl}/catalogos/estado-solicitud`, { params });
}

/**
 * Obtiene un estado específico por su código
 */
getEstadoPorCodigo(codigo: string): Observable<EstadoSolicitud> {
  return this.http.get<EstadoSolicitud>(`${environment.apiUrl}/catalogos/estado-solicitud/codigo/${codigo}`);
}
```

#### Cambios en filtros:

- `SolicitudFilters.estado` cambiado a `estadoId: number`

---

### 3. Componente Lista de Solicitudes (`solicitudes-list.component.ts`)

**Ubicación:** `frontend/src/app/features/creditos/components/solicitudes/solicitudes-list.component.ts`

#### Cambios principales:

- **Agregado signal `estados`** para cargar estados desde el backend:
  ```typescript
  estados = signal<EstadoSolicitud[]>([]);
  ```

- **Método `loadEstados()`** para cargar estados al inicializar el componente

- **Actualizado el template del select de filtro** para usar el campo `estadoId` y mostrar `estado.nombre`

- **Actualizada la visualización de estados** en la tabla:
  ```html
  <mat-chip [ngClass]="getEstadoClass(item.estado?.codigo)">
    {{ item.estado?.nombre }}
  </mat-chip>
  ```

- **Actualizadas las validaciones de permisos**:
  ```typescript
  puedeEditar(codigoEstado?: string): boolean {
    return codigoEstado === CODIGO_ESTADO_SOLICITUD.REGISTRADA ||
           codigoEstado === CODIGO_ESTADO_SOLICITUD.OBSERVADA;
  }

  puedeTrasladarComite(codigoEstado?: string): boolean {
    return codigoEstado === CODIGO_ESTADO_SOLICITUD.ANALIZADA;
  }
  ```

- **Clases CSS basadas en códigos de estado**:
  ```css
  mat-chip.estado-registrada { background-color: #2196f3 !important; }
  mat-chip.estado-analizada { background-color: #ff9800 !important; }
  mat-chip.estado-en_comite { background-color: #673ab7 !important; }
  mat-chip.estado-observada { background-color: #ff5722 !important; }
  mat-chip.estado-denegada { background-color: #f44336 !important; }
  mat-chip.estado-aprobada { background-color: #4caf50 !important; }
  mat-chip.estado-desembolsada { background-color: #00bcd4 !important; }
  ```

---

### 4. Componente Detalle de Solicitud (`solicitud-detail.component.ts`)

**Ubicación:** `frontend/src/app/features/creditos/components/solicitudes/solicitud-detail.component.ts`

#### Cambios principales:

- **Agregado import de `MatDialog`** para abrir el diálogo de decisión del comité

- **Actualizada visualización del estado** usando `estado?.nombre` y `estado?.codigo`

- **Actualizadas las validaciones de permisos**:
  ```typescript
  puedeEditar(): boolean {
    const codigo = this.solicitud()?.estado?.codigo;
    return codigo === CODIGO_ESTADO_SOLICITUD.REGISTRADA ||
           codigo === CODIGO_ESTADO_SOLICITUD.OBSERVADA;
  }

  puedeTrasladarComite(): boolean {
    return this.solicitud()?.estado?.codigo === CODIGO_ESTADO_SOLICITUD.ANALIZADA;
  }

  puedeDecidirComite(): boolean {
    return this.solicitud()?.estado?.codigo === CODIGO_ESTADO_SOLICITUD.EN_COMITE;
  }
  ```

- **Agregado botón de "Decisión de Comité"** que solo aparece cuando el estado es `EN_COMITE`:
  ```html
  @if (puedeDecidirComite()) {
    <button mat-raised-button color="accent" (click)="abrirDecisionComite()">
      <mat-icon>gavel</mat-icon> Decisión de Comité
    </button>
  }
  ```

- **Agregado método `abrirDecisionComite()`**:
  ```typescript
  abrirDecisionComite(): void {
    const dialogRef = this.dialog.open(DecisionComiteDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { solicitud: this.solicitud() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Decisión registrada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadSolicitud(this.solicitud()!.id);
      }
    });
  }
  ```

- **Actualizada la tabla de historial** para mostrar `estadoAnterior?.nombre` y `estadoNuevo?.nombre`

- **Agregada sección de observaciones del comité** en el template

- **Mismas clases CSS basadas en códigos de estado**

---

### 5. Componente Bandeja de Comité (`bandeja-comite.component.ts`)

**Ubicación:** `frontend/src/app/features/creditos/components/comite/bandeja-comite/bandeja-comite.component.ts`

#### Cambios principales:

- **Actualizado import** de `ESTADO_SOLICITUD_LABELS` a `CODIGO_ESTADO_SOLICITUD`

**Nota:** El backend ya filtra automáticamente las solicitudes con estado `EN_COMITE`, por lo que no se requieren cambios adicionales en este componente.

---

## Flujo de Estados Implementado

### Estados del Sistema (desde el backend):

1. **REGISTRADA** - Estado inicial al crear la solicitud
   - Permite: Editar, Trasladar a Análisis (futuro)
   - Color: Azul (#2196f3)

2. **ANALIZADA** - Se asigna automáticamente cuando el asesor ingresa su análisis
   - Permite: Trasladar a Comité
   - Color: Naranja (#ff9800)

3. **EN_COMITE** - Cuando el asesor traslada a comité
   - Permite: Decisión del Comité (Aprobar, Denegar, Observar)
   - Color: Morado (#673ab7)

4. **OBSERVADA** - Cuando el comité observa la solicitud
   - Permite: Editar y reenviar a comité
   - Color: Rojo-Naranja (#ff5722)

5. **DENEGADA** - Cuando el comité deniega (cierra la solicitud definitivamente)
   - Permite: Solo visualización
   - Color: Rojo (#f44336)

6. **APROBADA** - Cuando el comité aprueba
   - Permite: Desembolso
   - Color: Verde (#4caf50)

7. **DESEMBOLSADA** - Estado final después del desembolso
   - Permite: Solo visualización
   - Color: Cian (#00bcd4)

---

## Archivos NO Modificados (pero que podrían necesitar actualización):

### 1. `solicitud-form.component.ts`
**Ubicación:** `frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts`

**Pendiente:** Revisar si este componente usa el enum de estados o necesita alguna actualización para el flujo.

### 2. `analisis-asesor-step.component.ts`
**Ubicación:** `frontend/src/app/features/creditos/components/solicitudes/analisis-asesor-step/analisis-asesor-step.component.ts`

**Pendiente:** Verificar que el componente de análisis del asesor cambie correctamente el estado a `ANALIZADA`.

### 3. `decision-comite-dialog.component.ts`
**Ubicación:** `frontend/src/app/features/creditos/components/comite/decision-comite-dialog/decision-comite-dialog.component.ts`

**Estado:** Ya existe y funciona correctamente con los tipos de decisión del comité.

### 4. Otros componentes que puedan referenciar estados
**Pendiente:** Buscar en el proyecto referencias a `EstadoSolicitud` como enum y actualizarlas.

---

## Validaciones y Verificaciones Necesarias

### En el Backend:

1. **Verificar que existe el catálogo `estado-solicitud`** con los 7 estados definidos
2. **Verificar el endpoint** `GET /catalogos/estado-solicitud` retorna los estados correctamente
3. **Verificar el endpoint** `GET /catalogos/estado-solicitud/codigo/:codigo` funciona
4. **Verificar que el flujo de transiciones** de estados está implementado:
   - REGISTRADA → ANALIZADA (al guardar análisis del asesor)
   - ANALIZADA → EN_COMITE (al trasladar a comité)
   - EN_COMITE → OBSERVADA | DENEGADA | APROBADA (decisiones del comité)
   - OBSERVADA → EN_COMITE (al reenviar después de correcciones)
   - APROBADA → DESEMBOLSADA (al desembolsar)

5. **Verificar el endpoint** `GET /comite/pendientes` filtra correctamente por estado `EN_COMITE`

6. **Verificar que las solicitudes incluyen la relación `estado`** al retornar:
   ```json
   {
     "id": 1,
     "numeroSolicitud": "SOL-2024-001",
     "estadoId": 3,
     "estado": {
       "id": 3,
       "codigo": "EN_COMITE",
       "nombre": "En Comité",
       "descripcion": "Solicitud en evaluación por el comité de crédito",
       "activo": true,
       "orden": 3
     },
     ...
   }
   ```

7. **Verificar que el historial incluye las relaciones** `estadoAnterior` y `estadoNuevo`

### En el Frontend:

1. **Compilar el proyecto** y verificar que no hay errores de TypeScript:
   ```bash
   cd frontend
   npm run build
   ```

2. **Probar el flujo completo**:
   - Crear una solicitud (estado REGISTRADA)
   - Ingresar análisis del asesor (cambia a ANALIZADA)
   - Trasladar a comité (cambia a EN_COMITE)
   - Tomar decisión en comité (OBSERVADA, DENEGADA o APROBADA)
   - Si es OBSERVADA, editar y reenviar (vuelve a EN_COMITE)
   - Si es APROBADA, desembolsar (cambia a DESEMBOLSADA)

3. **Verificar los filtros** en la lista de solicitudes funcionan correctamente

4. **Verificar los colores** de los badges de estado se muestran correctamente

5. **Verificar los permisos** de los botones según el estado actual

---

## Comandos Útiles

### Buscar referencias al enum antiguo:
```bash
cd frontend
grep -r "EstadoSolicitud\." src/app --include="*.ts"
grep -r "ESTADO_SOLICITUD_LABELS" src/app --include="*.ts"
```

### Compilar y ejecutar:
```bash
cd frontend
npm install
npm run build
npm start
```

---

## Próximos Pasos Recomendados

1. **Actualizar componentes restantes** que puedan estar usando el enum antiguo
2. **Agregar tests unitarios** para las validaciones de permisos basadas en códigos de estado
3. **Documentar el flujo de estados** en el manual de usuario
4. **Considerar agregar un diagrama de flujo** visual en la UI para que los usuarios entiendan las transiciones
5. **Implementar notificaciones** cuando una solicitud cambia de estado
6. **Agregar logs de auditoría** para el historial de cambios de estado

---

## Contacto y Soporte

Si tienes dudas sobre la implementación o necesitas ayuda adicional, consulta la documentación del backend o contacta al equipo de desarrollo.

**Fecha de actualización:** 2026-01-25
**Versión del frontend:** Angular 18
**Estado:** Implementación completada - Pendiente testing y validación
