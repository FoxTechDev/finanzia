const docx = require("docx");
const fs = require("fs");

const {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  PageBreak,
} = docx;

// Colores
const COLOR_PRIMARY = "1565C0";
const COLOR_ACCENT = "0D47A1";
const COLOR_GRAY = "666666";
const COLOR_LIGHT_GRAY = "F5F5F5";
const COLOR_GREEN = "2E7D32";
const COLOR_RED = "C62828";
const COLOR_ORANGE = "EF6C00";
const COLOR_PURPLE = "6A1B9A";
const COLOR_CYAN = "00838F";

// Helpers
function heading(text, level) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 240, after: 120 },
  });
}

function para(text, options = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, size: 22, font: "Calibri", ...options }));
  } else {
    runs.push(...text);
  }
  return new Paragraph({
    children: runs,
    spacing: { after: 100 },
    alignment: options.alignment,
  });
}

function bold(text, opts = {}) {
  return new TextRun({ text, bold: true, size: 22, font: "Calibri", ...opts });
}

function normal(text, opts = {}) {
  return new TextRun({ text, size: 22, font: "Calibri", ...opts });
}

function note(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "Nota: ", bold: true, size: 22, font: "Calibri", color: COLOR_ORANGE }),
      new TextRun({ text, size: 22, font: "Calibri", color: COLOR_GRAY }),
    ],
    spacing: { before: 60, after: 100 },
    indent: { left: 300 },
  });
}

function important(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "Importante: ", bold: true, size: 22, font: "Calibri", color: COLOR_RED }),
      new TextRun({ text, size: 22, font: "Calibri" }),
    ],
    spacing: { before: 60, after: 100 },
    indent: { left: 300 },
  });
}

function bullet(text, level = 0) {
  const children = typeof text === "string"
    ? [new TextRun({ text, size: 22, font: "Calibri" })]
    : text;
  return new Paragraph({
    children,
    bullet: { level },
    spacing: { after: 40 },
  });
}

function numberedItem(number, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${number}. `, bold: true, size: 22, font: "Calibri", color: COLOR_PRIMARY }),
      ...(typeof text === "string" ? [new TextRun({ text, size: 22, font: "Calibri" })] : text),
    ],
    spacing: { after: 60 },
    indent: { left: 300 },
  });
}

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        children: [new Paragraph({ children: [bold(h, { color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
        shading: { type: ShadingType.SOLID, color: COLOR_PRIMARY },
        width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
        verticalAlign: "center",
      })
    ),
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) => {
        const children = typeof cell === "string"
          ? [new Paragraph({ children: [normal(cell)], spacing: { before: 30, after: 30 } })]
          : [new Paragraph({ children: cell, spacing: { before: 30, after: 30 } })];
        return new TableCell({
          children,
          shading: ri % 2 === 1 ? { type: ShadingType.SOLID, color: COLOR_LIGHT_GRAY } : undefined,
          width: colWidths ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined,
          verticalAlign: "center",
        });
      }),
    })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function spacer() {
  return new Paragraph({ text: "", spacing: { after: 80 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ==================== DOCUMENTO ====================

const children = [];

// --- PORTADA ---
children.push(
  new Paragraph({ text: "", spacing: { after: 2000 } }),
  new Paragraph({
    children: [new TextRun({ text: "MANUAL DE USUARIO", size: 56, bold: true, font: "Calibri", color: COLOR_PRIMARY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Solicitud de Credito", size: 44, font: "Calibri", color: COLOR_ACCENT })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Sistema MICRO", size: 28, font: "Calibri", color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Sistema de Gestion de Microcreditos", size: 24, font: "Calibri", color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Febrero 2026", size: 24, font: "Calibri", color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
  }),
  pageBreak()
);

// --- INDICE ---
children.push(
  heading("Indice", HeadingLevel.HEADING_1),
  spacer(),
  numberedItem(1, "Acceso al modulo"),
  numberedItem(2, "Crear nueva solicitud"),
  new Paragraph({
    children: [normal("Paso 1: Seleccion de Cliente")],
    indent: { left: 720 },
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [normal("Paso 2: Tipo de Credito")],
    indent: { left: 720 },
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [normal("Paso 3: Condiciones y Plan de Pago")],
    indent: { left: 720 },
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [normal("Paso 4: Garantias")],
    indent: { left: 720 },
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [normal("Paso 5: Analisis del Asesor")],
    indent: { left: 720 },
    spacing: { after: 40 },
  }),
  numberedItem(3, "Consultar solicitudes"),
  numberedItem(4, "Detalle de una solicitud"),
  numberedItem(5, "Flujo de estados"),
  numberedItem(6, "Preguntas frecuentes"),
  pageBreak()
);

// ===========================================
// SECCION 1: ACCESO AL MODULO
// ===========================================
children.push(
  heading("1. Acceso al modulo", HeadingLevel.HEADING_1),
  para("Desde el menu lateral, ingrese a:"),
  spacer(),
  new Paragraph({
    children: [bold("Creditos -> Solicitudes de Credito", { size: 26, color: COLOR_PRIMARY })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 200 },
  }),
  para("Se mostrara el listado de todas las solicitudes registradas. Para crear una nueva, haga clic en el boton \"Nueva Solicitud\"."),
  pageBreak()
);

// ===========================================
// SECCION 2: CREAR NUEVA SOLICITUD
// ===========================================
children.push(
  heading("2. Crear nueva solicitud", HeadingLevel.HEADING_1),
  para("El formulario de solicitud se compone de 5 pasos secuenciales. Debe completar cada paso antes de avanzar al siguiente."),
  spacer(),
  makeTable(
    ["Paso 1", "Paso 2", "Paso 3", "Paso 4", "Paso 5"],
    [["Cliente", "Tipo de Credito", "Condiciones y Plan de Pago", "Garantias (si aplica)", "Analisis del Asesor"]],
    [20, 20, 25, 20, 15]
  ),
  spacer(),
  spacer()
);

// --- PASO 1 ---
children.push(
  heading("Paso 1: Seleccion de Cliente", HeadingLevel.HEADING_2),
  para("En este paso se selecciona al cliente que solicita el credito."),
  spacer(),
  makeTable(
    ["Campo", "Descripcion"],
    [["Buscar cliente", "Escriba el DUI, nombre o apellido del cliente. Se requieren al menos 2 caracteres."]],
    [30, 70]
  ),
  spacer(),
  para([bold("Como usarlo:")]),
  spacer(),
  numberedItem(1, [normal("Escriba en el campo de busqueda el DUI (ej: "), bold("00000000-0"), normal(") o el nombre del cliente (ej: "), bold("Juan Perez"), normal(").")]),
  numberedItem(2, "Aparecera una lista desplegable con los resultados encontrados mostrando el DUI y nombre completo."),
  numberedItem(3, "Seleccione al cliente deseado haciendo clic sobre el."),
  numberedItem(4, "Se mostraran los datos del cliente seleccionado: nombre completo, DUI, telefono y correo."),
  numberedItem(5, "Si desea cambiar de cliente, borre la seleccion y busque nuevamente."),
  spacer(),
  note("El cliente debe estar previamente registrado en el sistema. Si no aparece en la busqueda, debe registrarlo primero en el modulo de Clientes."),
  spacer(),
  para("Haga clic en \"Siguiente\" para continuar."),
  spacer()
);

// --- PASO 2 ---
children.push(
  heading("Paso 2: Tipo de Credito", HeadingLevel.HEADING_2),
  para("En este paso se define que producto crediticio se le ofrecera al cliente."),
  spacer(),
  makeTable(
    ["Campo", "Obligatorio", "Descripcion"],
    [
      ["Linea de Credito", "Si", "Seleccione la linea de credito (ej: Microcredito, Consumo, etc.)"],
      ["Tipo de Credito", "Si", "Seleccione el tipo de credito. Las opciones se filtran segun la linea seleccionada. Si aparece un icono de candado, el producto requiere garantia."],
      ["Destino del Credito", "Si", "Seleccione el proposito del credito."],
      ["Descripcion del destino", "No", "Detalle adicional sobre el uso que se dara al credito."],
    ],
    [30, 15, 55]
  ),
  spacer(),
  para([bold("Opciones de Destino del Credito:")]),
  spacer()
);

const destinos = [
  "Capital de Trabajo", "Activo Fijo", "Consumo Personal", "Vivienda Nueva",
  "Vivienda Usada", "Mejora de Vivienda", "Consolidacion de Deudas",
  "Educacion", "Salud", "Vehiculo", "Otro"
];
destinos.forEach(d => children.push(bullet(d)));

children.push(
  spacer(),
  para([bold("Informacion del producto:")]),
  para("Al seleccionar un tipo de credito, el sistema muestra los parametros permitidos del producto:"),
  spacer(),
  makeTable(
    ["Parametro", "Ejemplo"],
    [
      ["Monto", "$100.00 - $5,000.00"],
      ["Plazo", "1 - 24 meses"],
      ["Tasa", "5% - 15%"],
      ["Garantia", "Requerida / No requerida"],
    ],
    [30, 70]
  ),
  spacer(),
  para("Estos rangos son los limites que debe respetar en el siguiente paso."),
  para("Haga clic en \"Siguiente\" para continuar."),
  pageBreak()
);

// --- PASO 3 ---
children.push(
  heading("Paso 3: Condiciones y Plan de Pago", HeadingLevel.HEADING_2),
  para("Este es el paso mas importante. Aqui se definen los terminos financieros del credito y se calcula el plan de pagos."),
  spacer(),

  // Campos principales
  heading("Campos principales", HeadingLevel.HEADING_3),
  spacer(),
  makeTable(
    ["Campo", "Obligatorio", "Descripcion"],
    [
      ["Periodicidad de Pago", "Si", "Frecuencia con la que el cliente realizara los pagos."],
      ["Monto Solicitado ($)", "Si", "Cantidad de dinero que solicita el cliente. Debe estar dentro del rango del producto."],
      ["Plazo (meses)", "Si", "Duracion del credito en meses. Debe estar dentro del rango del producto."],
      ["Tasa Propuesta (%)", "Si", "Tasa de interes propuesta. Debe estar dentro del rango del producto."],
      ["Numero de Cuotas", "Depende", "Se calcula automaticamente, excepto para periodicidad diaria."],
      ["Tipo de Interes", "Si", "Metodo de calculo de intereses (Flat o Amortizado)."],
      ["Fecha de Solicitud", "Si", "Fecha de la solicitud. Por defecto es la fecha actual."],
    ],
    [28, 15, 57]
  ),
  spacer(),

  // Periodicidades
  heading("Periodicidades disponibles", HeadingLevel.HEADING_3),
  spacer(),
  makeTable(
    ["Periodicidad", "Calculo de cuotas", "Ejemplo"],
    [
      ["Diario", "El usuario ingresa manualmente (1-365)", "Usuario define: 45 cuotas"],
      ["Semanal", "Plazo x 4", "3 meses = 12 cuotas"],
      ["Quincenal", "Plazo x 2", "3 meses = 6 cuotas"],
      ["Mensual", "Igual al plazo", "12 meses = 12 cuotas"],
      ["Trimestral", "Plazo / 3", "12 meses = 4 cuotas"],
      ["Semestral", "Plazo / 6", "12 meses = 2 cuotas"],
      ["Anual", "Plazo / 12", "12 meses = 1 cuota"],
    ],
    [25, 45, 30]
  ),
  spacer(),
  note("Para todas las periodicidades excepto Diario, el numero de cuotas se calcula automaticamente y no se puede editar."),
  spacer(),

  // Tipos de interes
  heading("Tipos de interes", HeadingLevel.HEADING_3),
  spacer(),
  makeTable(
    ["Tipo", "Descripcion", "Uso comun"],
    [
      ["Flat", "El interes se calcula sobre el monto original durante todo el plazo. Todas las cuotas son iguales.", "Microcreditos"],
      ["Amortizado (Sistema Frances)", "El interes se calcula sobre el saldo pendiente. La cuota es fija, pero la proporcion de capital e interes varia.", "Creditos de consumo, vivienda"],
    ],
    [25, 55, 20]
  ),
  spacer(),
  para([bold("Ejemplo comparativo"), normal(" para $1,000 a 12 meses al 10% mensual:")]),
  spacer(),
  makeTable(
    ["Concepto", "Flat", "Amortizado"],
    [
      ["Cuota mensual", "$183.33 (fija)", "Varia (cuota fija pero composicion diferente)"],
      ["Total interes", "$1,200.00", "Menor que flat"],
      ["Total a pagar", "$2,200.00", "Menor que flat"],
    ],
    [30, 35, 35]
  ),
  spacer(),

  // Recargos
  heading("Recargos opcionales", HeadingLevel.HEADING_3),
  para("Puede agregar cargos adicionales a las cuotas (comisiones, seguros, etc.):"),
  spacer(),
  numberedItem(1, "Haga clic en \"Agregar Recargo\"."),
  numberedItem(2, "Complete los campos:"),
  spacer(),
  makeTable(
    ["Campo", "Descripcion"],
    [
      ["Nombre", "Nombre del cargo (ej: \"Comision de procesamiento\")"],
      ["Tipo", "Fijo (monto en dolares) o Porcentaje (% sobre la cuota)"],
      ["Valor", "Monto o porcentaje del cargo"],
      ["Desde cuota", "Cuota a partir de la cual aplica (opcional, por defecto: 1)"],
      ["Hasta cuota", "Cuota hasta la cual aplica (opcional, por defecto: ultima)"],
    ],
    [25, 75]
  ),
  spacer(),
  numberedItem(3, "Los recargos agregados aparecen como etiquetas que puede eliminar haciendo clic en la X."),
  spacer(),

  // Calcular plan
  heading("Calcular el plan de pago", HeadingLevel.HEADING_3),
  para("Una vez completados todos los campos:"),
  spacer(),
  numberedItem(1, [bold("Haga clic en el boton \"Calcular Cuota y Plan de Pago\".")]),
  numberedItem(2, "El sistema calculara y mostrara:"),
  spacer(),
  bullet([bold("Cuota: "), normal("Monto de cada cuota.")]),
  bullet([bold("Total Interes: "), normal("Suma total de intereses.")]),
  bullet([bold("Total a Pagar: "), normal("Suma total incluyendo capital e intereses.")]),
  bullet([bold("Numero de Cuotas: "), normal("Cantidad total de cuotas.")]),
  spacer(),
  numberedItem(3, "Se desplegara una tabla con el plan de pagos detallado:"),
  spacer(),
  makeTable(
    ["Columna", "Descripcion"],
    [
      ["#", "Numero de cuota"],
      ["Fecha", "Fecha de vencimiento"],
      ["Capital", "Monto de capital en la cuota"],
      ["Interes", "Monto de interes en la cuota"],
      ["Recargos", "Monto de recargos (si aplica)"],
      ["Cuota", "Monto total de la cuota"],
      ["Saldo", "Saldo pendiente despues del pago"],
    ],
    [20, 80]
  ),
  spacer(),
  numberedItem(4, "Revise que el plan sea correcto. Si necesita ajustar algun valor, modifiquelo y vuelva a calcular."),
  numberedItem(5, [bold("Haga clic en \"Guardar y Continuar\"."), normal(" Se guardara la solicitud junto con el plan de pagos.")]),
  spacer(),
  important("Si no calcula el plan de pago, solo se guardaran los datos de la solicitud sin plan."),
  pageBreak()
);

// --- PASO 4 ---
children.push(
  heading("Paso 4: Garantias (Condicional)", HeadingLevel.HEADING_2),
  para([normal("Este paso "), bold("solo aparece"), normal(" si el tipo de credito seleccionado requiere garantia (indicado con el icono de candado en el paso 2).")]),
  spacer(),
  para([bold("Tipos de garantia disponibles:")]),
  spacer(),
  makeTable(
    ["Tipo", "Descripcion"],
    [
      ["Prenda", "Bien mueble como respaldo"],
      ["Hipoteca", "Bien inmueble como respaldo"],
      ["Fianza", "Persona que respalda el credito"],
      ["Aval", "Persona garante"],
      ["Otro", "Otro tipo de garantia"],
    ],
    [25, 75]
  ),
  spacer(),
  para([bold("Como agregar una garantia:")]),
  spacer(),
  numberedItem(1, "Haga clic en \"Agregar Garantia\"."),
  numberedItem(2, "Complete los datos requeridos segun el tipo de garantia."),
  numberedItem(3, "Las garantias agregadas se muestran en una lista con la opcion de eliminarlas."),
  numberedItem(4, "El numero de garantias se muestra en un indicador azul."),
  spacer(),
  note("Si el tipo de credito no requiere garantia, este paso se omite automaticamente."),
  spacer()
);

// --- PASO 5 ---
children.push(
  heading("Paso 5: Analisis del Asesor", HeadingLevel.HEADING_2),
  para("En este paso, el asesor de credito registra su evaluacion del cliente y la solicitud."),
  spacer(),
  makeTable(
    ["Campo", "Obligatorio", "Descripcion"],
    [
      ["Analisis del Asesor", "No", "Evaluacion detallada del negocio, ingresos y situacion del cliente."],
      ["Recomendacion", "No", "Seleccione: Aprobar, Rechazar o Pendiente."],
      ["Capacidad de Pago", "No", "Monto estimado que el cliente puede pagar periodicamente (en dolares)."],
      ["Antecedentes del Cliente", "No", "Historial crediticio, relacion con la institucion, observaciones relevantes."],
    ],
    [28, 15, 57]
  ),
  spacer(),
  para("Al guardar este paso:"),
  bullet([normal("La solicitud cambia de estado "), bold("REGISTRADA"), normal(" a "), bold("ANALIZADA"), normal(".")]),
  bullet("Se registra la fecha de analisis automaticamente."),
  spacer(),
  para([normal("Haga clic en "), bold("\"Finalizar\""), normal(" para completar la solicitud.")]),
  pageBreak()
);

// ===========================================
// SECCION 3: CONSULTAR SOLICITUDES
// ===========================================
children.push(
  heading("3. Consultar solicitudes", HeadingLevel.HEADING_1),
  para("En el listado de solicitudes puede filtrar y buscar solicitudes existentes."),
  spacer(),
  para([bold("Filtros disponibles:")]),
  spacer(),
  makeTable(
    ["Filtro", "Descripcion"],
    [
      ["Estado", "Filtra por estado de la solicitud"],
      ["Linea de Credito", "Filtra por linea de credito"],
      ["Desde", "Fecha inicial del rango de busqueda"],
      ["Hasta", "Fecha final del rango de busqueda"],
    ],
    [30, 70]
  ),
  spacer(),
  para([bold("Columnas del listado:")]),
  spacer(),
  makeTable(
    ["Columna", "Descripcion"],
    [
      ["No. Solicitud", "Numero unico (formato: SOL-AAAA-NNNNNN)"],
      ["Fecha", "Fecha de la solicitud"],
      ["Cliente", "Nombre del cliente"],
      ["Tipo", "Tipo de credito"],
      ["Monto", "Monto solicitado"],
      ["Plazo", "Plazo en meses"],
      ["Estado", "Estado actual (con color indicativo)"],
      ["Acciones", "Opciones disponibles"],
    ],
    [25, 75]
  ),
  spacer(),
  para([bold("Acciones disponibles por solicitud:")]),
  spacer(),
  makeTable(
    ["Accion", "Disponible cuando"],
    [
      ["Ver detalle", "Siempre"],
      ["Editar", "Estado REGISTRADA u OBSERVADA"],
      ["Trasladar a Comite", "Estado ANALIZADA u OBSERVADA"],
    ],
    [30, 70]
  ),
  pageBreak()
);

// ===========================================
// SECCION 4: DETALLE DE UNA SOLICITUD
// ===========================================
children.push(
  heading("4. Detalle de una solicitud", HeadingLevel.HEADING_1),
  para("Al hacer clic en \"Ver detalle\", se muestra toda la informacion organizada en pestanas:"),
  spacer(),

  heading("Pestana: Informacion General", HeadingLevel.HEADING_2),
  para("Muestra los datos de la solicitud agrupados en tarjetas:"),
  spacer(),
  bullet([bold("Datos del Cliente: "), normal("Nombre completo y DUI.")]),
  bullet([bold("Tipo de Credito: "), normal("Linea, tipo, destino y descripcion.")]),
  bullet([bold("Condiciones Solicitadas: "), normal("Monto, plazo y tasa propuesta.")]),
  bullet([bold("Condiciones Aprobadas: "), normal("Monto, plazo y tasa aprobada (solo si fue aprobada).")]),
  bullet([bold("Fechas: "), normal("Solicitud, analisis, aprobacion, denegacion, traslado y decision de comite.")]),
  bullet([bold("Observaciones: "), normal("Observaciones generales, motivo de denegacion y observaciones del comite.")]),
  bullet([bold("Analisis del Asesor: "), normal("Analisis, capacidad de pago y antecedentes.")]),
  spacer(),

  heading("Pestana: Plan de Pago", HeadingLevel.HEADING_2),
  para("Muestra el resumen del plan y la tabla detallada de cuotas:"),
  spacer(),
  makeTable(
    ["Dato", "Descripcion"],
    [
      ["Periodicidad de Pago", "Frecuencia de las cuotas"],
      ["Numero de Cuotas", "Total de cuotas"],
      ["Cuota Normal", "Monto de cada cuota"],
      ["Total Interes", "Suma de intereses"],
      ["Total a Pagar", "Monto total del credito"],
    ],
    [35, 65]
  ),
  spacer(),

  heading("Pestana: Historial", HeadingLevel.HEADING_2),
  para("Muestra el registro de auditoria con todos los cambios de estado:"),
  spacer(),
  makeTable(
    ["Columna", "Descripcion"],
    [
      ["Fecha", "Fecha y hora del cambio"],
      ["Estado Anterior", "Estado antes del cambio"],
      ["Estado Nuevo", "Estado despues del cambio"],
      ["Usuario", "Quien realizo el cambio"],
      ["Observacion", "Comentario del cambio"],
    ],
    [25, 75]
  ),
  pageBreak()
);

// ===========================================
// SECCION 5: FLUJO DE ESTADOS
// ===========================================
children.push(
  heading("5. Flujo de estados", HeadingLevel.HEADING_1),
  para("Cada solicitud sigue un flujo de aprobacion definido. A continuacion se describe cada estado y las transiciones posibles."),
  spacer(),

  heading("Diagrama de flujo", HeadingLevel.HEADING_2),
  spacer(),

  new Paragraph({
    children: [bold("REGISTRADA", { color: COLOR_PRIMARY, size: 24 }), normal("  (Nueva solicitud)", { size: 20, color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [normal("v  El asesor completa su analisis", { size: 20, color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [bold("ANALIZADA", { color: COLOR_ORANGE, size: 24 }), normal("  (Evaluacion del asesor completada)", { size: 20, color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [normal("v  El asesor envia al comite", { size: 20, color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [bold("EN COMITE", { color: COLOR_PURPLE, size: 24 }), normal("  (Esperando decision del comite)", { size: 20, color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [normal("v  El comite toma una decision", { size: 20, color: COLOR_GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }),

  makeTable(
    ["OBSERVADA", "DENEGADA", "APROBADA"],
    [
      [
        [normal("Requiere correcciones.", { size: 20 }), normal(" El asesor edita y re-envia.", { size: 20, color: COLOR_GRAY })],
        [normal("Rechazada por el comite.", { size: 20 }), normal(" Estado final.", { size: 20, color: COLOR_GRAY })],
        [normal("Lista para desembolso.", { size: 20 }), normal(" -> DESEMBOLSADA", { size: 20, color: COLOR_GRAY })],
      ]
    ],
    [34, 33, 33]
  ),

  spacer(),
  spacer(),

  heading("Resumen de estados", HeadingLevel.HEADING_2),
  spacer(),
  makeTable(
    ["Estado", "Color", "Descripcion", "Se puede editar?"],
    [
      [[bold("REGISTRADA", { color: COLOR_PRIMARY })], "Azul", "Solicitud recien creada", "Si"],
      [[bold("ANALIZADA", { color: COLOR_ORANGE })], "Naranja", "El asesor completo su evaluacion", "No"],
      [[bold("EN COMITE", { color: COLOR_PURPLE })], "Morado", "Enviada al comite de credito", "No"],
      [[bold("OBSERVADA", { color: "E65100" })], "Rojo-naranja", "El comite solicita correcciones", "Si"],
      [[bold("DENEGADA", { color: COLOR_RED })], "Rojo", "Rechazada por el comite (estado final)", "No"],
      [[bold("APROBADA", { color: COLOR_GREEN })], "Verde", "Aprobada por el comite", "No"],
      [[bold("DESEMBOLSADA", { color: COLOR_CYAN })], "Cian", "Credito desembolsado (estado final)", "No"],
    ],
    [22, 15, 43, 20]
  ),
  pageBreak()
);

// ===========================================
// SECCION 6: PREGUNTAS FRECUENTES
// ===========================================
children.push(
  heading("6. Preguntas frecuentes", HeadingLevel.HEADING_1),
  spacer(),

  para([bold("Puedo editar una solicitud despues de crearla?", { color: COLOR_ACCENT })]),
  para("Solo si esta en estado REGISTRADA u OBSERVADA. Una vez que se envia al comite, no se puede modificar hasta que el comite la devuelva con observaciones."),
  spacer(),

  para([bold("Que hago si el comite devuelve la solicitud con observaciones?", { color: COLOR_ACCENT })]),
  numberedItem(1, "Abra la solicitud (estara en estado OBSERVADA)."),
  numberedItem(2, "Haga clic en \"Editar\"."),
  numberedItem(3, "Realice las correcciones necesarias."),
  numberedItem(4, "Si modifico las condiciones, recalcule el plan de pago."),
  numberedItem(5, "Guarde los cambios."),
  numberedItem(6, "Actualice el analisis del asesor si es necesario."),
  numberedItem(7, "Haga clic en \"Trasladar a Comite\" para re-enviarla."),
  spacer(),

  para([bold("Puedo cambiar el cliente despues de crear la solicitud?", { color: COLOR_ACCENT })]),
  para("Si, siempre y cuando la solicitud este en estado REGISTRADA u OBSERVADA."),
  spacer(),

  para([bold("Que pasa si no calculo el plan de pago?", { color: COLOR_ACCENT })]),
  para("La solicitud se guarda sin plan de pagos. Puede editarla despues para calcular y guardar el plan antes de enviarla al comite."),
  spacer(),

  para([bold("Cual es la diferencia entre interes Flat y Amortizado?", { color: COLOR_ACCENT })]),
  bullet([bold("Flat: "), normal("El interes se calcula sobre el monto original durante todo el plazo. Resulta en un costo total mayor para el cliente. Recomendado para microcreditos de corto plazo.")]),
  bullet([bold("Amortizado: "), normal("El interes se calcula sobre el saldo pendiente, que va disminuyendo. Resulta en un costo total menor. Recomendado para creditos de mayor monto y plazo.")]),
  spacer(),

  para([bold("Como funciona la periodicidad diaria?", { color: COLOR_ACCENT })]),
  para("Al seleccionar periodicidad Diario:"),
  bullet("El campo \"Numero de Cuotas\" se habilita para que lo ingrese manualmente (1-365)."),
  bullet("Los domingos se excluyen del calendario de pagos."),
  bullet("Aparecen campos opcionales de \"Fecha Desde\" y \"Fecha Hasta\" para definir el rango de pagos diarios."),
  spacer(),

  para([bold("Que roles pueden acceder a este modulo?", { color: COLOR_ACCENT })]),
  spacer(),
  makeTable(
    ["Rol", "Permisos"],
    [
      ["Administrador", "Acceso completo a todas las funciones"],
      ["Asesor", "Crear, editar, analizar y trasladar solicitudes"],
      ["Comite", "Ver solicitudes y tomar decisiones (aprobar, denegar, observar)"],
    ],
    [25, 75]
  )
);

// ==================== GENERAR DOCUMENTO ====================

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22 },
      },
      heading1: {
        run: { font: "Calibri", size: 36, bold: true, color: COLOR_PRIMARY },
        paragraph: { spacing: { before: 360, after: 200 } },
      },
      heading2: {
        run: { font: "Calibri", size: 30, bold: true, color: COLOR_ACCENT },
        paragraph: { spacing: { before: 280, after: 160 } },
      },
      heading3: {
        run: { font: "Calibri", size: 26, bold: true, color: "333333" },
        paragraph: { spacing: { before: 200, after: 120 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 },
      },
    },
    children,
  }],
});

docx.Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("MANUAL_SOLICITUD_CREDITO.docx", buffer);
  console.log("Archivo generado: MANUAL_SOLICITUD_CREDITO.docx");
});
