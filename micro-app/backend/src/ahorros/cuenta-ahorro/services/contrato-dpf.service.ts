import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { BeneficiarioCuentaAhorro } from '../entities/beneficiario-cuenta-ahorro.entity';

@Injectable()
export class ContratoDpfService {
  constructor(
    @InjectRepository(CuentaAhorro)
    private readonly cuentaRepo: Repository<CuentaAhorro>,
    @InjectRepository(BeneficiarioCuentaAhorro)
    private readonly beneficiarioRepo: Repository<BeneficiarioCuentaAhorro>,
  ) {}

  async generarContrato(cuentaId: number): Promise<Buffer> {
    // 1. Cargar datos
    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuentaId },
      relations: [
        'persona',
        'tipoAhorro',
        'tipoAhorro.lineaAhorro',
        'banco',
      ],
    });

    if (!cuenta) {
      throw new NotFoundException(`Cuenta con ID ${cuentaId} no encontrada`);
    }

    if (cuenta.tipoAhorro?.lineaAhorro?.codigo !== 'DPF') {
      throw new NotFoundException('Solo se puede generar contrato para DPF');
    }

    const beneficiarios = await this.beneficiarioRepo.find({
      where: { cuentaAhorroId: cuentaId },
      order: { id: 'ASC' },
    });

    // 2. Cargar plantilla
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'PLANTILLADPF.docx',
    );
    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);

    // 3. Obtener y procesar document.xml
    let xml = zip.file('word/document.xml')!.asText();

    // 4. Normalizar runs (merge split placeholders)
    xml = this.normalizeRuns(xml);

    // 5. Duplicar filas de beneficiarios
    xml = this.expandBeneficiarios(xml, beneficiarios);

    // 6. Reemplazar placeholders
    const monto = Number(cuenta.monto);
    const fechaApertura = this.formatDate(cuenta.fechaApertura);
    const fechaVencimiento = this.formatDate(cuenta.fechaVencimiento);
    const nombrePersona = `${cuenta.persona?.nombre || ''} ${cuenta.persona?.apellido || ''}`.trim();

    const replacements: Record<string, string> = {
      $NOCUENTA: cuenta.noCuenta || '',
      $MONTO: `$${monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      $NOMBREPERSONA: nombrePersona,
      $MONTOENLETRAS: this.numeroALetras(monto),
      $PLAZODIAS: `${cuenta.plazo || 0} días`,
      $FECHAAPERTURA: fechaApertura,
      '#FECHAVENCIMIENTO': fechaVencimiento,
      $TASAINTERES: `${Number(cuenta.tasaInteres)}%`,
      $CUENTABANCO: cuenta.cuentaBancoNumero || '',
      $NOMBREBANCO: cuenta.banco?.nombre || '',
      $PROPIETARIOCUENTA: cuenta.cuentaBancoPropietario || '',
      $DUIPERSONA: cuenta.persona?.numeroDui || '',
    };

    // Reemplazar los más largos primero para evitar que $MONTO capture $MONTOENLETRAS
    const sortedKeys = Object.keys(replacements).sort(
      (a, b) => b.length - a.length,
    );
    for (const placeholder of sortedKeys) {
      xml = xml
        .split(this.escapeXml(placeholder))
        .join(this.escapeXml(replacements[placeholder]));
    }

    // 7. Guardar y retornar
    zip.file('word/document.xml', xml);
    return zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    }) as Buffer;
  }

  /**
   * Normaliza runs en el XML del DOCX.
   * Word suele dividir un placeholder como "$NOCUENTA" en múltiples runs:
   *   <w:t>$</w:t></w:r><w:r>...<w:t>NOCUENTA</w:t>
   * Esta función detecta y fusiona esos runs partidos.
   */
  private normalizeRuns(xml: string): string {
    const knownPlaceholders = [
      'NOCUENTA',
      'MONTO',
      'NOMBREPERSONA',
      'MONTOENLETRAS',
      'PLAZODIAS',
      'FECHAAPERTURA',
      'FECHAVENCIMIENTO',
      'TASAINTERES',
      'CUENTABANCO',
      'NOMBREBANCO',
      'PROPIETARIOCUENTA',
      'DUIPERSONA',
      'NOMBREBENEFICIAIRO',
      'PARENTESCO',
      'DIRECCION',
      'PORCENTAJE',
    ];

    // Process each paragraph
    const pRegex = /(<w:p[ >][\s\S]*?<\/w:p>)/g;
    xml = xml.replace(pRegex, (paragraph) => {
      // Extract all <w:t> texts and their positions to build full text
      const tRegex = /<w:t([^>]*)>([^<]*)<\/w:t>/g;
      const tMatches: Array<{
        fullMatch: string;
        attrs: string;
        text: string;
        index: number;
      }> = [];
      let m: RegExpExecArray | null;
      while ((m = tRegex.exec(paragraph)) !== null) {
        tMatches.push({
          fullMatch: m[0],
          attrs: m[1],
          text: m[2],
          index: m.index,
        });
      }

      if (tMatches.length <= 1) return paragraph;

      // Build concatenated text
      const fullText = tMatches.map((t) => t.text).join('');

      // Check for each placeholder
      for (const ph of knownPlaceholders) {
        const markers = [`$${ph}`, `#${ph}`];
        for (const marker of markers) {
          if (!fullText.includes(marker)) continue;

          // Find which runs contain parts of this marker
          let pos = 0;
          const markerStart = fullText.indexOf(marker);
          if (markerStart === -1) continue;
          const markerEnd = markerStart + marker.length;

          // Map character positions to run indices
          let charOffset = 0;
          let startRunIdx = -1;
          let endRunIdx = -1;

          for (let i = 0; i < tMatches.length; i++) {
            const runStart = charOffset;
            const runEnd = charOffset + tMatches[i].text.length;

            if (markerStart >= runStart && markerStart < runEnd) {
              startRunIdx = i;
            }
            if (markerEnd > runStart && markerEnd <= runEnd) {
              endRunIdx = i;
            }

            charOffset = runEnd;
          }

          // If placeholder spans multiple runs, merge
          if (
            startRunIdx !== -1 &&
            endRunIdx !== -1 &&
            startRunIdx !== endRunIdx
          ) {
            // Put full marker text in startRun, clear the rest
            const startRun = tMatches[startRunIdx];
            const endRun = tMatches[endRunIdx];

            // Calculate the text before the marker in startRun
            let charsBefore = 0;
            for (let i = 0; i < startRunIdx; i++) {
              charsBefore += tMatches[i].text.length;
            }
            const offsetInStartRun = markerStart - charsBefore;

            // Calculate text after marker in endRun
            let charsBeforeEnd = 0;
            for (let i = 0; i < endRunIdx; i++) {
              charsBeforeEnd += tMatches[i].text.length;
            }
            const offsetInEndRun = markerEnd - charsBeforeEnd;

            // New text for first run: prefix + marker + (nothing for now, end suffix handled in last run)
            const prefix = startRun.text.substring(0, offsetInStartRun);
            const suffix = endRun.text.substring(offsetInEndRun);

            // Update paragraph XML: replace each <w:t> tag
            // First run gets: prefix + marker
            const newStartText = prefix + marker;
            paragraph = paragraph.replace(
              startRun.fullMatch,
              `<w:t${startRun.attrs}>${newStartText}</w:t>`,
            );

            // Middle runs (between start and end) get empty text
            for (let i = startRunIdx + 1; i < endRunIdx; i++) {
              paragraph = paragraph.replace(
                tMatches[i].fullMatch,
                `<w:t${tMatches[i].attrs}></w:t>`,
              );
            }

            // End run gets: suffix only
            paragraph = paragraph.replace(
              endRun.fullMatch,
              `<w:t${endRun.attrs}>${suffix}</w:t>`,
            );

            // Update tMatches for subsequent iterations
            tMatches[startRunIdx] = {
              ...startRun,
              text: newStartText,
              fullMatch: `<w:t${startRun.attrs}>${newStartText}</w:t>`,
            };
            for (let i = startRunIdx + 1; i < endRunIdx; i++) {
              tMatches[i] = {
                ...tMatches[i],
                text: '',
                fullMatch: `<w:t${tMatches[i].attrs}></w:t>`,
              };
            }
            tMatches[endRunIdx] = {
              ...endRun,
              text: suffix,
              fullMatch: `<w:t${endRun.attrs}>${suffix}</w:t>`,
            };
          }
        }
      }

      return paragraph;
    });

    return xml;
  }

  /**
   * Duplica la fila de la tabla de beneficiarios para cada beneficiario
   */
  private expandBeneficiarios(
    xml: string,
    beneficiarios: BeneficiarioCuentaAhorro[],
  ): string {
    // Find the table row that contains $NOMBREBENEFICIAIRO
    const trRegex = /<w:tr[ >][\s\S]*?<\/w:tr>/g;
    let m: RegExpExecArray | null;
    let templateRow: string | null = null;
    let templateRowIndex = -1;

    while ((m = trRegex.exec(xml)) !== null) {
      if (
        m[0].includes('NOMBREBENEFICIAIRO') ||
        m[0].includes('PARENTESCO')
      ) {
        // Check concatenated text
        const tTexts: string[] = [];
        const tReg = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let tm: RegExpExecArray | null;
        while ((tm = tReg.exec(m[0])) !== null) {
          tTexts.push(tm[1]);
        }
        const fullText = tTexts.join('');
        if (
          fullText.includes('$NOMBREBENEFICIAIRO') ||
          fullText.includes('NOMBREBENEFICIAIRO')
        ) {
          templateRow = m[0];
          templateRowIndex = m.index;
          break;
        }
      }
    }

    if (!templateRow || beneficiarios.length === 0) {
      // If no beneficiarios, replace placeholders with empty
      xml = xml
        .replace(/\$NOMBREBENEFICIAIRO/g, '')
        .replace(/\$PARENTESCO/g, '')
        .replace(/\$DIRECCION/g, '')
        .replace(/\$PORCENTAJE/g, '');
      return xml;
    }

    // Generate one row per beneficiary
    const rows = beneficiarios
      .map((b) => {
        let row = templateRow!;
        const nombre = `${b.nombre || ''} ${b.apellidos || ''}`.trim();
        row = row
          .split('$NOMBREBENEFICIAIRO')
          .join(this.escapeXml(nombre));
        row = row
          .split('$PARENTESCO')
          .join(this.escapeXml(b.parentesco || ''));
        row = row
          .split('$DIRECCION')
          .join(this.escapeXml(b.direccion || ''));
        row = row
          .split('$PORCENTAJE')
          .join(this.escapeXml(`${b.porcentajeBeneficio}%`));
        return row;
      })
      .join('');

    // Replace the template row with all generated rows
    xml =
      xml.substring(0, templateRowIndex) +
      rows +
      xml.substring(templateRowIndex + templateRow.length);

    return xml;
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const dia = d.getUTCDate().toString().padStart(2, '0');
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const mes = meses[d.getUTCMonth()];
    const anio = d.getUTCFullYear();
    return `${dia} de ${mes} de ${anio}`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convierte un número a su representación en letras (español)
   * Ejemplo: 1500.50 -> "MIL QUINIENTOS DÓLARES CON 50/100"
   */
  private numeroALetras(num: number): string {
    const entero = Math.floor(num);
    const centavos = Math.round((num - entero) * 100);

    const letras = this.enteroALetras(entero);
    const centavosStr = centavos.toString().padStart(2, '0');

    return `${letras} ${centavosStr}/100 dólares`;
  }

  private enteroALetras(n: number): string {
    if (n === 0) return 'cero';
    if (n < 0) return 'menos ' + this.enteroALetras(-n);

    const unidades = [
      '',
      'uno',
      'dos',
      'tres',
      'cuatro',
      'cinco',
      'seis',
      'siete',
      'ocho',
      'nueve',
    ];
    const especiales = [
      'diez',
      'once',
      'doce',
      'trece',
      'catorce',
      'quince',
    ];
    const decenas = [
      '',
      'diez',
      'veinte',
      'treinta',
      'cuarenta',
      'cincuenta',
      'sesenta',
      'setenta',
      'ochenta',
      'noventa',
    ];
    const centenas = [
      '',
      'ciento',
      'doscientos',
      'trescientos',
      'cuatrocientos',
      'quinientos',
      'seiscientos',
      'setecientos',
      'ochocientos',
      'novecientos',
    ];

    const convertirGrupo = (num: number): string => {
      if (num === 0) return '';
      if (num === 100) return 'cien';

      let result = '';

      if (num >= 100) {
        result += centenas[Math.floor(num / 100)] + ' ';
        num %= 100;
      }

      if (num >= 10 && num <= 15) {
        result += especiales[num - 10];
        return result.trim();
      }

      if (num >= 16 && num <= 19) {
        result += 'dieci' + unidades[num - 10];
        return result.trim();
      }

      if (num >= 20 && num <= 29 && num !== 20) {
        result += 'veinti' + unidades[num - 20];
        return result.trim();
      }

      if (num >= 10) {
        result += decenas[Math.floor(num / 10)];
        num %= 10;
        if (num > 0) {
          result += ' y ' + unidades[num];
        }
        return result.trim();
      }

      if (num > 0) {
        result += unidades[num];
      }

      return result.trim();
    };

    if (n >= 1000000) {
      const millones = Math.floor(n / 1000000);
      const resto = n % 1000000;
      let result =
        millones === 1
          ? 'un millón'
          : convertirGrupo(millones) + ' millones';
      if (resto > 0) {
        result += ' ' + this.enteroALetras(resto);
      }
      return result;
    }

    if (n >= 1000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      let result = miles === 1 ? 'mil' : convertirGrupo(miles) + ' mil';
      if (resto > 0) {
        result += ' ' + convertirGrupo(resto);
      }
      return result;
    }

    return convertirGrupo(n);
  }
}
