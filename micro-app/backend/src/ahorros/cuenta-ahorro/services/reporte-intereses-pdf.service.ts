import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { PlanCapitalizacion } from '../entities/plan-capitalizacion.entity';

// Paleta institucional
const COLOR_PRIMARIO = '#006064';
const COLOR_PRIMARIO_CLARO = '#e0f2f1';
const COLOR_GRIS_TEXTO = '#424242';
const COLOR_GRIS_BORDE = '#bdbdbd';
const COLOR_NEGRO = '#000000';
const COLOR_BLANCO = '#ffffff';
const COLOR_FILA_IMPAR = '#f5f5f5';

// Logo
function getLogoPath(): string | null {
  const possiblePaths = [
    path.join(__dirname, '..', '..', '..', 'assets', 'logoDocs.webp'),
    path.join(__dirname, '..', '..', '..', '..', 'src', 'assets', 'logoDocs.webp'),
    path.join(process.cwd(), 'src', 'assets', 'logoDocs.webp'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

let logoBufferCache: Buffer | null = null;

async function getLogoBuffer(): Promise<Buffer | null> {
  if (logoBufferCache) return logoBufferCache;
  const logoPath = getLogoPath();
  if (!logoPath) return null;
  try {
    logoBufferCache = await sharp(logoPath).png().toBuffer();
    return logoBufferCache;
  } catch {
    return null;
  }
}

// Márgenes y medidas de página carta (612 x 792 pts)
const MARGEN_LEFT = 50;
const MARGEN_RIGHT = 50;
const ANCHO_UTIL = 612 - MARGEN_LEFT - MARGEN_RIGHT; // 512 pts

@Injectable()
export class ReporteInteresesPdfService {
  constructor(
    @InjectRepository(CuentaAhorro)
    private readonly cuentaRepo: Repository<CuentaAhorro>,
    @InjectRepository(PlanCapitalizacion)
    private readonly planRepo: Repository<PlanCapitalizacion>,
  ) {}

  async generarReporte(cuentaId: number): Promise<Buffer> {
    // 1. Cargar datos de la cuenta con todas sus relaciones
    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuentaId },
      relations: [
        'persona',
        'tipoAhorro',
        'tipoAhorro.lineaAhorro',
        'estado',
        'tipoCapitalizacion',
      ],
    });

    if (!cuenta) {
      throw new NotFoundException(`Cuenta con ID ${cuentaId} no encontrada`);
    }

    // 2. Cargar plan de capitalización ordenado por fecha ascendente
    const planCapitalizacion = await this.planRepo.find({
      where: { cuentaAhorroId: cuentaId },
      order: { fechaCapitalizacion: 'ASC' },
    });

    // 3. Obtener logo y generar el PDF
    const logoBuffer = await getLogoBuffer();
    return this.construirPdf(cuenta, planCapitalizacion, logoBuffer);
  }

  private construirPdf(
    cuenta: CuentaAhorro,
    plan: PlanCapitalizacion[],
    logoBuffer: Buffer | null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'letter',
        margins: {
          top: 50,
          bottom: 50,
          left: MARGEN_LEFT,
          right: MARGEN_RIGHT,
        },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Dibujar cada sección del documento
      this.dibujarEncabezado(doc, logoBuffer);
      this.dibujarDatosCliente(doc, cuenta);
      this.dibujarDatosCuenta(doc, cuenta);
      this.dibujarTablaIntereses(doc, plan);
      this.dibujarPiePagina(doc);

      doc.end();
    });
  }

  // -----------------------------------------------------------------------
  // Sección: Encabezado
  // -----------------------------------------------------------------------
  private dibujarEncabezado(doc: PDFKit.PDFDocument, logoBuffer: Buffer | null): void {
    const startY = 40;
    const logoWidth = 80;
    const textX = MARGEN_LEFT + logoWidth + 15;
    const textWidth = ANCHO_UTIL - logoWidth - 15;

    // Logo
    try {
      if (logoBuffer) {
        doc.image(logoBuffer, MARGEN_LEFT, startY, { width: logoWidth });
      }
    } catch {
      // Continuar sin logo
    }

    // Nombre de la institución
    doc
      .fillColor(COLOR_PRIMARIO)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('FINANZIA S.C. DE R.L. DE C.V.', textX, startY + 8, {
        width: textWidth,
      });

    // Subtítulo del reporte
    doc
      .fillColor(COLOR_GRIS_TEXTO)
      .fontSize(11)
      .font('Helvetica')
      .text('Reporte de Pago de Intereses', textX, startY + 28, {
        width: textWidth,
      });

    // Línea separadora institucional
    doc
      .moveTo(MARGEN_LEFT, startY + 58)
      .lineTo(MARGEN_LEFT + ANCHO_UTIL, startY + 58)
      .strokeColor(COLOR_PRIMARIO)
      .lineWidth(2)
      .stroke();

    // Fecha de generación
    const fechaGeneracion = this.formatearFecha(new Date());
    doc
      .fillColor(COLOR_GRIS_TEXTO)
      .fontSize(8)
      .font('Helvetica')
      .text(`Fecha: ${fechaGeneracion}`, MARGEN_LEFT, startY + 63, {
        width: ANCHO_UTIL,
        align: 'right',
      });

    doc.y = startY + 78;
  }

  // -----------------------------------------------------------------------
  // Sección: Datos del cliente
  // -----------------------------------------------------------------------
  private dibujarDatosCliente(
    doc: PDFKit.PDFDocument,
    cuenta: CuentaAhorro,
  ): void {
    const y = doc.y + 6;

    this.dibujarTituloSeccion(doc, 'DATOS DEL CLIENTE', y);

    const yContenido = doc.y + 4;
    doc
      .fillColor(COLOR_GRIS_TEXTO)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Nombre:', MARGEN_LEFT, yContenido)
      .font('Helvetica')
      .text(
        `${cuenta.persona?.nombre || ''} ${cuenta.persona?.apellido || ''}`.trim(),
        MARGEN_LEFT + 65,
        yContenido,
      );

    const yDui = yContenido + 16;
    doc
      .font('Helvetica-Bold')
      .text('DUI:', MARGEN_LEFT, yDui)
      .font('Helvetica')
      .text(cuenta.persona?.numeroDui || '', MARGEN_LEFT + 65, yDui);

    doc.y = yDui + 20;
  }

  // -----------------------------------------------------------------------
  // Sección: Datos de la cuenta
  // -----------------------------------------------------------------------
  private dibujarDatosCuenta(
    doc: PDFKit.PDFDocument,
    cuenta: CuentaAhorro,
  ): void {
    const y = doc.y + 4;

    this.dibujarTituloSeccion(doc, 'DATOS DE LA CUENTA', y);

    const yBase = doc.y + 4;
    const colIzq = MARGEN_LEFT;
    const colDer = MARGEN_LEFT + ANCHO_UTIL / 2 + 10;
    const labelWidth = 110;
    const valueWidth = ANCHO_UTIL / 2 - labelWidth - 10;

    const monto = Number(cuenta.monto);
    const tasa = Number(cuenta.tasaInteres);

    const camposIzq: [string, string][] = [
      ['No. Cuenta:', cuenta.noCuenta || ''],
      ['Tipo de Ahorro:', cuenta.tipoAhorro?.nombre || ''],
      ['Línea:', cuenta.tipoAhorro?.lineaAhorro?.nombre || ''],
      ['Estado:', cuenta.estado?.nombre || ''],
    ];

    const camposDer: [string, string][] = [
      ['Monto:', this.formatearMonto(monto)],
      ['Tasa de Interés:', `${tasa}%`],
      ['Plazo:', `${cuenta.plazo || 0} días`],
      ['Capitalización:', cuenta.tipoCapitalizacion?.nombre || ''],
    ];

    // Renderizar columna izquierda
    let yFila = yBase;
    for (const [label, valor] of camposIzq) {
      doc
        .fillColor(COLOR_GRIS_TEXTO)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(label, colIzq, yFila, { width: labelWidth })
        .font('Helvetica')
        .text(valor, colIzq + labelWidth, yFila, { width: valueWidth });
      yFila += 16;
    }

    // Renderizar columna derecha
    yFila = yBase;
    for (const [label, valor] of camposDer) {
      doc
        .fillColor(COLOR_GRIS_TEXTO)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(label, colDer, yFila, { width: labelWidth })
        .font('Helvetica')
        .text(valor, colDer + labelWidth, yFila, { width: valueWidth });
      yFila += 16;
    }

    // Fechas en fila completa debajo de las columnas
    const yFechas = yFila + 2;
    doc
      .fillColor(COLOR_GRIS_TEXTO)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Fecha Apertura:', colIzq, yFechas, { width: labelWidth })
      .font('Helvetica')
      .text(
        this.formatearFecha(cuenta.fechaApertura),
        colIzq + labelWidth,
        yFechas,
        { width: valueWidth },
      );

    doc
      .font('Helvetica-Bold')
      .text('Fecha Vencimiento:', colDer, yFechas, { width: labelWidth })
      .font('Helvetica')
      .text(
        this.formatearFecha(cuenta.fechaVencimiento),
        colDer + labelWidth,
        yFechas,
        { width: valueWidth },
      );

    doc.y = yFechas + 24;
  }

  // -----------------------------------------------------------------------
  // Sección: Tabla de detalle de intereses
  // -----------------------------------------------------------------------
  private dibujarTablaIntereses(
    doc: PDFKit.PDFDocument,
    plan: PlanCapitalizacion[],
  ): void {
    const y = doc.y + 4;

    this.dibujarTituloSeccion(doc, 'DETALLE DE PAGOS DE INTERESES', y);

    const yTabla = doc.y + 6;

    // Definición de columnas (sin Estado)
    type Align = 'left' | 'center' | 'right';
    const columnas: { label: string; x: number; width: number; align: Align }[] = [
      { label: 'No.', x: MARGEN_LEFT, width: 45, align: 'center' },
      { label: 'Fecha de Pago', x: MARGEN_LEFT + 45, width: 260, align: 'left' },
      {
        label: 'Monto Interés',
        x: MARGEN_LEFT + 305,
        width: ANCHO_UTIL - 305,
        align: 'right',
      },
    ];

    const ALTO_FILA = 18;
    const ALTO_CABECERA = 22;

    // Cabecera de la tabla
    doc
      .rect(MARGEN_LEFT, yTabla, ANCHO_UTIL, ALTO_CABECERA)
      .fill(COLOR_PRIMARIO);

    doc.fillColor(COLOR_BLANCO).fontSize(9).font('Helvetica-Bold');
    for (const col of columnas) {
      doc.text(col.label, col.x + 4, yTabla + 6, {
        width: col.width - 8,
        align: col.align,
      });
    }

    // Línea inferior del encabezado
    doc
      .moveTo(MARGEN_LEFT, yTabla + ALTO_CABECERA)
      .lineTo(MARGEN_LEFT + ANCHO_UTIL, yTabla + ALTO_CABECERA)
      .strokeColor(COLOR_PRIMARIO)
      .lineWidth(0.5)
      .stroke();

    // Filas de datos
    let totalIntereses = 0;
    let yActual = yTabla + ALTO_CABECERA;

    for (let i = 0; i < plan.length; i++) {
      const item = plan[i];

      // Salto de página si es necesario (dejando espacio para fila de total y pie)
      if (yActual + ALTO_FILA > doc.page.height - 100) {
        doc.addPage();
        yActual = 50;
      }

      const esFilaImpar = i % 2 === 0;
      const colorFondo = esFilaImpar ? COLOR_FILA_IMPAR : COLOR_BLANCO;

      // Fondo de la fila
      doc
        .rect(MARGEN_LEFT, yActual, ANCHO_UTIL, ALTO_FILA)
        .fill(colorFondo);

      const monto = Number(item.monto);
      totalIntereses += monto;

      const fechaPago = this.formatearFecha(item.fechaCapitalizacion);

      const valores = [
        `${i + 1}`,
        fechaPago,
        this.formatearMonto(monto),
      ];

      doc.fillColor(COLOR_GRIS_TEXTO).fontSize(9).font('Helvetica');
      for (let c = 0; c < columnas.length; c++) {
        const col = columnas[c];
        doc.text(valores[c], col.x + 4, yActual + 4, {
          width: col.width - 8,
          align: col.align,
        });
      }

      // Línea inferior de cada fila
      doc
        .moveTo(MARGEN_LEFT, yActual + ALTO_FILA)
        .lineTo(MARGEN_LEFT + ANCHO_UTIL, yActual + ALTO_FILA)
        .strokeColor(COLOR_GRIS_BORDE)
        .lineWidth(0.3)
        .stroke();

      yActual += ALTO_FILA;
    }

    // Fila de total
    if (yActual + ALTO_FILA + 4 > doc.page.height - 80) {
      doc.addPage();
      yActual = 50;
    }

    const yTotal = yActual + 4;

    doc
      .rect(MARGEN_LEFT, yTotal, ANCHO_UTIL, ALTO_FILA + 2)
      .fill(COLOR_PRIMARIO_CLARO);

    // Borde superior del total
    doc
      .moveTo(MARGEN_LEFT, yTotal)
      .lineTo(MARGEN_LEFT + ANCHO_UTIL, yTotal)
      .strokeColor(COLOR_PRIMARIO)
      .lineWidth(1)
      .stroke();

    doc
      .fillColor(COLOR_NEGRO)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('TOTAL:', MARGEN_LEFT + 4, yTotal + 5, {
        width: columnas[1].x + columnas[1].width - MARGEN_LEFT - 12,
        align: 'right',
      });

    // Columna del monto total
    const colMonto = columnas[2];
    doc
      .fillColor(COLOR_NEGRO)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(this.formatearMonto(totalIntereses), colMonto.x + 4, yTotal + 5, {
        width: colMonto.width - 8,
        align: 'right',
      });

    // Borde exterior de la tabla completa
    doc
      .rect(MARGEN_LEFT, yTabla, ANCHO_UTIL, yTotal + ALTO_FILA + 2 - yTabla)
      .strokeColor(COLOR_GRIS_BORDE)
      .lineWidth(0.5)
      .stroke();

    // Líneas verticales de columnas
    const xLineas = [
      columnas[1].x,
      columnas[2].x,
    ];
    for (const xL of xLineas) {
      doc
        .moveTo(xL, yTabla)
        .lineTo(xL, yTotal + ALTO_FILA + 2)
        .strokeColor(COLOR_GRIS_BORDE)
        .lineWidth(0.3)
        .stroke();
    }

    doc.y = yTotal + ALTO_FILA + 2 + 10;
  }

  // -----------------------------------------------------------------------
  // Sección: Pie de página
  // -----------------------------------------------------------------------
  private dibujarPiePagina(doc: PDFKit.PDFDocument): void {
    const yPie = doc.page.height - 45;

    doc
      .moveTo(MARGEN_LEFT, yPie)
      .lineTo(MARGEN_LEFT + ANCHO_UTIL, yPie)
      .strokeColor(COLOR_PRIMARIO)
      .lineWidth(0.8)
      .stroke();

    const ahora = new Date();
    const fechaHora = `${this.formatearFecha(ahora)} ${ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}`;

    doc
      .fillColor(COLOR_GRIS_TEXTO)
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Generado el ${fechaHora} | FINANZIA S.C. DE R.L. DE C.V.`,
        MARGEN_LEFT,
        yPie + 5,
        { width: ANCHO_UTIL, align: 'center' },
      );
  }

  // -----------------------------------------------------------------------
  // Helpers de renderizado
  // -----------------------------------------------------------------------
  private dibujarTituloSeccion(
    doc: PDFKit.PDFDocument,
    titulo: string,
    y: number,
  ): void {
    doc
      .rect(MARGEN_LEFT, y, ANCHO_UTIL, 18)
      .fill(COLOR_PRIMARIO);

    doc
      .fillColor(COLOR_BLANCO)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(titulo, MARGEN_LEFT + 6, y + 4, {
        width: ANCHO_UTIL - 12,
        align: 'left',
      });

    doc.y = y + 18;
  }

  // -----------------------------------------------------------------------
  // Helpers de formato
  // -----------------------------------------------------------------------
  private formatearFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    // Usar UTC para evitar desfase de zona horaria en fechas tipo 'date'
    const dia = d.getUTCDate().toString().padStart(2, '0');
    const mes = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const anio = d.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  private formatearMonto(valor: number): string {
    return `$${valor.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
