const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak, ImageRun } = require('docx');
const fs = require('fs');
const path = require('path');

// Directorio de capturas
const screenshotsDir = path.join(__dirname, 'capturas_manual');

// Función para cargar imagen si existe
function loadImageIfExists(filename) {
    const imagePath = path.join(screenshotsDir, filename);
    if (fs.existsSync(imagePath)) {
        return fs.readFileSync(imagePath);
    }
    return null;
}

// Función para crear párrafo de imagen o placeholder
function createImageOrPlaceholder(filename, caption) {
    const imageData = loadImageIfExists(filename);
    if (imageData) {
        return [
            new Paragraph({
                children: [
                    new ImageRun({
                        data: imageData,
                        transformation: { width: 500, height: 300 },
                    }),
                ],
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [new TextRun({ text: caption, italics: true, size: 20 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
        ];
    }
    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: `[INSERTAR CAPTURA: ${caption}]`,
                    italics: true,
                    color: "888888",
                    size: 22
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            border: {
                top: { style: BorderStyle.DASHED, size: 1, color: "CCCCCC" },
                bottom: { style: BorderStyle.DASHED, size: 1, color: "CCCCCC" },
                left: { style: BorderStyle.DASHED, size: 1, color: "CCCCCC" },
                right: { style: BorderStyle.DASHED, size: 1, color: "CCCCCC" },
            },
        }),
    ];
}

// Función para crear tabla
function createTable(headers, rows) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: headers.map(h => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: h, bold: true, size: 22 })],
                        alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "1976D2" },
                })),
                tableHeader: true,
            }),
            ...rows.map((row, idx) => new TableRow({
                children: row.map(cell => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: cell, size: 22 })],
                    })],
                    shading: { fill: idx % 2 === 0 ? "FFFFFF" : "F5F5F5" },
                })),
            })),
        ],
    });
}

// Crear documento
const doc = new Document({
    styles: {
        paragraphStyles: [
            {
                id: "Normal",
                name: "Normal",
                run: { size: 24 },
                paragraph: { spacing: { line: 276, after: 120 } },
            },
        ],
    },
    sections: [{
        properties: {},
        children: [
            // PORTADA
            new Paragraph({ spacing: { before: 2000 } }),
            new Paragraph({
                children: [new TextRun({ text: "MANUAL DE USUARIO", bold: true, size: 56, color: "1976D2" })],
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [new TextRun({ text: "SISTEMA FINANZIA", bold: true, size: 48, color: "333333" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
            }),
            new Paragraph({
                children: [new TextRun({ text: "Sistema de Gestión de Microcréditos", size: 32, italics: true })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
            }),
            new Paragraph({ spacing: { before: 1500 } }),
            new Paragraph({
                children: [new TextRun({ text: "FINANZIA S.C. DE R.L. DE C.V.", bold: true, size: 28 })],
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [new TextRun({ text: "Versión 1.0 - Enero 2026", size: 24 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 },
            }),
            new Paragraph({ children: [new PageBreak()] }),

            // TABLA DE CONTENIDO
            new Paragraph({
                text: "TABLA DE CONTENIDO",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),
            new Paragraph({ children: [new TextRun({ text: "1. Ingreso de Clientes", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Registro de Solicitudes de Crédito", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "3. Análisis del Asesor", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "4. Resolución del Comité de Crédito", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "5. Desembolso del Préstamo", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "6. Registro de Pagos", size: 24 })] }),
            new Paragraph({ children: [new PageBreak()] }),

            // ==================== SECCIÓN 1: CLIENTES ====================
            new Paragraph({
                text: "1. INGRESO DE CLIENTES",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),

            new Paragraph({
                text: "1.1 Acceso al Módulo",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ children: [new TextRun({ text: "1. Inicie sesión en el sistema FINANZIA", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. En el menú lateral, seleccione ", size: 24 }), new TextRun({ text: "Clientes > Nuevo Cliente", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "3. También puede acceder desde ", size: 24 }), new TextRun({ text: "Clientes > Lista de Clientes", bold: true, size: 24 }), new TextRun({ text: " y hacer clic en el botón ", size: 24 }), new TextRun({ text: "+ Nuevo Cliente", bold: true, size: 24 })] }),

            ...createImageOrPlaceholder("01_menu_clientes.png", "Figura 1.1 - Menú de acceso al módulo de Clientes"),

            new Paragraph({
                text: "1.2 Formulario de Registro",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            new Paragraph({ children: [new TextRun({ text: "El formulario de registro de clientes consta de 3 pasos:", size: 24 })] }),

            new Paragraph({
                text: "PASO 1: Datos Personales",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Complete los siguientes campos:", size: 24 })], spacing: { after: 200 } }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Nombre", "Nombre(s) del cliente", "✓"],
                    ["Apellido", "Apellidos del cliente", "✓"],
                    ["Fecha de Nacimiento", "Formato DD/MM/AAAA", "✓"],
                    ["Género", "Masculino, Femenino u Otro", "-"],
                    ["Nacionalidad", "País de origen", "✓"],
                    ["Estado Civil", "Soltero/a, Casado/a, Divorciado/a, Viudo/a, Unión libre", "-"],
                    ["Teléfono", "Número de contacto principal", "-"],
                    ["Correo Electrónico", "Email válido", "-"],
                    ["Número de DUI", "Documento Único de Identidad (único)", "✓"],
                    ["Fecha de Expedición DUI", "Fecha en que se emitió el DUI", "✓"],
                    ["Lugar de Expedición", "Lugar donde se emitió el DUI", "✓"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            ...createImageOrPlaceholder("02_cliente_paso1.png", "Figura 1.2 - Formulario de Datos Personales del Cliente"),

            new Paragraph({
                text: "PASO 2: Dirección de Domicilio",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Departamento", "Seleccione de la lista", "✓"],
                    ["Municipio", "Se carga según el departamento", "✓"],
                    ["Distrito", "Se carga según el municipio", "✓"],
                    ["Dirección Detallada", "Colonia, calle, número, referencias", "-"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            ...createImageOrPlaceholder("03_cliente_paso2.png", "Figura 1.3 - Formulario de Dirección del Cliente"),

            new Paragraph({
                text: "PASO 3: Actividad Económica",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Tipo de Actividad", "Empleado, Independiente, Empresario, Jubilado, Estudiante, Otro", "✓"],
                    ["Nombre de Empresa", "Donde labora o nombre del negocio propio", "-"],
                    ["Ocupación/Cargo", "Puesto que desempeña", "-"],
                    ["Ingreso Mensual", "Ingreso aproximado en USD", "-"],
                    ["Departamento (trabajo)", "Ubicación del trabajo/negocio", "✓"],
                    ["Municipio (trabajo)", "Se carga según departamento", "✓"],
                    ["Distrito (trabajo)", "Se carga según municipio", "✓"],
                    ["Dirección del Trabajo", "Dirección detallada", "-"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            ...createImageOrPlaceholder("04_cliente_paso3.png", "Figura 1.4 - Formulario de Actividad Económica"),

            new Paragraph({
                text: "1.3 Referencias",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Se recomienda agregar al menos una referencia personal y una familiar:", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Referencias Personales: ", bold: true, size: 24 }), new TextRun({ text: "Nombre, relación (Amigo, Vecino, etc.) y teléfono", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Referencias Familiares: ", bold: true, size: 24 }), new TextRun({ text: "Nombre, parentesco y teléfono", size: 24 })] }),

            ...createImageOrPlaceholder("05_cliente_referencias.png", "Figura 1.5 - Sección de Referencias"),

            new Paragraph({ children: [new PageBreak()] }),

            // ==================== SECCIÓN 2: SOLICITUDES ====================
            new Paragraph({
                text: "2. REGISTRO DE SOLICITUDES DE CRÉDITO",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),

            new Paragraph({
                text: "2.1 Acceso al Módulo",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ children: [new TextRun({ text: "1. En el menú lateral, seleccione ", size: 24 }), new TextRun({ text: "Créditos > Solicitudes", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Haga clic en el botón ", size: 24 }), new TextRun({ text: "+ Nueva Solicitud", bold: true, size: 24 })] }),

            ...createImageOrPlaceholder("06_lista_solicitudes.png", "Figura 2.1 - Lista de Solicitudes de Crédito"),

            new Paragraph({
                text: "2.2 Formulario de Solicitud (5 Pasos)",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),

            new Paragraph({
                text: "PASO 1: Selección del Cliente",
                heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({ children: [new TextRun({ text: "1. En el campo de búsqueda, escriba el DUI, nombre o apellido del cliente", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Seleccione el cliente de la lista de resultados", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "3. Verifique los datos mostrados y haga clic en Siguiente", size: 24 })] }),

            ...createImageOrPlaceholder("07_solicitud_paso1.png", "Figura 2.2 - Selección del Cliente"),

            new Paragraph({
                text: "PASO 2: Tipo de Crédito y Destino",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Línea de Crédito", "Categoría principal del crédito", "✓"],
                    ["Tipo de Crédito", "Producto específico dentro de la línea", "✓"],
                    ["Destino del Crédito", "Para qué se utilizará el dinero", "✓"],
                    ["Descripción del Destino", "Detalle adicional del uso", "-"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Destinos de Crédito Disponibles:", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Capital de Trabajo • Activo Fijo • Consumo Personal • Vivienda Nueva", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Vivienda Usada • Mejora de Vivienda • Consolidación de Deudas", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Educación • Salud • Vehículo • Otro", size: 22 })] }),

            ...createImageOrPlaceholder("08_solicitud_paso2.png", "Figura 2.3 - Tipo de Crédito y Destino"),

            new Paragraph({
                text: "PASO 3: Condiciones del Crédito",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Monto Solicitado", "Cantidad en USD que solicita el cliente", "✓"],
                    ["Plazo Solicitado", "Número de meses para pagar", "✓"],
                    ["Tasa de Interés", "Porcentaje anual de interés", "✓"],
                    ["Fecha de Solicitud", "Fecha de registro de la solicitud", "✓"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            ...createImageOrPlaceholder("09_solicitud_paso3.png", "Figura 2.4 - Condiciones del Crédito"),

            new Paragraph({
                text: "PASO 4: Garantías",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Si el tipo de crédito requiere garantía, debe registrar al menos una. Tipos disponibles:", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Garantía Hipotecaria: ", bold: true, size: 24 }), new TextRun({ text: "Inmuebles (casa, terreno, local)", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Garantía Prendaria: ", bold: true, size: 24 }), new TextRun({ text: "Bienes muebles (vehículo, maquinaria)", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Garantía Fiduciaria: ", bold: true, size: 24 }), new TextRun({ text: "Fiador (debe estar registrado como cliente)", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Garantía Documentaria: ", bold: true, size: 24 }), new TextRun({ text: "Documentos (pagaré, letra de cambio)", size: 24 })] }),

            ...createImageOrPlaceholder("10_solicitud_garantias.png", "Figura 2.5 - Registro de Garantías"),

            new Paragraph({ children: [new PageBreak()] }),

            // ==================== SECCIÓN 3: ANÁLISIS ====================
            new Paragraph({
                text: "3. ANÁLISIS DEL ASESOR",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),

            new Paragraph({
                text: "3.1 Acceso a la Solicitud",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ children: [new TextRun({ text: "1. Vaya a ", size: 24 }), new TextRun({ text: "Créditos > Solicitudes", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Busque y seleccione la solicitud a analizar", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "3. Acceda a la pestaña ", size: 24 }), new TextRun({ text: "Análisis del Asesor", bold: true, size: 24 })] }),

            ...createImageOrPlaceholder("11_detalle_solicitud.png", "Figura 3.1 - Detalle de la Solicitud"),

            new Paragraph({
                text: "3.2 Completar el Análisis",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Análisis Detallado", "Evaluación completa del caso", "✓"],
                    ["Antecedentes del Cliente", "Historial, comportamiento de pago, referencias", "-"],
                    ["Capacidad de Pago Mensual", "Monto que puede pagar según análisis", "-"],
                    ["Recomendación", "APROBAR, RECHAZAR u OBSERVAR", "-"],
                ]
            ),

            new Paragraph({ spacing: { before: 300 } }),
            new Paragraph({ children: [new TextRun({ text: "El análisis debe incluir:", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Evaluación de Ingresos: ", bold: true, size: 22 }), new TextRun({ text: "fuente, estabilidad, ingresos adicionales", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Evaluación de Gastos: ", bold: true, size: 22 }), new TextRun({ text: "gastos fijos, otras deudas, dependientes", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Capacidad de Pago: ", bold: true, size: 22 }), new TextRun({ text: "ingreso disponible, relación cuota/ingreso", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Evaluación de Garantías: ", bold: true, size: 22 }), new TextRun({ text: "calidad y cobertura", size: 22 })] }),

            ...createImageOrPlaceholder("12_analisis_asesor.png", "Figura 3.2 - Formulario de Análisis del Asesor"),

            new Paragraph({
                text: "3.3 Recomendaciones",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),

            createTable(
                ["Recomendación", "Descripción"],
                [
                    ["APROBAR", "El asesor considera que el crédito es viable y recomienda su aprobación"],
                    ["RECHAZAR", "El asesor identifica riesgos significativos y no recomienda el crédito"],
                    ["OBSERVAR", "Requiere información adicional o tiene condiciones especiales"],
                ]
            ),

            new Paragraph({ spacing: { before: 300 } }),
            new Paragraph({ children: [new TextRun({ text: "Una vez completado el análisis:", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "1. Haga clic en ", size: 24 }), new TextRun({ text: "Guardar Análisis", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Luego haga clic en ", size: 24 }), new TextRun({ text: "Enviar al Comité", bold: true, size: 24 })] }),

            new Paragraph({ children: [new PageBreak()] }),

            // ==================== SECCIÓN 4: COMITÉ ====================
            new Paragraph({
                text: "4. RESOLUCIÓN DEL COMITÉ DE CRÉDITO",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),

            new Paragraph({
                text: "4.1 Acceso al Módulo",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ children: [new TextRun({ text: "1. En el menú lateral, seleccione ", size: 24 }), new TextRun({ text: "Créditos > Comité de Crédito", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Verá la lista de solicitudes pendientes de resolución", size: 24 })] }),

            ...createImageOrPlaceholder("13_bandeja_comite.png", "Figura 4.1 - Bandeja del Comité de Crédito"),

            new Paragraph({
                text: "4.2 Revisar la Solicitud",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Al seleccionar una solicitud, el comité puede ver:", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Resumen de la solicitud: ", bold: true, size: 22 }), new TextRun({ text: "número, cliente, tipo, monto, plazo, tasa", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Análisis del asesor: ", bold: true, size: 22 }), new TextRun({ text: "recomendación, análisis, capacidad de pago", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Garantías: ", bold: true, size: 22 }), new TextRun({ text: "lista de garantías y porcentaje de cobertura", size: 22 })] }),

            ...createImageOrPlaceholder("14_revision_comite.png", "Figura 4.2 - Revisión de Solicitud por el Comité"),

            new Paragraph({
                text: "4.3 Registrar la Decisión",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Haga clic en ", size: 24 }), new TextRun({ text: "Registrar Decisión", bold: true, size: 24 }), new TextRun({ text: " para abrir el formulario de resolución.", size: 24 })] }),

            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "A. AUTORIZAR (Aprobar)", bold: true, size: 24, color: "2E7D32" })] }),
            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Monto Autorizado", "Puede ser igual o menor al solicitado", "✓"],
                    ["Plazo Autorizado", "Meses aprobados para el pago", "✓"],
                    ["Tasa Autorizada", "Tasa de interés aprobada", "✓"],
                    ["Condiciones Especiales", "Observaciones adicionales", "-"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "B. DENEGAR (Rechazar)", bold: true, size: 24, color: "C62828" })] }),
            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Motivo del Rechazo", "Razón detallada de la denegación", "✓"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "C. OBSERVAR", bold: true, size: 24, color: "F57C00" })] }),
            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Observaciones", "Información o documentos requeridos", "✓"],
                ]
            ),

            ...createImageOrPlaceholder("15_decision_comite.png", "Figura 4.3 - Formulario de Decisión del Comité"),

            new Paragraph({ children: [new PageBreak()] }),

            // ==================== SECCIÓN 5: DESEMBOLSO ====================
            new Paragraph({
                text: "5. DESEMBOLSO DEL PRÉSTAMO",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),

            new Paragraph({
                text: "5.1 Acceso al Módulo",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ children: [new TextRun({ text: "1. En el menú lateral, seleccione ", size: 24 }), new TextRun({ text: "Créditos > Desembolsos", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Verá las solicitudes aprobadas pendientes de desembolso", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "3. Seleccione la solicitud y haga clic en ", size: 24 }), new TextRun({ text: "Desembolsar", bold: true, size: 24 })] }),

            ...createImageOrPlaceholder("16_bandeja_desembolso.png", "Figura 5.1 - Bandeja de Desembolsos"),

            new Paragraph({
                text: "5.2 Configuración del Desembolso (4 Pasos)",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),

            new Paragraph({
                text: "PASO 1: Configuración General",
                heading: HeadingLevel.HEADING_3,
            }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Periodicidad de Pago", "Frecuencia de las cuotas", "✓"],
                    ["Tipo de Interés", "FLAT o AMORTIZADO", "✓"],
                    ["Fecha Primera Cuota", "Cuándo vence la primera cuota", "✓"],
                ]
            ),

            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Periodicidades: ", bold: true, size: 22 }), new TextRun({ text: "Diario, Semanal, Quincenal, Mensual, Trimestral, Semestral, Anual, Al Vencimiento", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "Tipos de Interés:", bold: true, size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• FLAT: ", bold: true, size: 22 }), new TextRun({ text: "Interés sobre monto original durante todo el plazo", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• AMORTIZADO: ", bold: true, size: 22 }), new TextRun({ text: "Interés sobre saldo (sistema francés)", size: 22 })] }),

            ...createImageOrPlaceholder("17_desembolso_paso1.png", "Figura 5.2 - Configuración General del Desembolso"),

            new Paragraph({
                text: "PASO 2: Deducciones",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Las deducciones se descuentan del monto autorizado antes del desembolso:", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Gastos de formalización", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Seguro de desgravamen", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Comisión por apertura", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Gastos de papelería", size: 22 })] }),

            ...createImageOrPlaceholder("18_desembolso_deducciones.png", "Figura 5.3 - Configuración de Deducciones"),

            new Paragraph({
                text: "PASO 3: Cargos/Recargos",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Los cargos se agregan a cada cuota del préstamo:", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Seguro de vida o de bien", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Ahorro programado", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Servicio de GPS (vehículos)", size: 22 })] }),

            ...createImageOrPlaceholder("19_desembolso_cargos.png", "Figura 5.4 - Configuración de Cargos"),

            new Paragraph({
                text: "PASO 4: Confirmación",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Revise el resumen completo antes de confirmar:", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Monto Autorizado - Deducciones = Monto a Desembolsar", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Número de cuotas y monto de cada una", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Plan de pagos completo con fechas de vencimiento", size: 22 })] }),

            ...createImageOrPlaceholder("20_desembolso_confirmacion.png", "Figura 5.5 - Confirmación del Desembolso"),

            new Paragraph({ children: [new PageBreak()] }),

            // ==================== SECCIÓN 6: PAGOS ====================
            new Paragraph({
                text: "6. REGISTRO DE PAGOS",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),

            new Paragraph({
                text: "6.1 Acceso al Módulo",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ children: [new TextRun({ text: "Opción A: Desde ", size: 24 }), new TextRun({ text: "Créditos > Préstamos", bold: true, size: 24 }), new TextRun({ text: ", busque el préstamo y seleccione ", size: 24 }), new TextRun({ text: "Registrar Pago", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "Opción B: Desde ", size: 24 }), new TextRun({ text: "Créditos > Consulta de Pagos", bold: true, size: 24 }), new TextRun({ text: ", busque el préstamo y haga clic en ", size: 24 }), new TextRun({ text: "Nuevo Pago", bold: true, size: 24 })] }),

            ...createImageOrPlaceholder("21_lista_prestamos.png", "Figura 6.1 - Lista de Préstamos"),

            new Paragraph({
                text: "6.2 Formulario de Pago",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),

            createTable(
                ["Campo", "Descripción", "Obligatorio"],
                [
                    ["Fecha de Pago", "Fecha en que se realiza el pago", "✓"],
                    ["Monto a Pagar", "Cantidad que el cliente paga", "✓"],
                    ["Observaciones", "Notas adicionales", "-"],
                ]
            ),

            ...createImageOrPlaceholder("22_formulario_pago.png", "Figura 6.2 - Formulario de Registro de Pago"),

            new Paragraph({
                text: "6.3 Vista Previa del Pago",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            new Paragraph({ children: [new TextRun({ text: "Antes de confirmar, el sistema muestra:", size: 24 })] }),

            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Resumen de Adeudo:", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Capital Pendiente", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Interés Pendiente", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Cargos Pendientes", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Interés Moratorio (si hay mora)", size: 22 })] }),

            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "Distribución del Pago:", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "El sistema aplica el pago en este orden:", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "1. Interés Moratorio → 2. Interés Corriente → 3. Cargos → 4. Capital", size: 22 })] }),

            ...createImageOrPlaceholder("23_preview_pago.png", "Figura 6.3 - Vista Previa del Pago"),

            new Paragraph({
                text: "6.4 Tipos de Pago",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),

            createTable(
                ["Tipo", "Descripción"],
                [
                    ["CUOTA COMPLETA", "Se pagó una o más cuotas completas"],
                    ["PAGO PARCIAL", "Se pagó parte de una cuota"],
                    ["PAGO ADELANTADO", "Se pagó más de lo adeudado actualmente"],
                    ["CANCELACIÓN TOTAL", "Se liquidó todo el préstamo"],
                ]
            ),

            new Paragraph({
                text: "6.5 Confirmar y Recibo",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            new Paragraph({ children: [new TextRun({ text: "1. Revise la distribución del pago", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "2. Verifique las cuotas afectadas", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "3. Haga clic en ", size: 24 }), new TextRun({ text: "Confirmar Pago", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: "4. Imprima el recibo para el cliente", size: 24 })] }),

            ...createImageOrPlaceholder("24_recibo_pago.png", "Figura 6.4 - Recibo de Pago"),

            new Paragraph({ children: [new PageBreak()] }),

            // ==================== ANEXOS ====================
            new Paragraph({
                text: "ANEXOS",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
            }),

            new Paragraph({
                text: "A. Estados de una Solicitud",
                heading: HeadingLevel.HEADING_2,
            }),
            createTable(
                ["Estado", "Descripción"],
                [
                    ["CREADA", "Solicitud recién registrada"],
                    ["PENDIENTE_ANÁLISIS", "Esperando análisis del asesor"],
                    ["ENVIADA_A_COMITÉ", "En revisión por el comité"],
                    ["APROBADA", "Autorizada por el comité"],
                    ["DENEGADA", "Rechazada por el comité"],
                    ["OBSERVADA", "Requiere información adicional"],
                    ["LISTA_DESEMBOLSO", "Aprobada y lista para desembolsar"],
                    ["DESEMBOLSADA", "Préstamo activo creado"],
                ]
            ),

            new Paragraph({
                text: "B. Estados de un Préstamo",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            createTable(
                ["Estado", "Descripción"],
                [
                    ["VIGENTE", "Préstamo activo al día"],
                    ["MORA", "Préstamo con cuotas vencidas"],
                    ["CANCELADO", "Préstamo totalmente pagado"],
                    ["CASTIGADO", "Préstamo irrecuperable"],
                ]
            ),

            new Paragraph({
                text: "C. Clasificación de Riesgo (NCB-022)",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            createTable(
                ["Categoría", "Días de Mora", "Provisión"],
                [
                    ["A - Normal", "0-30 días", "1%"],
                    ["B - Subnormal", "31-90 días", "5%"],
                    ["C - Deficiente", "91-180 días", "20%"],
                    ["D - Difícil Cobro", "181-360 días", "50%"],
                    ["E - Irrecuperable", ">360 días", "100%"],
                ]
            ),

            new Paragraph({ spacing: { before: 600 } }),
            new Paragraph({
                children: [new TextRun({ text: "FINANZIA S.C. DE R.L. DE C.V.", bold: true, size: 24 })],
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [new TextRun({ text: "Manual de Usuario v1.0 - Enero 2026", italics: true, size: 20 })],
                alignment: AlignmentType.CENTER,
            }),
        ],
    }],
});

// Crear directorio de capturas si no existe
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log(`\nDirectorio creado: ${screenshotsDir}`);
    console.log('\nPor favor, guarde las capturas de pantalla con los siguientes nombres:');
    console.log('─'.repeat(60));
    const screenshots = [
        '01_menu_clientes.png - Menú de Clientes',
        '02_cliente_paso1.png - Formulario Datos Personales',
        '03_cliente_paso2.png - Formulario Dirección',
        '04_cliente_paso3.png - Formulario Actividad Económica',
        '05_cliente_referencias.png - Referencias',
        '06_lista_solicitudes.png - Lista de Solicitudes',
        '07_solicitud_paso1.png - Selección de Cliente',
        '08_solicitud_paso2.png - Tipo de Crédito',
        '09_solicitud_paso3.png - Condiciones',
        '10_solicitud_garantias.png - Garantías',
        '11_detalle_solicitud.png - Detalle de Solicitud',
        '12_analisis_asesor.png - Análisis del Asesor',
        '13_bandeja_comite.png - Bandeja del Comité',
        '14_revision_comite.png - Revisión del Comité',
        '15_decision_comite.png - Decisión del Comité',
        '16_bandeja_desembolso.png - Bandeja de Desembolsos',
        '17_desembolso_paso1.png - Configuración Desembolso',
        '18_desembolso_deducciones.png - Deducciones',
        '19_desembolso_cargos.png - Cargos',
        '20_desembolso_confirmacion.png - Confirmación',
        '21_lista_prestamos.png - Lista de Préstamos',
        '22_formulario_pago.png - Formulario de Pago',
        '23_preview_pago.png - Vista Previa de Pago',
        '24_recibo_pago.png - Recibo de Pago',
    ];
    screenshots.forEach(s => console.log(`  ${s}`));
    console.log('─'.repeat(60));
}

// Generar documento
const outputPath = path.join(__dirname, 'MANUAL_USUARIO_FINANZIA.docx');
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`\n✓ Documento generado: ${outputPath}`);
    console.log('\nPara incluir las capturas de pantalla:');
    console.log('1. Guarde las capturas en la carpeta "capturas_manual"');
    console.log('2. Ejecute este script nuevamente');
    console.log('3. O abra el documento en Word y reemplace los placeholders manualmente');
});
