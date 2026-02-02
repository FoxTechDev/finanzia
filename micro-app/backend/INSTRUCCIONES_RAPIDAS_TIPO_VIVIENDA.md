# Instrucciones Rápidas: Tipo Vivienda

## Inicio Rápido (Quick Start)

### 1. Ejecutar Migración

**Opción A - TypeORM (Recomendada):**
```bash
cd micro-app/backend
npm run migration:run
```

**Opción B - MySQL Manual:**
```bash
mysql -u root -p finanzia < migracion-tipo-vivienda.sql
```

**Opción C - Windows Batch:**
```cmd
ejecutar-migracion-tipo-vivienda.bat
```

### 2. Verificar Datos

```sql
-- Ver tipos de vivienda creados
SELECT * FROM tipo_vivienda;

-- Ver direcciones con tipo de vivienda
SELECT d.idDireccion, d.detalleDireccion, tv.nombre as tipo_vivienda
FROM direccion d
LEFT JOIN tipo_vivienda tv ON d.idTipoVivienda = tv.idTipoVivienda;
```

### 3. Probar Endpoints

Usar archivo `test-tipo-vivienda.http` con REST Client o:

```bash
# Listar todos
curl http://localhost:3000/api/tipo-vivienda

# Listar activos
curl http://localhost:3000/api/tipo-vivienda/activos

# Obtener uno
curl http://localhost:3000/api/tipo-vivienda/1
```

---

## Archivos Importantes

```
micro-app/backend/
├── src/tipo-vivienda/              ← Módulo completo
├── src/database/migrations/        ← Migración TypeORM
├── migracion-tipo-vivienda.sql     ← Script SQL manual
├── test-tipo-vivienda.http         ← Pruebas REST
├── TIPO_VIVIENDA_IMPLEMENTATION.md ← Documentación técnica
└── TIPO_VIVIENDA_RESUMEN.md        ← Resumen ejecutivo
```

---

## Uso en Código

### Backend (TypeScript)

```typescript
// Crear dirección con tipo de vivienda
const direccion = {
  departamentoId: 1,
  municipioId: 1,
  distritoId: 1,
  detalleDireccion: "10 calle 5-20 zona 1",
  tipoViviendaId: 1,  // ← ID del tipo (1=Propia, 2=Alquilada, etc.)
  tiempoResidenciaAnios: 5
};

// Obtener con relación
const persona = await personaRepository.findOne({
  where: { id: personaId },
  relations: ['direccion', 'direccion.tipoVivienda']
});

// Acceder al tipo
console.log(persona.direccion.tipoVivienda.nombre); // "Propia"
```

### Frontend (Angular)

```typescript
// Servicio
getTiposVivienda(): Observable<TipoVivienda[]> {
  return this.http.get<TipoVivienda[]>(`${API_URL}/tipo-vivienda/activos`);
}

// Componente
tiposVivienda$ = this.catalogosService.getTiposVivienda();

// Template
<select formControlName="tipoViviendaId">
  <option [value]="null">Seleccione tipo de vivienda</option>
  <option *ngFor="let tipo of tiposVivienda$ | async" [value]="tipo.id">
    {{ tipo.nombre }}
  </option>
</select>
```

---

## Endpoints API

| Método | URL | Body | Descripción |
|--------|-----|------|-------------|
| GET | `/api/tipo-vivienda` | - | Listar todos |
| GET | `/api/tipo-vivienda/activos` | - | Solo activos |
| GET | `/api/tipo-vivienda/:id` | - | Uno específico |
| POST | `/api/tipo-vivienda` | `{codigo, nombre, descripcion?, activo?, orden?}` | Crear |
| PATCH | `/api/tipo-vivienda/:id` | `{campos a actualizar}` | Actualizar |
| PATCH | `/api/tipo-vivienda/:id/toggle-activo` | `{activo: boolean}` | Activar/Desactivar |
| DELETE | `/api/tipo-vivienda/:id` | - | Eliminar |

---

## Datos Iniciales

| ID | Código | Nombre | Orden |
|----|--------|--------|-------|
| 1 | PROPIA | Propia | 1 |
| 2 | ALQUILADA | Alquilada | 2 |
| 3 | FAMILIAR | Familiar | 3 |
| 4 | PRESTADA | Prestada | 4 |
| 5 | OTRA | Otra | 5 |

---

## Validaciones

- `codigo`: requerido, único, máximo 50 caracteres
- `nombre`: requerido, único, máximo 100 caracteres
- `descripcion`: opcional, texto
- `activo`: opcional, booleano (default: true)
- `orden`: opcional, número >= 0

---

## Troubleshooting

### Error: "Table tipo_vivienda already exists"
```sql
DROP TABLE IF EXISTS tipo_vivienda;
```
Luego ejecuta la migración de nuevo.

### Error: "Foreign key constraint fails"
Verifica que no haya direcciones con `idTipoVivienda` inválido:
```sql
SELECT * FROM direccion WHERE idTipoVivienda NOT IN (SELECT idTipoVivienda FROM tipo_vivienda);
```

### Frontend no muestra tipos
Verifica en DevTools que la API responda:
```bash
curl http://localhost:3000/api/tipo-vivienda/activos
```

---

## Rollback (Revertir)

Si necesitas revertir la migración:

```bash
npm run migration:revert
```

O manualmente, descomenta la sección ROLLBACK en `migracion-tipo-vivienda.sql`.

---

## Siguiente Paso: Actualizar Frontend

1. Agregar modelo:
```typescript
export interface TipoVivienda {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
}
```

2. Agregar al servicio de catálogos:
```typescript
getTiposVivienda(): Observable<TipoVivienda[]> {
  return this.http.get<TipoVivienda[]>(`${this.apiUrl}/tipo-vivienda/activos`);
}
```

3. Actualizar formulario de clientes para usar select en lugar de enum.

---

**Estado:** LISTO PARA USAR
**Compilación:** OK
**Próximo paso:** Ejecutar migración en desarrollo
