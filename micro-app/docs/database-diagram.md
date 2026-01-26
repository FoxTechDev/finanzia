# Diagrama de Base de Datos - Sistema de Microfinanzas

Generado: 2026-01-25 (Actualizado)

## Diagrama Entidad-Relacion (ERD)

```mermaid
erDiagram
    %% ==========================================
    %% USUARIOS Y AUTENTICACION
    %% ==========================================
    users {
        int id PK "AUTO_INCREMENT"
        varchar email UK "255"
        varchar password "255"
        varchar firstName "255"
        varchar lastName "255"
        tinyint isActive
        datetime createdAt
        datetime updatedAt
    }

    %% ==========================================
    %% GEOGRAFIA
    %% ==========================================
    departamento {
        int idDepartamento PK
        varchar nombreDepartamento "100"
    }

    municipio {
        int idMunicipio PK
        varchar nombreMunicipio "100"
        int idDepartamento FK
    }

    distrito {
        int idDistrito PK
        varchar nombreDistrito "100"
        int idMunicipio FK
    }

    departamento ||--o{ municipio : "tiene"
    municipio ||--o{ distrito : "tiene"

    %% ==========================================
    %% CLIENTES (PERSONAS)
    %% ==========================================
    persona {
        int idPersona PK
        varchar nombre "100"
        varchar apellido "100"
        date fechaNacimiento
        enum sexo "M/F/Otro"
        varchar nacionalidad "60"
        varchar estadoCivil "30"
        varchar telefono "30"
        varchar correoElectronico "120"
        varchar numeroDui "10"
        date fechaEmisionDui
        varchar lugarEmisionDui "120"
    }

    direccion {
        int idDireccion PK
        int idPersona FK
        int idDepartamento FK
        int idMunicipio FK
        int idDistrito FK
        varchar detalleDireccion "200"
    }

    actividad_economica {
        int idActividad PK
        int idPersona FK
        varchar tipoActividad "60"
        varchar nombreEmpresa "150"
        varchar cargoOcupacion "120"
        decimal ingresosMensuales "14,2"
        int idDepartamento FK
        int idMunicipio FK
        int idDistrito FK
        varchar detalleDireccion "200"
        decimal latitud "10,7"
        decimal longitud "10,7"
    }

    referencia_familiar {
        int idFamiliar PK
        int idPersona FK
        varchar nombreFamiliar "150"
        varchar parentesco "80"
        varchar telefonoFamiliar "30"
        varchar direccionFamiliar "200"
    }

    referencia_personal {
        int idReferencia PK
        int idPersona FK
        varchar nombreReferencia "150"
        varchar relacion "80"
        varchar telefonoReferencia "30"
        varchar direccionReferencia "200"
    }

    persona ||--o{ direccion : "tiene"
    persona ||--o{ actividad_economica : "tiene"
    persona ||--o{ referencia_familiar : "tiene"
    persona ||--o{ referencia_personal : "tiene"
    direccion }o--|| departamento : "ubicado en"
    direccion }o--|| municipio : "ubicado en"
    direccion }o--|| distrito : "ubicado en"
    actividad_economica }o--|| departamento : "ubicado en"
    actividad_economica }o--|| municipio : "ubicado en"
    actividad_economica }o--|| distrito : "ubicado en"

    %% ==========================================
    %% PRODUCTOS DE CREDITO
    %% ==========================================
    linea_credito {
        int id PK
        varchar codigo "10"
        varchar nombre "100"
        varchar descripcion "255"
        tinyint activo
        datetime createdAt
        datetime updatedAt
    }

    tipo_credito {
        int id PK
        varchar codigo "30"
        varchar nombre "150"
        text descripcion
        int lineaCreditoId FK
        decimal tasaInteres "6,2"
        decimal tasaInteresMinima "6,2"
        decimal tasaInteresMaxima "6,2"
        decimal tasaInteresMoratorio "6,2"
        decimal montoMinimo "14,2"
        decimal montoMaximo "14,2"
        int plazoMinimo
        int plazoMaximo
        varchar periodicidadPago "20"
        varchar tipoCuota "20"
        int diasGracia
        tinyint requiereGarantia
        date fechaVigenciaDesde
        date fechaVigenciaHasta
        tinyint activo
        datetime createdAt
        datetime updatedAt
    }

    linea_credito ||--o{ tipo_credito : "contiene"

    %% ==========================================
    %% SOLICITUDES DE CREDITO
    %% ==========================================
    solicitud {
        int id PK
        varchar numeroSolicitud "20"
        int personaId FK
        int lineaCreditoId FK
        int tipoCreditoId FK
        enum estado
        decimal montoSolicitado "14,2"
        int plazoSolicitado
        decimal tasaInteresPropuesta "5,2"
        enum destinoCredito
        date fechaSolicitud
        date fechaAnalisis
        date fechaAprobacion
        decimal montoAprobado "14,2"
        int plazoAprobado
        decimal tasaInteresAprobada "5,2"
        text observaciones
        text motivoRechazo
        int analistaId FK
        varchar nombreAnalista "150"
        int aprobadorId FK
        varchar nombreAprobador "150"
        text descripcionDestino
        date fechaVencimiento
        decimal scoreCredito "5,2"
        varchar categoriaRiesgo "1"
        text analisisAsesor
        enum recomendacionAsesor
        text comentariosRiesgo
        decimal capacidadPago "14,2"
        datetime createdAt
        datetime updatedAt
    }

    solicitud_historial {
        int id PK
        int solicitudId FK
        varchar estadoAnterior "20"
        varchar estadoNuevo "20"
        text observacion
        int usuarioId
        varchar nombreUsuario "150"
        varchar ipAddress "50"
        datetime fechaCambio
    }

    decision_comite {
        int id PK
        int solicitudId FK
        enum tipoDecision "AUTORIZADA/DENEGADA/OBSERVADA"
        text observaciones
        text condicionesEspeciales
        decimal montoAutorizado "14,2"
        int plazoAutorizado
        decimal tasaAutorizada "5,2"
        int usuarioId FK
        varchar nombreUsuario "150"
        datetime fechaDecision
        datetime createdAt
        datetime updatedAt
    }

    persona ||--o{ solicitud : "realiza"
    linea_credito ||--o{ solicitud : "pertenece"
    tipo_credito ||--o{ solicitud : "es de tipo"
    users ||--o{ solicitud : "analiza (analistaId)"
    users ||--o{ solicitud : "aprueba (aprobadorId)"
    solicitud ||--o{ solicitud_historial : "tiene"
    solicitud ||--o{ decision_comite : "tiene"
    users ||--o{ decision_comite : "registra"

    %% ==========================================
    %% GARANTIAS
    %% ==========================================
    tipo_garantia_catalogo {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        datetime createdAt
        datetime updatedAt
    }

    tipo_documento_garantia {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        datetime createdAt
        datetime updatedAt
    }

    tipo_inmueble {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        datetime createdAt
        datetime updatedAt
    }

    garantia {
        int id PK
        int solicitudId FK
        int tipoGarantiaId FK
        text descripcion
        decimal valorEstimado "14,2"
        enum estado "PENDIENTE/CONSTITUIDA/LIBERADA/EJECUTADA"
        date fechaConstitucion
        date fechaVencimiento
        text observaciones
        datetime createdAt
        datetime updatedAt
    }

    garantia_fiador {
        int id PK
        int garantiaId FK
        int personaFiadorId FK
        varchar parentesco "50"
        varchar ocupacion "100"
        decimal ingresoMensual "14,2"
        text direccionLaboral
        varchar telefonoLaboral "30"
        varchar lugarTrabajo "200"
    }

    garantia_hipotecaria {
        int id PK
        int garantiaId FK
        text direccion
        int municipioId FK
        int departamentoId FK
        int distritoId FK
        varchar numeroRegistro "50"
        varchar folioRegistro "50"
        varchar libroRegistro "50"
        decimal areaTerreno "10,2"
        decimal areaConstruccion "10,2"
        decimal valorPericial "14,2"
        varchar nombrePerito "150"
        date fechaAvaluo
        int tipoInmuebleId FK
    }

    garantia_prendaria {
        int id PK
        int garantiaId FK
        varchar tipoBien "100"
        text descripcionBien
        varchar marca "100"
        varchar modelo "100"
        varchar serie "100"
        varchar placa "20"
        int anio
        decimal valorPericial "14,2"
        text ubicacionBien
    }

    garantia_documentaria {
        int id PK
        int garantiaId FK
        int tipoDocumentoId FK
        varchar numeroDocumento "50"
        date fechaEmision
        decimal montoDocumento "14,2"
    }

    solicitud ||--o{ garantia : "tiene"
    tipo_garantia_catalogo ||--o{ garantia : "clasifica"
    garantia ||--o| garantia_fiador : "es fiador"
    garantia ||--o| garantia_hipotecaria : "es hipotecaria"
    garantia ||--o| garantia_prendaria : "es prendaria"
    garantia ||--o| garantia_documentaria : "es documentaria"
    persona ||--o{ garantia_fiador : "es fiador de"
    tipo_inmueble ||--o{ garantia_hipotecaria : "clasifica"
    tipo_documento_garantia ||--o{ garantia_documentaria : "clasifica"
    garantia_hipotecaria }o--|| municipio : "ubicado en"
    garantia_hipotecaria }o--|| departamento : "ubicado en"
    garantia_hipotecaria }o--|| distrito : "ubicado en"

    %% ==========================================
    %% PRESTAMOS
    %% ==========================================
    clasificacion_prestamo {
        int id PK
        varchar codigo "10"
        varchar nombre "100"
        text descripcion
        int diasMoraMinimo
        int diasMoraMaximo
        decimal porcentajeProvision "5,2"
        tinyint activo
        int orden
        datetime createdAt
        datetime updatedAt
    }

    estado_prestamo {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
        datetime createdAt
        datetime updatedAt
    }

    tipo_deduccion {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        enum tipoCalculoDefault "FIJO/PORCENTAJE"
        decimal valorDefault "14,4"
        tinyint activo
        datetime createdAt
        datetime updatedAt
    }

    tipo_recargo {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        enum tipoCalculoDefault "FIJO/PORCENTAJE"
        decimal valorDefault "14,4"
        tinyint activo
        datetime createdAt
        datetime updatedAt
    }

    prestamo {
        int id PK
        int solicitudId FK
        int personaId FK
        varchar numeroCredito "20"
        int tipoCreditoId FK
        decimal montoAutorizado "14,2"
        decimal montoDesembolsado "14,2"
        int plazoAutorizado
        decimal tasaInteres "8,4"
        decimal tasaInteresMoratorio "8,4"
        enum tipoInteres "FLAT/AMORTIZADO"
        enum periodicidadPago
        decimal cuotaNormal "14,2"
        decimal cuotaTotal "14,2"
        int numeroCuotas
        decimal totalInteres "14,2"
        decimal totalRecargos "14,2"
        decimal totalPagar "14,2"
        decimal saldoCapital "14,2"
        decimal saldoInteres "14,2"
        decimal capitalMora "14,2"
        decimal interesMora "14,2"
        int diasMora
        date fechaOtorgamiento
        date fechaPrimeraCuota
        date fechaVencimiento
        date fechaUltimoPago
        date fechaCancelacion
        enum categoriaNCB022 "A/B/C/D/E"
        enum estado "VIGENTE/MORA/CANCELADO/CASTIGADO"
        int usuarioDesembolsoId FK
        varchar nombreUsuarioDesembolso "150"
        int clasificacionPrestamoId FK
        int estadoPrestamoId FK
        datetime createdAt
        datetime updatedAt
    }

    deduccion_prestamo {
        int id PK
        int prestamoId FK
        int tipoDeduccionId FK
        varchar nombre "100"
        enum tipoCalculo "FIJO/PORCENTAJE"
        decimal valor "14,4"
        decimal montoCalculado "14,2"
        datetime createdAt
        datetime updatedAt
    }

    recargo_prestamo {
        int id PK
        int prestamoId FK
        int tipoRecargoId FK
        varchar nombre "100"
        enum tipoCalculo "FIJO/PORCENTAJE"
        decimal valor "14,4"
        decimal montoCalculado "14,2"
        int aplicaDesde
        int aplicaHasta
        datetime createdAt
        datetime updatedAt
    }

    solicitud ||--o| prestamo : "genera"
    persona ||--o{ prestamo : "tiene"
    tipo_credito ||--o{ prestamo : "es de tipo"
    users ||--o{ prestamo : "desembolsa"
    clasificacion_prestamo ||--o{ prestamo : "clasifica"
    estado_prestamo ||--o{ prestamo : "estado"
    prestamo ||--o{ deduccion_prestamo : "tiene"
    prestamo ||--o{ recargo_prestamo : "tiene"
    tipo_deduccion ||--o{ deduccion_prestamo : "tipo"
    tipo_recargo ||--o{ recargo_prestamo : "tipo"

    %% ==========================================
    %% PLAN DE PAGOS Y PAGOS
    %% ==========================================
    plan_pago {
        int id PK
        int prestamoId FK
        int numeroCuota
        date fechaVencimiento
        decimal capital "14,2"
        decimal interes "14,2"
        decimal recargos "14,2"
        decimal cuotaTotal "14,2"
        decimal saldoCapital "14,2"
        decimal capitalPagado "14,2"
        decimal interesPagado "14,2"
        decimal recargosPagado "14,2"
        date fechaPago
        int diasMora
        decimal interesMoratorio "14,2"
        decimal interesMoratorioPagado "14,2"
        enum estado "PENDIENTE/PAGADA/PARCIAL/MORA"
        datetime createdAt
        datetime updatedAt
    }

    pago {
        int id PK
        int prestamoId FK
        varchar numeroPago "20"
        date fechaPago
        datetime fechaRegistro
        decimal montoPagado "14,2"
        decimal capitalAplicado "14,2"
        decimal interesAplicado "14,2"
        decimal recargosAplicado "14,2"
        decimal interesMoratorioAplicado "14,2"
        decimal saldoCapitalAnterior "14,2"
        decimal saldoInteresAnterior "14,2"
        decimal capitalMoraAnterior "14,2"
        decimal interesMoraAnterior "14,2"
        int diasMoraAnterior
        decimal saldoCapitalPosterior "14,2"
        decimal saldoInteresPosterior "14,2"
        enum tipoPago
        enum estado "APLICADO/ANULADO"
        datetime fechaAnulacion
        text motivoAnulacion
        int usuarioAnulacionId
        varchar nombreUsuarioAnulacion "150"
        int usuarioId
        varchar nombreUsuario "150"
        text observaciones
        datetime createdAt
        datetime updatedAt
    }

    pago_detalle_cuota {
        int id PK
        int pagoId FK
        int planPagoId FK
        int numeroCuota
        decimal capitalAplicado "14,2"
        decimal interesAplicado "14,2"
        decimal recargosAplicado "14,2"
        decimal interesMoratorioAplicado "14,2"
        enum estadoCuotaAnterior
        decimal capitalPagadoAnterior "14,2"
        decimal interesPagadoAnterior "14,2"
        decimal recargosPagadoAnterior "14,2"
        decimal interesMoratorioPagadoAnterior "14,2"
        int diasMoraAnterior
        enum estadoCuotaPosterior
        datetime createdAt
    }

    prestamo ||--o{ plan_pago : "tiene"
    prestamo ||--o{ pago : "recibe"
    pago ||--o{ pago_detalle_cuota : "detalla"
    plan_pago ||--o{ pago_detalle_cuota : "afecta"

    %% ==========================================
    %% CATALOGOS GENERALES
    %% ==========================================
    sexo {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    estado_solicitud {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    estado_garantia {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    destino_credito {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    estado_cuota {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    tipo_interes {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    periodicidad_pago {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    tipo_calculo {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    tipo_pago {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    estado_pago {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    recomendacion_asesor {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }

    tipo_decision_comite {
        int id PK
        varchar codigo "20"
        varchar nombre "100"
        text descripcion
        tinyint activo
        int orden
        varchar color "7"
    }
```

## Resumen de Relaciones (Foreign Keys)

### Usuarios
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| solicitud | analistaId | users | id |
| solicitud | aprobadorId | users | id |
| prestamo | usuarioDesembolsoId | users | id |
| decision_comite | usuarioId | users | id |

### Personas y Datos Relacionados
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| direccion | idPersona | persona | idPersona |
| actividad_economica | idPersona | persona | idPersona |
| referencia_familiar | idPersona | persona | idPersona |
| referencia_personal | idPersona | persona | idPersona |
| solicitud | personaId | persona | idPersona |
| prestamo | personaId | persona | idPersona |
| garantia_fiador | personaFiadorId | persona | idPersona |

### Geografia
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| municipio | idDepartamento | departamento | idDepartamento |
| distrito | idMunicipio | municipio | idMunicipio |
| direccion | idDepartamento | departamento | idDepartamento |
| direccion | idMunicipio | municipio | idMunicipio |
| direccion | idDistrito | distrito | idDistrito |
| actividad_economica | idDepartamento | departamento | idDepartamento |
| actividad_economica | idMunicipio | municipio | idMunicipio |
| actividad_economica | idDistrito | distrito | idDistrito |
| garantia_hipotecaria | departamentoId | departamento | idDepartamento |
| garantia_hipotecaria | municipioId | municipio | idMunicipio |
| garantia_hipotecaria | distritoId | distrito | idDistrito |

### Productos de Credito
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| tipo_credito | lineaCreditoId | linea_credito | id |
| solicitud | lineaCreditoId | linea_credito | id |
| solicitud | tipoCreditoId | tipo_credito | id |
| prestamo | tipoCreditoId | tipo_credito | id |

### Solicitudes
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| solicitud_historial | solicitudId | solicitud | id |
| decision_comite | solicitudId | solicitud | id |
| garantia | solicitudId | solicitud | id |
| prestamo | solicitudId | solicitud | id |

### Garantias
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| garantia | tipoGarantiaId | tipo_garantia_catalogo | id |
| garantia_fiador | garantiaId | garantia | id |
| garantia_hipotecaria | garantiaId | garantia | id |
| garantia_hipotecaria | tipoInmuebleId | tipo_inmueble | id |
| garantia_prendaria | garantiaId | garantia | id |
| garantia_documentaria | garantiaId | garantia | id |
| garantia_documentaria | tipoDocumentoId | tipo_documento_garantia | id |

### Prestamos
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| prestamo | clasificacionPrestamoId | clasificacion_prestamo | id |
| prestamo | estadoPrestamoId | estado_prestamo | id |
| deduccion_prestamo | prestamoId | prestamo | id |
| deduccion_prestamo | tipoDeduccionId | tipo_deduccion | id |
| recargo_prestamo | prestamoId | prestamo | id |
| recargo_prestamo | tipoRecargoId | tipo_recargo | id |
| plan_pago | prestamoId | prestamo | id |
| pago | prestamoId | prestamo | id |

### Pagos
| Tabla Origen | Columna | Tabla Destino | Columna |
|-------------|---------|---------------|---------|
| pago_detalle_cuota | pagoId | pago | id |
| pago_detalle_cuota | planPagoId | plan_pago | id |

## Estadisticas de la Base de Datos

- **Total de Tablas**: 45
- **Tablas de Catalogos**: 16
- **Tablas Transaccionales**: 15
- **Tablas de Soporte**: 14
- **Total de Foreign Keys**: 43

## Cambios Recientes (2026-01-25)

1. **users.id**: Cambiado de UUID (VARCHAR(36)) a INT AUTO_INCREMENT
2. **Foreign Keys de Users**: Creadas las siguientes relaciones:
   - `solicitud.analistaId -> users.id`
   - `solicitud.aprobadorId -> users.id`
   - `prestamo.usuarioDesembolsoId -> users.id`
   - `decision_comite.usuarioId -> users.id`
3. **prestamo.tasaInteres**: Precision aumentada de DECIMAL(6,4) a DECIMAL(8,4)
4. **Tablas normalizadas a snake_case**:
   - `linea_credito`, `tipo_credito`, `actividad_economica`
   - `referencia_familiar`, `referencia_personal`, `solicitud_historial`
5. **Tablas legacy eliminadas**:
   - `lineacredito` (reemplazada por `linea_credito`)
   - `referenciafamiliar` (reemplazada por `referencia_familiar`)
   - `referenciapersonal` (reemplazada por `referencia_personal`)
   - `solicitudhistorial` (reemplazada por `solicitud_historial`)

## Notas

- TypeORM `synchronize` esta desactivado para evitar conflictos
- Todas las tablas de catalogos siguen la estructura estandar: id, codigo, nombre, descripcion, activo, orden, color, timestamps
