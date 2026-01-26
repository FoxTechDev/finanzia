# Guía de Migración - Actualización NCB-022

## Resumen Ejecutivo

Este documento proporciona la guía técnica para migrar el sistema de clasificación de préstamos de 5 a 8 categorías según la normativa NCB-022 de la Superintendencia del Sistema Financiero (SSF) de El Salvador.

---

## 1. INFORMACIÓN REGULATORIA

### Normativa Aplicable
- **NCB-022**: "Normas para Clasificar los Activos de Riesgo Crediticio y Constituir las Reservas de Saneamiento"
- **Autoridad**: Superintendencia del Sistema Financiero (SSF) - El Salvador
- **Documento oficial**: https://www.ssf.gob.sv/images/stories/desc_normas_contables_bancos/16_ncb-022.pdf

### Categorías Correctas NCB-022

| Código | Nombre | Descripción | Provisión |
|--------|--------|-------------|-----------|
| A1 | Normal | Riesgo normal | 0% |
| A2 | Normal con debilidades | Riesgo normal con debilidades menores | 1% |
| B | Subnormal | Créditos que ameritan atención especial | 5% |
| C1 | Deficiente | Alto riesgo de incumplimiento | 15% |
| C2 | Deficiente con mayor riesgo | Deficiente con problemas graves | 25% |
| D1 | Difícil Recuperación | Muy alto riesgo de pérdida | 50% |
| D2 | Difícil Recuperación alto riesgo | Recuperación altamente improbable | 75% |
| E | Irrecuperable | Pérdida prácticamente cierta | 100% |

### Días de Mora por Sector

#### SECTOR CONSUMO
| Categoría | Rango de Días |
|-----------|---------------|
| A1 | 0 - 7 días |
| A2 | 8 - 30 días |
| B | 31 - 60 días |
| C1 | 61 - 90 días |
| C2 | 91 - 120 días |
| D1 | 121 - 150 días |
| D2 | 151 - 180 días |
| E | Más de 180 días |

#### SECTOR VIVIENDA
| Categoría | Rango de Días |
|-----------|---------------|
| A1 | 0 - 7 días |
| A2 | 8 - 30 días |
| B | 31 - 90 días |
| C1 | 91 - 120 días |
| C2 | 121 - 180 días |
| D1 | 181 - 270 días |
| D2 | 271 - 360 días |
| E | Más de 360 días |

#### SECTOR EMPRESAS
La clasificación no se basa únicamente en días de mora. Incluye criterios cualitativos de evaluación del deudor y su capacidad de pago. Requiere análisis más complejo.

---

## 2. CAMBIOS IMPLEMENTADOS

### Archivo Actualizado
**Ubicación**: `micro-app/backend/src/creditos/desembolso/services/clasificacion-prestamo.service.ts`

### Cambios Principales

1. **Método `inicializarClasificacionesNCB022()`**
   - ANTES: 5 categorías (A, B, C, D, E)
   - AHORA: 8 categorías (A1, A2, B, C1, C2, D1, D2, E)
   - Porcentajes de provisión corregidos
   - Rangos de días de mora para sector CONSUMO

2. **Nuevo Método `inicializarClasificacionesVivienda()`**
   - Crea las 8 categorías con rangos para sector VIVIENDA
   - Códigos diferenciados: A1-VIV, A2-VIV, etc.

3. **Documentación del Servicio**
   - Comentarios detallados sobre la normativa
   - Referencias a documentos oficiales
   - Tablas de referencia en el código

---

## 3. PASOS DE MIGRACIÓN

### Fase 1: Preparación (ANTES DE EJECUTAR)

#### 3.1 Validación con Cumplimiento
- [ ] Revisar interpretación de NCB-022 con oficial de cumplimiento
- [ ] Confirmar versión vigente de la normativa
- [ ] Validar si la institución maneja los 3 sectores o solo algunos
- [ ] Determinar si hay modificaciones específicas aplicables

#### 3.2 Respaldo de Base de Datos
```sql
-- Respaldar tabla de clasificaciones
CREATE TABLE clasificacion_prestamo_backup AS
SELECT * FROM clasificacion_prestamo;

-- Respaldar tabla de préstamos si tiene relación
CREATE TABLE prestamo_backup AS
SELECT * FROM prestamo;
```

#### 3.3 Análisis de Impacto
- [ ] Revisar cuántos préstamos están actualmente clasificados
- [ ] Identificar reportes que usan clasificaciones
- [ ] Verificar procesos automáticos de provisión
- [ ] Revisar integraciones con sistemas externos

### Fase 2: Actualización de Base de Datos

#### 3.4 Crear Script de Migración

**IMPORTANTE**: Este script es un EJEMPLO. Debe adaptarse a la estructura real de su base de datos.

```typescript
// migration/update-clasificaciones-ncb022.migration.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateClasificacionesNCB0221234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. DESACTIVAR clasificaciones antiguas (no eliminar por auditoría)
    await queryRunner.query(`
      UPDATE clasificacion_prestamo
      SET activo = false
      WHERE codigo IN ('A', 'B', 'C', 'D', 'E')
    `);

    // 2. RECLASIFICAR préstamos existentes según días de mora actuales
    // Este ejemplo asume sector CONSUMO
    // Categoría A1 (0-7 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'A1'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora BETWEEN 0 AND 7
    `);

    // Categoría A2 (8-30 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'A2'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora BETWEEN 8 AND 30
    `);

    // Categoría B (31-60 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'B'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora BETWEEN 31 AND 60
    `);

    // Categoría C1 (61-90 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'C1'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora BETWEEN 61 AND 90
    `);

    // Categoría C2 (91-120 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'C2'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora BETWEEN 91 AND 120
    `);

    // Categoría D1 (121-150 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'D1'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora BETWEEN 121 AND 150
    `);

    // Categoría D2 (151-180 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'D2'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora BETWEEN 151 AND 180
    `);

    // Categoría E (>180 días)
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON c.codigo = 'E'
      SET p.clasificacion_id = c.id
      WHERE p.dias_mora > 180
    `);

    // 3. RECALCULAR provisiones
    await queryRunner.query(`
      UPDATE prestamo p
      INNER JOIN clasificacion_prestamo c ON p.clasificacion_id = c.id
      SET p.monto_provision = (p.saldo_actual * c.porcentaje_provision / 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios si es necesario
    await queryRunner.query(`
      UPDATE clasificacion_prestamo
      SET activo = true
      WHERE codigo IN ('A', 'B', 'C', 'D', 'E')
    `);

    await queryRunner.query(`
      UPDATE clasificacion_prestamo
      SET activo = false
      WHERE codigo IN ('A1', 'A2', 'C1', 'C2', 'D1', 'D2')
    `);
  }
}
```

### Fase 3: Inicialización de Nuevas Categorías

#### 3.5 Ejecutar Inicialización

```typescript
// En un seeder o script de inicialización
import { ClasificacionPrestamoService } from './clasificacion-prestamo.service';

async function inicializarClasificaciones() {
  const service = new ClasificacionPrestamoService(repository);

  // Para sector CONSUMO
  await service.inicializarClasificacionesNCB022();

  // Para sector VIVIENDA (si aplica)
  await service.inicializarClasificacionesVivienda();

  console.log('Clasificaciones NCB-022 inicializadas correctamente');
}
```

### Fase 4: Validación Post-Migración

#### 3.6 Verificaciones Obligatorias

```sql
-- Verificar que existen las 8 categorías
SELECT codigo, nombre, porcentaje_provision, dias_mora_minimo, dias_mora_maximo
FROM clasificacion_prestamo
WHERE activo = true
ORDER BY orden;

-- Resultado esperado: 8 filas (o 16 si incluye Vivienda)

-- Verificar que todos los préstamos tienen clasificación válida
SELECT COUNT(*)
FROM prestamo
WHERE clasificacion_id IS NULL;

-- Resultado esperado: 0

-- Verificar distribución de préstamos por categoría
SELECT c.codigo, c.nombre, COUNT(p.id) as cantidad, SUM(p.saldo_actual) as saldo_total
FROM clasificacion_prestamo c
LEFT JOIN prestamo p ON p.clasificacion_id = c.id
GROUP BY c.id, c.codigo, c.nombre
ORDER BY c.orden;

-- Verificar provisiones recalculadas
SELECT
  c.codigo,
  COUNT(p.id) as cantidad_prestamos,
  SUM(p.saldo_actual) as saldo_total,
  SUM(p.monto_provision) as provision_total,
  (SUM(p.monto_provision) / SUM(p.saldo_actual) * 100) as porcentaje_provision_real,
  c.porcentaje_provision as porcentaje_provision_esperado
FROM prestamo p
INNER JOIN clasificacion_prestamo c ON p.clasificacion_id = c.id
GROUP BY c.codigo, c.porcentaje_provision;
```

#### 3.7 Pruebas Funcionales

- [ ] Crear un nuevo préstamo y verificar clasificación automática
- [ ] Simular paso de días y verificar reclasificación
- [ ] Generar reporte de cartera clasificada
- [ ] Generar reporte de provisiones
- [ ] Verificar exportación para reportes regulatorios SSF

---

## 4. CONSIDERACIONES ADICIONALES

### 4.1 Sectores Crediticios

El sistema actual NO distingue entre sectores (Consumo, Vivienda, Empresas). Se recomienda:

**Opción A: Agregar campo de sector**
```typescript
// En prestamo.entity.ts
@Column({
  type: 'enum',
  enum: ['CONSUMO', 'VIVIENDA', 'EMPRESAS'],
  default: 'CONSUMO'
})
sector: string;
```

**Opción B: Determinar sector por monto o plazo**
- Consumo: Montos menores, plazos cortos
- Vivienda: Montos altos, plazos largos, garantía hipotecaria
- Empresas: Requiere análisis financiero

### 4.2 Proceso de Clasificación Continua

El sistema debe reclasificar automáticamente los préstamos:

```typescript
// Sugerencia: Proceso nocturno (cron job)
@Cron('0 2 * * *') // 2:00 AM diario
async reclasificarPrestamos() {
  const prestamosActivos = await this.prestamoRepository.find({
    where: { estado: 'ACTIVO' }
  });

  for (const prestamo of prestamosActivos) {
    const diasMora = this.calcularDiasMora(prestamo);
    const nuevaClasificacion = await this.clasificacionService
      .determinarClasificacionPorMora(diasMora);

    if (nuevaClasificacion.id !== prestamo.clasificacionId) {
      prestamo.clasificacionId = nuevaClasificacion.id;
      prestamo.porcentajeProvision = nuevaClasificacion.porcentajeProvision;
      prestamo.montoProvision = prestamo.saldoActual *
        (nuevaClasificacion.porcentajeProvision / 100);

      await this.prestamoRepository.save(prestamo);

      // Registrar auditoría del cambio
      await this.auditoriaService.registrarCambioClasificacion(prestamo);
    }
  }
}
```

### 4.3 Reportes Regulatorios

Después de la migración, actualizar reportes para SSF:

- R01 - Reporte de Cartera de Créditos
- R02 - Reporte de Provisiones
- R07 - Clasificación de Activos de Riesgo

Todos deben reflejar las 8 categorías correctas.

### 4.4 Impacto en Estados Financieros

Los cambios en provisiones afectarán:
- **Balance General**: Incremento en reservas de saneamiento
- **Estado de Resultados**: Gasto por provisiones
- **Indicadores Prudenciales**: Índice de cobertura de cartera

**RECOMENDACIÓN**: Coordinar con área Contable y Finanzas para ajustes contables necesarios.

---

## 5. CRONOGRAMA SUGERIDO

| Fase | Actividad | Responsable | Duración | Dependencias |
|------|-----------|-------------|----------|--------------|
| 1 | Validación con Cumplimiento | Oficial Cumplimiento | 2 días | - |
| 2 | Respaldo base de datos | DBA | 0.5 días | Fase 1 |
| 3 | Desarrollo script migración | Backend Dev | 3 días | Fase 1 |
| 4 | Pruebas en ambiente QA | QA Team | 5 días | Fase 3 |
| 5 | Validación Contabilidad | Contador | 2 días | Fase 4 |
| 6 | Aprobación SSF (si requiere) | Legal/Cumplimiento | 10 días | Fase 5 |
| 7 | Ejecución en PROD | DBA + DevOps | 0.5 días | Fase 6 |
| 8 | Monitoreo post-migración | Todos | 5 días | Fase 7 |

**Duración total estimada**: 4-5 semanas

---

## 6. RIESGOS Y MITIGACIÓN

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Provisiones insuficientes después de migración | Alto | Media | Análisis previo de impacto financiero, reserva de capital adicional |
| Errores en reclasificación de préstamos existentes | Alto | Baja | Pruebas exhaustivas en QA, validación muestra estadística |
| Reportes SSF rechazados | Alto | Media | Validación previa con oficial de cumplimiento, revisión de layout |
| Downtime prolongado en producción | Medio | Baja | Migración en horario no laboral, script probado, rollback plan |
| Datos históricos inconsistentes | Medio | Media | No eliminar clasificaciones antiguas, mantener auditoría |

---

## 7. CHECKLIST DE CUMPLIMIENTO

Antes de marcar como COMPLETO, verificar:

### Pre-Migración
- [ ] Aprobación de Oficial de Cumplimiento
- [ ] Aprobación de Área Contable
- [ ] Respaldo completo de base de datos
- [ ] Script de migración probado en QA
- [ ] Plan de rollback documentado
- [ ] Comunicación a usuarios del sistema

### Post-Migración
- [ ] Las 8 categorías existen y están activas
- [ ] Todos los préstamos reclasificados correctamente
- [ ] Provisiones recalculadas y validadas
- [ ] Reportes regulatorios actualizados
- [ ] Estados financieros ajustados
- [ ] Documentación actualizada
- [ ] Equipo capacitado en nueva clasificación

---

## 8. CONTACTOS Y REFERENCIAS

### Normativa
- **NCB-022 Oficial**: https://www.ssf.gob.sv/images/stories/desc_normas_contables_bancos/16_ncb-022.pdf
- **Ley de Bancos**: https://www.ssf.gob.sv/descargas/Leyes/Leyes%20Financieras/Ley%20de%20Bancos.pdf
- **Portal SSF**: https://www.ssf.gob.sv

### Soporte Técnico
- **Archivo actualizado**: `micro-app/backend/src/creditos/desembolso/services/clasificacion-prestamo.service.ts`
- **Entidad**: `micro-app/backend/src/creditos/desembolso/entities/clasificacion-prestamo.entity.ts`

### Fuentes de Investigación
- [Superintendencia del Sistema Financiero - NCB-022](https://www.ssf.gob.sv/images/stories/desc_normas_contables_bancos/16_ncb-022.pdf)
- [Universidad Dr. José Matías Delgado - Tesis NCB-022](https://webquery.ujmd.edu.sv/siab/bvirtual/BIBLIOTECA%20VIRTUAL/TESIS/30/MFE/ADRD0000855.pdf)
- [UTEC - NCB-022 Referencia](https://biblioteca.utec.edu.sv/interactiva/41804/Boletines/Normas/Contables/NC_Bancos/NCB-022.html)

---

## CONCLUSIÓN

Esta migración es **CRÍTICA** para el cumplimiento normativo de la institución financiera. El incumplimiento de NCB-022 puede resultar en:
- Sanciones de la SSF
- Observaciones en auditorías
- Riesgo reputacional
- Estados financieros incorrectos

Se recomienda ejecutar esta migración con la supervisión directa del área de Cumplimiento y con la validación del área Contable.

**IMPORTANTE**: Este documento es una guía técnica. Cada institución debe adaptar el proceso a su realidad operativa y validar con sus áreas de control.

---

**Documento preparado por**: Project Manager - Revisión de Cumplimiento NCB-022
**Fecha**: 2026-01-23
**Versión**: 1.0
