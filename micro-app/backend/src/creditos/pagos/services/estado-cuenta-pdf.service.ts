import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { Prestamo } from '../../desembolso/entities/prestamo.entity';
import { Pago, EstadoPago } from '../entities/pago.entity';
import {
  EstadoCuentaPdfDto,
  InstitucionPdfDto,
  ClientePdfDto,
  PrestamoPdfDto,
  SaldosPdfDto,
  ResumenPagosPdfDto,
  PagoDetallePdfDto,
} from '../dto/estado-cuenta-pdf.dto';

/**
 * Obtiene la ruta del logo buscando en múltiples ubicaciones
 */
function getLogoPath(): string | null {
  const possiblePaths = [
    // Desde src (desarrollo con ts-node) - WebP
    path.join(__dirname, '..', '..', '..', 'assets', 'logoDocs.webp'),
    // Desde dist (producción) - WebP
    path.join(__dirname, '..', '..', '..', '..', 'src', 'assets', 'logoDocs.webp'),
    // Ruta absoluta desde el proceso - WebP
    path.join(process.cwd(), 'src', 'assets', 'logoDocs.webp'),
  ];

  for (const logoPath of possiblePaths) {
    if (fs.existsSync(logoPath)) {
      return logoPath;
    }
  }

  return null;
}

/**
 * Convierte una imagen WebP a buffer PNG usando sharp
 */
async function convertWebpToPngBuffer(webpPath: string): Promise<Buffer | null> {
  try {
    const pngBuffer = await sharp(webpPath)
      .png()
      .toBuffer();
    return pngBuffer;
  } catch (error) {
    console.error('Error convirtiendo WebP a PNG:', error);
    return null;
  }
}

// Cache del logo convertido para no convertirlo en cada request
let logoBufferCache: Buffer | null = null;

@Injectable()
export class EstadoCuentaPdfService {
  constructor(
    @InjectRepository(Prestamo)
    private prestamoRepository: Repository<Prestamo>,
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
  ) {}

  /**
   * Obtiene todos los datos necesarios para el PDF del estado de cuenta
   */
  async obtenerDatosEstadoCuenta(
    prestamoId: number,
  ): Promise<EstadoCuentaPdfDto> {
    // Obtener préstamo con todas las relaciones necesarias
    const prestamo = await this.prestamoRepository.findOne({
      where: { id: prestamoId },
      relations: [
        'persona',
        'persona.direccion',
        'persona.direccion.departamento',
        'persona.direccion.municipio',
        'persona.direccion.distrito',
        'tipoCredito',
      ],
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo ${prestamoId} no encontrado`);
    }

    // Obtener todos los pagos aplicados
    const pagos = await this.pagoRepository.find({
      where: {
        prestamoId,
        estado: EstadoPago.APLICADO,
      },
      relations: ['detallesCuota'],
      order: { fechaPago: 'ASC' },
    });

    // Construir datos de institución
    const institucion: InstitucionPdfDto = {
      nombre: 'FINANZIA S.C. DE R.L. DE C.V.',
      direccion: 'San Salvador, El Salvador',
    };

    // Construir datos del cliente
    const persona = prestamo.persona;
    let direccionTexto = 'No especificada';

    if (persona?.direccion) {
      const partes = [];
      if (persona.direccion.detalleDireccion) {
        partes.push(persona.direccion.detalleDireccion);
      }
      if (persona.direccion.municipio?.nombre) {
        partes.push(persona.direccion.municipio.nombre);
      }
      if (persona.direccion.departamento?.nombre) {
        partes.push(persona.direccion.departamento.nombre);
      }
      if (partes.length > 0) {
        direccionTexto = partes.join(', ');
      }
    }

    const cliente: ClientePdfDto = {
      nombre: persona?.nombre || 'N/A',
      apellido: persona?.apellido || 'N/A',
      nombreCompleto: persona
        ? `${persona.nombre} ${persona.apellido}`
        : 'N/A',
      numeroDui: persona?.numeroDui || 'N/A',
      telefono: persona?.telefono || 'N/A',
      correoElectronico: persona?.correoElectronico || 'N/A',
      direccion: direccionTexto,
    };

    // Construir datos del préstamo
    const prestamoPdf: PrestamoPdfDto = {
      numeroCredito: prestamo.numeroCredito,
      tipoCredito: prestamo.tipoCredito?.nombre || 'N/A',
      montoDesembolsado: Number(prestamo.montoDesembolsado),
      plazoMeses: prestamo.plazoAutorizado,
      tasaInteres: Number(prestamo.tasaInteres),
      tasaInteresMoratorio: Number(prestamo.tasaInteresMoratorio),
      fechaOtorgamiento: prestamo.fechaOtorgamiento,
      fechaVencimiento: prestamo.fechaVencimiento,
      estado: prestamo.estado,
      periodicidadPago: prestamo.periodicidadPago,
    };

    // Construir saldos actuales
    const saldoTotal =
      Number(prestamo.saldoCapital) +
      Number(prestamo.saldoInteres) +
      Number(prestamo.capitalMora) +
      Number(prestamo.interesMora);

    const saldos: SaldosPdfDto = {
      saldoCapital: Number(prestamo.saldoCapital),
      saldoInteres: Number(prestamo.saldoInteres),
      capitalMora: Number(prestamo.capitalMora),
      interesMora: Number(prestamo.interesMora),
      diasMora: prestamo.diasMora,
      saldoTotal: this.redondear(saldoTotal),
    };

    // Calcular resumen de pagos
    const resumenPagos = pagos.reduce(
      (acc, p) => ({
        totalPagado: acc.totalPagado + Number(p.montoPagado),
        capitalPagado: acc.capitalPagado + Number(p.capitalAplicado),
        interesPagado: acc.interesPagado + Number(p.interesAplicado),
        recargosPagado: acc.recargosPagado + Number(p.recargosAplicado),
        moratorioPagado:
          acc.moratorioPagado + Number(p.interesMoratorioAplicado),
        recargoManualPagado:
          acc.recargoManualPagado + Number(p.recargoManualAplicado || 0),
        numeroPagos: acc.numeroPagos + 1,
      }),
      {
        totalPagado: 0,
        capitalPagado: 0,
        interesPagado: 0,
        recargosPagado: 0,
        moratorioPagado: 0,
        recargoManualPagado: 0,
        numeroPagos: 0,
      },
    );

    // Redondear valores del resumen
    const resumenPagosPdf: ResumenPagosPdfDto = {
      totalPagado: this.redondear(resumenPagos.totalPagado),
      capitalPagado: this.redondear(resumenPagos.capitalPagado),
      interesPagado: this.redondear(resumenPagos.interesPagado),
      recargosPagado: this.redondear(resumenPagos.recargosPagado),
      moratorioPagado: this.redondear(resumenPagos.moratorioPagado),
      recargoManualPagado: this.redondear(resumenPagos.recargoManualPagado),
      numeroPagos: resumenPagos.numeroPagos,
    };

    // Construir array de pagos con detalles
    const pagosPdf: PagoDetallePdfDto[] = pagos.map((pago, index) => ({
      numero: index + 1,
      fechaPago: pago.fechaPago,
      montoPagado: Number(pago.montoPagado),
      capitalAplicado: Number(pago.capitalAplicado),
      interesAplicado: Number(pago.interesAplicado),
      recargosAplicado: Number(pago.recargosAplicado),
      moratorioAplicado: Number(pago.interesMoratorioAplicado),
      recargoManualAplicado: Number(pago.recargoManualAplicado || 0),
      numeroPago: pago.numeroPago,
    }));

    return {
      institucion,
      cliente,
      prestamo: prestamoPdf,
      saldos,
      resumenPagos: resumenPagosPdf,
      pagos: pagosPdf,
      fechaEmision: new Date(),
    };
  }

  /**
   * Genera el PDF del estado de cuenta
   */
  async generarPdf(prestamoId: number): Promise<PDFKit.PDFDocument> {
    const datos = await this.obtenerDatosEstadoCuenta(prestamoId);

    // Obtener el logo (convertir WebP a PNG si es necesario)
    let logoBuffer: Buffer | null = null;
    if (!logoBufferCache) {
      const logoPath = getLogoPath();
      if (logoPath) {
        logoBufferCache = await convertWebpToPngBuffer(logoPath);
      }
    }
    logoBuffer = logoBufferCache;

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      },
    });

    // Encabezado (con logo)
    this.generarEncabezado(doc, datos, logoBuffer);

    // Datos del cliente
    this.generarSeccionCliente(doc, datos.cliente);

    // Datos del préstamo
    this.generarSeccionPrestamo(doc, datos.prestamo);

    // Saldos actuales
    this.generarSeccionSaldos(doc, datos.saldos);

    // Tabla de pagos (sin resumen, solo detalle)
    this.generarTablaPagos(doc, datos.pagos);

    // Pie de página
    this.generarPiePagina(doc, datos.fechaEmision);

    // Finalizar documento
    doc.end();

    return doc;
  }

  /**
   * Genera el encabezado del PDF (con logo)
   */
  private generarEncabezado(doc: PDFKit.PDFDocument, datos: EstadoCuentaPdfDto, logoBuffer: Buffer | null) {
    const startY = 40;
    const col1 = 40;
    const col2 = 160;
    const col3 = 400;

    // Columna 1: Logo de la empresa
    try {
      if (logoBuffer) {
        doc.image(logoBuffer, col1, startY, { width: 80 });
      }
    } catch (error) {
      console.error('Error al cargar el logo:', error);
    }

    // Columna 2: Nombre de la institución y título
    doc.fontSize(12).font('Helvetica-Bold').text(datos.institucion.nombre, col2, startY);
    doc.fontSize(8).font('Helvetica').text(datos.institucion.direccion, col2, startY + 14);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#006064').text('ESTADO DE CUENTA', col2, startY + 32);
    doc.fillColor('black');

    // Columna 3: Número de crédito y fecha (alineado a la derecha)
    doc.fontSize(9).font('Helvetica-Bold').text('Crédito No.:', col3, startY);
    doc.font('Helvetica').text(datos.prestamo.numeroCredito, col3 + 55, startY);

    doc.fontSize(8).font('Helvetica-Bold').text('Fecha:', col3, startY + 14);
    doc.font('Helvetica').text(this.formatearFecha(datos.fechaEmision), col3 + 30, startY + 14);

    // Línea separadora del encabezado (color corporativo)
    doc.moveTo(40, startY + 58).lineTo(572, startY + 58).strokeColor('#006064').lineWidth(2).stroke();
    doc.strokeColor('black').lineWidth(1);

    doc.y = startY + 70;
  }

  /**
   * Genera la sección de datos del cliente (3 columnas)
   */
  private generarSeccionCliente(doc: PDFKit.PDFDocument, cliente: ClientePdfDto) {
    doc.fontSize(11).font('Helvetica-Bold').text('DATOS DEL CLIENTE', 40, doc.y, { align: 'left' });
    doc.moveDown(0.3);

    // Línea separadora
    doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    const startY = doc.y;
    const col1 = 40;
    const col2 = 220;
    const col3 = 400;
    const lineHeight = 14;

    doc.fontSize(8).font('Helvetica');

    // Fila 1
    doc.font('Helvetica-Bold').text('Nombre:', col1, startY);
    doc.font('Helvetica').text(cliente.nombreCompleto, col1 + 45, startY);

    doc.font('Helvetica-Bold').text('DUI:', col2, startY);
    doc.font('Helvetica').text(cliente.numeroDui, col2 + 25, startY);

    doc.font('Helvetica-Bold').text('Teléfono:', col3, startY);
    doc.font('Helvetica').text(cliente.telefono, col3 + 45, startY);

    // Fila 2
    const row2Y = startY + lineHeight;
    doc.font('Helvetica-Bold').text('Email:', col1, row2Y);
    doc.font('Helvetica').text(cliente.correoElectronico || 'N/A', col1 + 35, row2Y);

    doc.font('Helvetica-Bold').text('Dirección:', col2, row2Y);
    doc.font('Helvetica').text(cliente.direccion, col2 + 50, row2Y, { width: 280 });

    doc.y = row2Y + lineHeight + 10;
  }

  /**
   * Genera la sección de datos del préstamo (3 columnas)
   */
  private generarSeccionPrestamo(doc: PDFKit.PDFDocument, prestamo: PrestamoPdfDto) {
    doc.fontSize(11).font('Helvetica-Bold').text('DATOS DEL PRÉSTAMO', 40, doc.y, { align: 'left' });
    doc.moveDown(0.3);

    // Línea separadora
    doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    const startY = doc.y;
    const col1 = 40;
    const col2 = 220;
    const col3 = 400;
    const lineHeight = 14;

    doc.fontSize(8).font('Helvetica');

    // Fila 1
    doc.font('Helvetica-Bold').text('Tipo Crédito:', col1, startY);
    doc.font('Helvetica').text(prestamo.tipoCredito, col1 + 60, startY);

    doc.font('Helvetica-Bold').text('Monto:', col2, startY);
    doc.font('Helvetica').text(`$${this.formatearMoneda(prestamo.montoDesembolsado)}`, col2 + 35, startY);

    doc.font('Helvetica-Bold').text('Plazo:', col3, startY);
    doc.font('Helvetica').text(`${prestamo.plazoMeses} meses`, col3 + 30, startY);

    // Fila 2
    const row2Y = startY + lineHeight;
    doc.font('Helvetica-Bold').text('Tasa Interés:', col1, row2Y);
    doc.font('Helvetica').text(this.formatearPorcentaje(prestamo.tasaInteres), col1 + 60, row2Y);

    doc.font('Helvetica-Bold').text('Tasa Mora:', col2, row2Y);
    doc.font('Helvetica').text(this.formatearPorcentaje(prestamo.tasaInteresMoratorio), col2 + 55, row2Y);

    doc.font('Helvetica-Bold').text('Periodicidad:', col3, row2Y);
    doc.font('Helvetica').text(prestamo.periodicidadPago, col3 + 60, row2Y);

    // Fila 3
    const row3Y = row2Y + lineHeight;
    doc.font('Helvetica-Bold').text('F. Otorgamiento:', col1, row3Y);
    doc.font('Helvetica').text(this.formatearFecha(prestamo.fechaOtorgamiento), col1 + 75, row3Y);

    doc.font('Helvetica-Bold').text('F. Vencimiento:', col2, row3Y);
    doc.font('Helvetica').text(this.formatearFecha(prestamo.fechaVencimiento), col2 + 70, row3Y);

    doc.font('Helvetica-Bold').text('Estado:', col3, row3Y);
    doc.font('Helvetica').text(prestamo.estado, col3 + 35, row3Y);

    doc.y = row3Y + lineHeight + 10;
  }

  /**
   * Genera la sección de saldos actuales (3 columnas con fondo destacado)
   */
  private generarSeccionSaldos(doc: PDFKit.PDFDocument, saldos: SaldosPdfDto) {
    doc.fontSize(11).font('Helvetica-Bold').text('SALDOS ACTUALES', 40, doc.y, { align: 'left' });
    doc.moveDown(0.3);

    // Fondo gris para la sección de saldos
    const tableTop = doc.y;
    doc
      .rect(40, tableTop, 532, 50)
      .fillAndStroke('#f5f5f5', '#cccccc');

    doc.fillColor('black');
    doc.y = tableTop + 8;

    const col1 = 50;
    const col2 = 230;
    const col3 = 410;
    const lineHeight = 14;

    doc.fontSize(8);

    // Fila 1
    const row1Y = doc.y;
    doc.font('Helvetica-Bold').text('Saldo Capital:', col1, row1Y);
    doc.font('Helvetica').text(`$${this.formatearMoneda(saldos.saldoCapital)}`, col1 + 65, row1Y);

    doc.font('Helvetica-Bold').text('Saldo Interés:', col2, row1Y);
    doc.font('Helvetica').text(`$${this.formatearMoneda(saldos.saldoInteres)}`, col2 + 65, row1Y);

    doc.font('Helvetica-Bold').text('Días Mora:', col3, row1Y);
    doc.font('Helvetica').text(`${saldos.diasMora}`, col3 + 50, row1Y);

    // Fila 2
    const row2Y = row1Y + lineHeight;
    doc.font('Helvetica-Bold').text('Capital Mora:', col1, row2Y);
    doc.font('Helvetica').text(`$${this.formatearMoneda(saldos.capitalMora)}`, col1 + 65, row2Y);

    doc.font('Helvetica-Bold').text('Interés Mora:', col2, row2Y);
    doc.font('Helvetica').text(`$${this.formatearMoneda(saldos.interesMora)}`, col2 + 65, row2Y);

    doc.font('Helvetica-Bold').fillColor('#d32f2f').text('SALDO TOTAL:', col3, row2Y);
    doc.font('Helvetica-Bold').text(`$${this.formatearMoneda(saldos.saldoTotal)}`, col3 + 70, row2Y);
    doc.fillColor('black');

    doc.y = tableTop + 60;
  }

  /**
   * Genera la sección de resumen de pagos
   */
  private generarSeccionResumenPagos(
    doc: PDFKit.PDFDocument,
    resumen: ResumenPagosPdfDto,
  ) {
    doc.fontSize(12).font('Helvetica-Bold').text('RESUMEN DE PAGOS REALIZADOS');

    doc.moveDown(0.5);

    const leftColumn = 50;
    const rightColumn = 320;
    const startY = doc.y;

    doc.fontSize(9).font('Helvetica');

    // Columna izquierda
    doc.text(`Número de Pagos: ${resumen.numeroPagos}`, leftColumn, doc.y);
    doc.text(
      `Capital Pagado: $${this.formatearMoneda(resumen.capitalPagado)}`,
      leftColumn,
      doc.y + 15,
    );
    doc.text(
      `Interés Pagado: $${this.formatearMoneda(resumen.interesPagado)}`,
      leftColumn,
      doc.y + 15,
    );

    // Columna derecha
    doc.text(
      `Recargos Pagados: $${this.formatearMoneda(resumen.recargosPagado)}`,
      rightColumn,
      startY,
    );
    doc.text(
      `Mora Pagada: $${this.formatearMoneda(resumen.moratorioPagado)}`,
      rightColumn,
      doc.y + 15,
    );
    doc.text(
      `TOTAL PAGADO: $${this.formatearMoneda(resumen.totalPagado)}`,
      rightColumn,
      doc.y + 15,
    )
      .font('Helvetica-Bold');

    doc.moveDown(2);
  }

  /**
   * Genera la tabla de pagos
   */
  private generarTablaPagos(doc: PDFKit.PDFDocument, pagos: PagoDetallePdfDto[]) {
    doc.fontSize(11).font('Helvetica-Bold').text('DETALLE DE PAGOS REALIZADOS', 40, doc.y, { align: 'left' });
    doc.moveDown(0.3);

    // Verificar si necesitamos una nueva página
    if (doc.y > 580) {
      doc.addPage();
      doc.y = 40;
    }

    const tableTop = doc.y;
    const tableLeft = 40;
    const tableWidth = 532;

    // Definir columnas (ajustadas para que quepan en la página)
    const columns = [
      { header: 'No.', width: 25 },
      { header: 'Fecha', width: 55 },
      { header: 'Monto', width: 60 },
      { header: 'Capital', width: 60 },
      { header: 'Interés', width: 55 },
      { header: 'Otros', width: 55 },
      { header: 'Mora', width: 50 },
      { header: 'Rec. mora', width: 55 },
      { header: 'No. Recibo', width: 117 },
    ];

    let currentX = tableLeft;

    // Fondo del encabezado
    doc.rect(tableLeft, tableTop, tableWidth, 14).fillAndStroke('#e0e0e0', '#999999');
    doc.fillColor('black');

    // Dibujar encabezados
    doc.fontSize(8).font('Helvetica-Bold');
    currentX = tableLeft;

    columns.forEach((col) => {
      doc.text(col.header, currentX + 2, tableTop + 3, {
        width: col.width - 4,
        align: 'left',
      });
      currentX += col.width;
    });

    // Dibujar filas de datos
    let currentY = tableTop + 16;
    doc.fontSize(7).font('Helvetica');
    let rowIndex = 0;

    if (pagos.length === 0) {
      doc.fontSize(9).font('Helvetica-Oblique').text('No se han registrado pagos', tableLeft, currentY + 5, {
        width: tableWidth,
        align: 'center',
      });
      currentY += 25;
    }

    pagos.forEach((pago) => {
      // Verificar si necesitamos una nueva página
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;

        // Fondo del encabezado en nueva página
        doc.rect(tableLeft, currentY, tableWidth, 14).fillAndStroke('#e0e0e0', '#999999');
        doc.fillColor('black');

        // Redibujar encabezados en la nueva página
        currentX = tableLeft;
        doc.fontSize(8).font('Helvetica-Bold');
        columns.forEach((col) => {
          doc.text(col.header, currentX + 2, currentY + 3, {
            width: col.width - 4,
            align: 'left',
          });
          currentX += col.width;
        });
        currentY += 16;
        doc.fontSize(7).font('Helvetica');
        rowIndex = 0;
      }

      // Fondo alternado para filas
      if (rowIndex % 2 === 1) {
        doc.rect(tableLeft, currentY - 1, tableWidth, 13).fill('#f9f9f9');
        doc.fillColor('black');
      }

      currentX = tableLeft;

      // No.
      doc.text(pago.numero.toString(), currentX + 2, currentY, {
        width: columns[0].width - 4,
        align: 'center',
      });
      currentX += columns[0].width;

      // Fecha
      doc.text(this.formatearFecha(pago.fechaPago), currentX + 2, currentY, {
        width: columns[1].width - 4,
        align: 'center',
      });
      currentX += columns[1].width;

      // Monto
      doc.text(`$${this.formatearMoneda(pago.montoPagado)}`, currentX, currentY, {
        width: columns[2].width - 4,
        align: 'right',
      });
      currentX += columns[2].width;

      // Capital
      doc.text(`$${this.formatearMoneda(pago.capitalAplicado)}`, currentX, currentY, {
        width: columns[3].width - 4,
        align: 'right',
      });
      currentX += columns[3].width;

      // Interés
      doc.text(`$${this.formatearMoneda(pago.interesAplicado)}`, currentX, currentY, {
        width: columns[4].width - 4,
        align: 'right',
      });
      currentX += columns[4].width;

      // Recargos
      doc.text(`$${this.formatearMoneda(pago.recargosAplicado)}`, currentX, currentY, {
        width: columns[5].width - 4,
        align: 'right',
      });
      currentX += columns[5].width;

      // Mora
      doc.text(`$${this.formatearMoneda(pago.moratorioAplicado)}`, currentX, currentY, {
        width: columns[6].width - 4,
        align: 'right',
      });
      currentX += columns[6].width;

      // Recargo Manual
      doc.text(`$${this.formatearMoneda(pago.recargoManualAplicado)}`, currentX, currentY, {
        width: columns[7].width - 4,
        align: 'right',
      });
      currentX += columns[7].width;

      // No. Pago
      doc.text(pago.numeroPago, currentX + 2, currentY, {
        width: columns[8].width - 4,
        align: 'center',
      });

      currentY += 13;
      rowIndex++;
    });

    // Línea al final de la tabla
    doc.moveTo(tableLeft, currentY).lineTo(tableLeft + tableWidth, currentY).stroke('#999999');

    doc.y = currentY + 10;
  }

  /**
   * Genera el pie de página
   */
  private generarPiePagina(doc: PDFKit.PDFDocument, fechaEmision: Date) {
    const bottomY = 730;

    // Línea separadora
    doc.moveTo(40, bottomY - 10).lineTo(572, bottomY - 10).stroke('#cccccc');

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        `Documento generado el ${this.formatearFechaHora(fechaEmision)} | Este documento es informativo`,
        40,
        bottomY,
        {
          width: 532,
          align: 'center',
        },
      );

    doc.fillColor('black');
  }

  /**
   * Formatea un número como moneda
   */
  private formatearMoneda(valor: number): string {
    return valor.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Formatea un número como porcentaje
   * La tasa ya viene como porcentaje (ej: 12 = 12%), no como decimal
   */
  private formatearPorcentaje(valor: number): string {
    return `${Number(valor).toFixed(2)}%`;
  }

  /**
   * Formatea una fecha
   */
  private formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea una fecha con hora
   */
  private formatearFechaHora(fecha: Date): string {
    const date = new Date(fecha);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Redondea a 2 decimales
   */
  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
