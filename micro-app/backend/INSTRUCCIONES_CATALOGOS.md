# Instrucciones para Implementación de Catálogos

## Resumen
Este documento contiene las instrucciones para completar la implementación de todos los catálogos del sistema.

## Estado Actual
✅ **Completado:**
- Creación de tablas SQL para todos los catálogos
- Script de datos iniciales (catalogos-data.sql)
- Configuración centralizada (catalogos.config.ts)
- Módulo EstadoGarantia (ejemplo completo)
- Seeder de catálogos
- Módulo principal CatalogosModule

## Pasos para Completar

### 1. Ejecutar Scripts SQL

Primero, crear las tablas y cargar los datos:

```bash
# Conectarse a la base de datos
mysql -u root -p micro_app

# Ejecutar script de creación de tablas
source C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/micro-app/backend/src/database/migrations/create-catalogos-tables.sql

# Ejecutar script de datos iniciales
source C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/micro-app/backend/src/database/seeds/catalogos-data.sql
```

### 2. Generar Módulos TypeScript

Ejecutar el script generador para crear todos los archivos:

```bash
cd C:/Users/javie/OneDrive/Documentos/DESARROLLO/MICRO/micro-app/backend
node generate-catalogos.js
```

Este script creará automáticamente para cada catálogo:
- Entity
- Create DTO
- Update DTO
- Service
- Controller
- Module

### 3. Actualizar el Módulo Principal

Editar `src/catalogos/catalogos.module.ts` e importar todos los módulos generados:

```typescript
import { Module } from '@nestjs/common';
import { EstadoGarantiaModule } from './estado-garantia/estado-garantia.module';
import { RecomendacionAsesorModule } from './recomendacion-asesor/recomendacion-asesor.module';
import { TipoDecisionComiteModule } from './tipo-decision-comite/tipo-decision-comite.module';
import { TipoPagoModule } from './tipo-pago/tipo-pago.module';
import { EstadoPagoModule } from './estado-pago/estado-pago.module';
import { SexoModule } from './sexo/sexo.module';
import { EstadoSolicitudModule } from './estado-solicitud/estado-solicitud.module';
import { DestinoCreditoModule } from './destino-credito/destino-credito.module';
import { EstadoCuotaModule } from './estado-cuota/estado-cuota.module';
import { TipoInteresModule } from './tipo-interes/tipo-interes.module';
import { PeriodicidadPagoModule } from './periodicidad-pago/periodicidad-pago.module';
import { CategoriaNcb022Module } from './categoria-ncb022/categoria-ncb022.module';
import { TipoCalculoModule } from './tipo-calculo/tipo-calculo.module';

@Module({
  imports: [
    EstadoGarantiaModule,
    RecomendacionAsesorModule,
    TipoDecisionComiteModule,
    TipoPagoModule,
    EstadoPagoModule,
    SexoModule,
    EstadoSolicitudModule,
    DestinoCreditoModule,
    EstadoCuotaModule,
    TipoInteresModule,
    PeriodicidadPagoModule,
    CategoriaNcb022Module,
    TipoCalculoModule,
  ],
  exports: [
    EstadoGarantiaModule,
    RecomendacionAsesorModule,
    TipoDecisionComiteModule,
    TipoPagoModule,
    EstadoPagoModule,
    SexoModule,
    EstadoSolicitudModule,
    DestinoCreditoModule,
    EstadoCuotaModule,
    TipoInteresModule,
    PeriodicidadPagoModule,
    CategoriaNcb022Module,
    TipoCalculoModule,
  ],
})
export class CatalogosModule {}
```

### 4. Registrar en AppModule

Editar `src/app.module.ts` para importar CatalogosModule:

```typescript
import { CatalogosModule } from './catalogos/catalogos.module';

@Module({
  imports: [
    // ... otros imports
    CatalogosModule,
  ],
  // ...
})
export class AppModule {}
```

### 5. Actualizar Entidades Existentes

Ahora debemos modificar las entidades que actualmente usan enums para que usen las nuevas tablas de catálogo mediante relaciones ManyToOne.

#### 5.1 Garantia Entity

Archivo: `src/creditos/garantia/entities/garantia.entity.ts`

Buscar la columna `estado` y reemplazar:

```typescript
// ANTES
@Column({
  type: 'enum',
  enum: EstadoGarantia,
  default: EstadoGarantia.PENDIENTE,
})
estado: EstadoGarantia;

// DESPUÉS
@Column({ nullable: true })
estadoGarantiaId: number;

@ManyToOne(() => EstadoGarantia)
@JoinColumn({ name: 'estadoGarantiaId' })
estadoGarantia: EstadoGarantia;
```

Importar al inicio:
```typescript
import { EstadoGarantia } from '../../../catalogos/estado-garantia/entities/estado-garantia.entity';
```

#### 5.2 Solicitud Entity

Archivo: `src/creditos/solicitud/entities/solicitud.entity.ts`

```typescript
// ANTES - recomendacionAsesor
@Column({
  type: 'enum',
  enum: RecomendacionAsesor,
  nullable: true,
})
recomendacionAsesor: RecomendacionAsesor;

// DESPUÉS
@Column({ nullable: true })
recomendacionAsesorId: number;

@ManyToOne(() => RecomendacionAsesor)
@JoinColumn({ name: 'recomendacionAsesorId' })
recomendacionAsesor: RecomendacionAsesor;
```

```typescript
// ANTES - estado
@Column({
  type: 'enum',
  enum: EstadoSolicitud,
  default: EstadoSolicitud.CREADA,
})
estado: EstadoSolicitud;

// DESPUÉS
@Column({ nullable: true })
estadoSolicitudId: number;

@ManyToOne(() => EstadoSolicitud)
@JoinColumn({ name: 'estadoSolicitudId' })
estadoSolicitud: EstadoSolicitud;
```

```typescript
// ANTES - destinoCredito
@Column({
  type: 'enum',
  enum: DestinoCredito,
  default: DestinoCredito.CONSUMO_PERSONAL,
})
destinoCredito: DestinoCredito;

// DESPUÉS
@Column({ nullable: true })
destinoCreditoId: number;

@ManyToOne(() => DestinoCredito)
@JoinColumn({ name: 'destinoCreditoId' })
destinoCredito: DestinoCredito;
```

#### 5.3 DecisionComite Entity

Archivo: `src/creditos/comite/entities/decision-comite.entity.ts`

```typescript
// ANTES
@Column({
  type: 'enum',
  enum: TipoDecisionComite,
})
tipoDecision: TipoDecisionComite;

// DESPUÉS
@Column({ nullable: true })
tipoDecisionComiteId: number;

@ManyToOne(() => TipoDecisionComite)
@JoinColumn({ name: 'tipoDecisionComiteId' })
tipoDecisionComite: TipoDecisionComite;
```

#### 5.4 Pago Entity

Archivo: `src/creditos/pagos/entities/pago.entity.ts`

```typescript
// ANTES - tipoPago
@Column({
  type: 'enum',
  enum: TipoPago,
  default: TipoPago.CUOTA_COMPLETA,
})
tipoPago: TipoPago;

// DESPUÉS
@Column({ nullable: true })
tipoPagoId: number;

@ManyToOne(() => TipoPago)
@JoinColumn({ name: 'tipoPagoId' })
tipoPago: TipoPago;
```

```typescript
// ANTES - estado
@Column({
  type: 'enum',
  enum: EstadoPago,
  default: EstadoPago.APLICADO,
})
estado: EstadoPago;

// DESPUÉS
@Column({ nullable: true })
estadoPagoId: number;

@ManyToOne(() => EstadoPago)
@JoinColumn({ name: 'estadoPagoId' })
estadoPago: EstadoPago;
```

#### 5.5 Persona Entity

Archivo: `src/persona/entities/persona.entity.ts`

```typescript
// ANTES
@Column({
  type: 'enum',
  enum: Sexo,
  nullable: true,
})
sexo: Sexo;

// DESPUÉS
@Column({ nullable: true })
sexoId: number;

@ManyToOne(() => Sexo)
@JoinColumn({ name: 'sexoId' })
sexo: Sexo;
```

#### 5.6 PlanPago Entity

Archivo: `src/creditos/desembolso/entities/plan-pago.entity.ts`

```typescript
// ANTES
@Column({
  type: 'enum',
  enum: EstadoCuota,
  default: EstadoCuota.PENDIENTE,
})
estado: EstadoCuota;

// DESPUÉS
@Column({ nullable: true })
estadoCuotaId: number;

@ManyToOne(() => EstadoCuota)
@JoinColumn({ name: 'estadoCuotaId' })
estadoCuota: EstadoCuota;
```

#### 5.7 Prestamo Entity

Archivo: `src/creditos/desembolso/entities/prestamo.entity.ts`

```typescript
// ANTES - tipoInteres
@Column({
  type: 'enum',
  enum: TipoInteres,
  default: TipoInteres.FLAT,
})
tipoInteres: TipoInteres;

// DESPUÉS
@Column({ nullable: true })
tipoInteresId: number;

@ManyToOne(() => TipoInteres)
@JoinColumn({ name: 'tipoInteresId' })
tipoInteres: TipoInteres;
```

```typescript
// ANTES - periodicidadPago
@Column({
  type: 'enum',
  enum: PeriodicidadPago,
  default: PeriodicidadPago.MENSUAL,
})
periodicidadPago: PeriodicidadPago;

// DESPUÉS
@Column({ nullable: true })
periodicidadPagoId: number;

@ManyToOne(() => PeriodicidadPago)
@JoinColumn({ name: 'periodicidadPagoId' })
periodicidadPago: PeriodicidadPago;
```

```typescript
// ANTES - categoriaNCB022
@Column({
  type: 'enum',
  enum: CategoriaNCB022,
  default: CategoriaNCB022.A,
})
categoriaNCB022: CategoriaNCB022;

// DESPUÉS
@Column({ nullable: true })
categoriaNcb022Id: number;

@ManyToOne(() => CategoriaNcb022)
@JoinColumn({ name: 'categoriaNcb022Id' })
categoriaNcb022: CategoriaNcb022;
```

#### 5.8 TipoDeduccion Entity

Archivo: `src/creditos/desembolso/entities/tipo-deduccion.entity.ts`

```typescript
// ANTES
@Column({
  type: 'enum',
  enum: TipoCalculo,
  default: TipoCalculo.PORCENTAJE,
})
tipoCalculoDefault: TipoCalculo;

// DESPUÉS
@Column({ nullable: true })
tipoCalculoId: number;

@ManyToOne(() => TipoCalculo)
@JoinColumn({ name: 'tipoCalculoId' })
tipoCalculo: TipoCalculo;
```

### 6. Actualizar Servicios

Los servicios que crean o actualizan estas entidades deben modificarse para aceptar IDs de catálogo en lugar de valores enum.

Ejemplo para `SolicitudService`:

```typescript
// ANTES
const solicitud = this.solicitudRepository.create({
  ...createSolicitudDto,
  estado: EstadoSolicitud.CREADA,
});

// DESPUÉS
const estadoCreada = await this.estadoSolicitudService.findByCodigo('CREADA');
const solicitud = this.solicitudRepository.create({
  ...createSolicitudDto,
  estadoSolicitudId: estadoCreada.id,
});
```

### 7. Actualizar DTOs

Los DTOs deben cambiar de aceptar valores enum a aceptar IDs numéricos:

```typescript
// ANTES
@IsEnum(EstadoSolicitud)
estado: EstadoSolicitud;

// DESPUÉS
@IsNumber()
@IsOptional()
estadoSolicitudId?: number;
```

### 8. Generar y Ejecutar Migraciones

```bash
# Generar migración
npm run typeorm migration:generate -- src/database/migrations/ConvertEnumsToCatalogos

# Ejecutar migración
npm run typeorm migration:run
```

### 9. Ejecutar Seeder

```bash
npm run seed
```

## Catálogos Implementados

| # | Catálogo | Tabla | Carpeta | Clase |
|---|----------|-------|---------|-------|
| 1 | Estado de Garantía | estado_garantia | estado-garantia | EstadoGarantia |
| 2 | Recomendación de Asesor | recomendacion_asesor | recomendacion-asesor | RecomendacionAsesor |
| 3 | Tipo Decisión Comité | tipo_decision_comite | tipo-decision-comite | TipoDecisionComite |
| 4 | Tipo de Pago | tipo_pago | tipo-pago | TipoPago |
| 5 | Estado de Pago | estado_pago | estado-pago | EstadoPago |
| 6 | Sexo | sexo | sexo | Sexo |
| 7 | Estado de Solicitud | estado_solicitud | estado-solicitud | EstadoSolicitud |
| 8 | Destino de Crédito | destino_credito | destino-credito | DestinoCredito |
| 9 | Estado de Cuota | estado_cuota | estado-cuota | EstadoCuota |
| 10 | Tipo de Interés | tipo_interes | tipo-interes | TipoInteres |
| 11 | Periodicidad de Pago | periodicidad_pago | periodicidad-pago | PeriodicidadPago |
| 12 | Categoría NCB-022 | categoria_ncb022 | categoria-ncb022 | CategoriaNcb022 |
| 13 | Tipo de Cálculo | tipo_calculo | tipo-calculo | TipoCalculo |

## Endpoints de los Catálogos

Todos los catálogos tendrán los siguientes endpoints:

- `GET /catalogos/{nombre-catalogo}` - Listar todos
- `GET /catalogos/{nombre-catalogo}/activos` - Listar solo activos
- `GET /catalogos/{nombre-catalogo}/:id` - Obtener por ID
- `GET /catalogos/{nombre-catalogo}/codigo/:codigo` - Obtener por código
- `POST /catalogos/{nombre-catalogo}` - Crear nuevo
- `PATCH /catalogos/{nombre-catalogo}/:id` - Actualizar
- `DELETE /catalogos/{nombre-catalogo}/:id` - Eliminar

## Ventajas de este Enfoque

1. **Flexibilidad**: Los valores pueden modificarse sin cambiar código
2. **Auditoría**: Se puede rastrear cambios en los catálogos
3. **Internacionalización**: Fácil agregar traducciones
4. **Extensibilidad**: Agregar nuevos valores sin desplegar código
5. **UI Mejorada**: Colores y ordenamiento personalizable
6. **Consistencia**: Todos los catálogos siguen el mismo patrón

## Archivos Creados

```
src/catalogos/
├── catalogos.config.ts (Configuración centralizada)
├── catalogos.module.ts (Módulo principal)
├── estado-garantia/ (Ejemplo completo)
│   ├── entities/
│   │   └── estado-garantia.entity.ts
│   ├── dto/
│   │   ├── create-estado-garantia.dto.ts
│   │   └── update-estado-garantia.dto.ts
│   ├── estado-garantia.controller.ts
│   ├── estado-garantia.service.ts
│   └── estado-garantia.module.ts
└── [... otros 12 catálogos con la misma estructura]

src/database/
├── migrations/
│   └── create-catalogos-tables.sql
└── seeds/
    ├── catalogos.seed.ts
    └── catalogos-data.sql

generate-catalogos.js (Script generador)
```

## Notas Importantes

- Mantener compatibilidad con los enums existentes durante la transición
- Los enums pueden eliminarse gradualmente después de verificar que todo funciona
- Considerar agregar índices en las columnas de ID de catálogo para mejor performance
- Los catálogos deben ser poblados ANTES de migrar los datos existentes
