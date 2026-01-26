#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de conversión de SQL PostgreSQL a MySQL
Convierte archivos SQL de sintaxis PostgreSQL a sintaxis MySQL

Transformaciones aplicadas:
1. Reemplaza comillas dobles ("columna") con backticks (`columna`)
2. Elimina comandos PostgreSQL específicos (SELECT setval...)
3. Asegura compatibilidad con MySQL

Autor: Sistema ETL
Fecha: 2026-01-24
"""

import re
import os
from pathlib import Path


def convert_postgres_to_mysql(input_file, output_file):
    """
    Convierte un archivo SQL de PostgreSQL a MySQL.

    Procesa el archivo línea por línea para manejar archivos grandes
    sin cargar todo el contenido en memoria.

    Args:
        input_file (str): Ruta del archivo PostgreSQL de entrada
        output_file (str): Ruta del archivo MySQL de salida
    """

    print(f"Procesando: {input_file}")
    print(f"Generando: {output_file}")

    lines_processed = 0
    lines_modified = 0
    lines_removed = 0

    with open(input_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', encoding='utf-8') as outfile:

        for line in infile:
            lines_processed += 1
            original_line = line

            # Saltar líneas con comandos PostgreSQL específicos
            if 'SELECT setval(' in line:
                lines_removed += 1
                # Agregar comentario indicando que se removió
                outfile.write(f"-- REMOVIDO (PostgreSQL específico): {line.strip()}\n")
                continue

            # Reemplazar comillas dobles por backticks en nombres de columnas/tablas
            # Patrón: "nombreColumna" -> `nombreColumna`
            modified_line = re.sub(r'"([^"]+)"', r'`\1`', line)

            if modified_line != original_line:
                lines_modified += 1

            outfile.write(modified_line)

    print(f"  - Líneas procesadas: {lines_processed:,}")
    print(f"  - Líneas modificadas: {lines_modified:,}")
    print(f"  - Líneas removidas: {lines_removed}")
    print(f"  ✓ Conversión completada\n")

    return {
        'processed': lines_processed,
        'modified': lines_modified,
        'removed': lines_removed
    }


def main():
    """
    Función principal que convierte todos los archivos SQL.
    """

    print("=" * 70)
    print("CONVERSIÓN DE SQL: PostgreSQL → MySQL")
    print("=" * 70)
    print()

    # Directorio base
    base_dir = Path(r"C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO")

    # Archivos a convertir (sin extensión)
    files_to_convert = [
        '01_insert_personas',
        '02_insert_direcciones',
        '03_insert_prestamos',
        '04_insert_pagos'
    ]

    # Estadísticas globales
    total_stats = {
        'processed': 0,
        'modified': 0,
        'removed': 0
    }

    # Convertir cada archivo
    for filename in files_to_convert:
        input_file = base_dir / f"{filename}.sql"
        output_file = base_dir / f"{filename}_mysql.sql"

        if not input_file.exists():
            print(f"⚠ ADVERTENCIA: No se encontró {input_file}")
            continue

        stats = convert_postgres_to_mysql(str(input_file), str(output_file))

        # Acumular estadísticas
        total_stats['processed'] += stats['processed']
        total_stats['modified'] += stats['modified']
        total_stats['removed'] += stats['removed']

    # Crear archivo maestro de importación para MySQL
    print("=" * 70)
    print("Creando archivo maestro de importación MySQL...")

    import_file = base_dir / "import_all_mysql.sql"

    with open(import_file, 'w', encoding='utf-8') as f:
        f.write("""-- =============================================
-- SCRIPT MAESTRO DE IMPORTACIÓN MYSQL
-- Base de datos: micro_app
-- Servidor: localhost:3306
-- Usuario: root
-- =============================================
--
-- Este script importa todos los datos en el orden correcto
-- para mantener la integridad referencial.
--
-- ORDEN DE IMPORTACIÓN:
-- 1. Personas (tabla base)
-- 2. Direcciones (referencia a personas)
-- 3. Préstamos (referencia a personas)
-- 4. Pagos (referencia a préstamos)
-- =============================================

-- Seleccionar la base de datos
USE micro_app;

-- Deshabilitar verificaciones de claves foráneas temporalmente
-- para permitir importación más rápida
SET FOREIGN_KEY_CHECKS = 0;

-- Deshabilitar autocommit para mejor rendimiento
SET AUTOCOMMIT = 0;

-- =============================================
-- IMPORTAR PERSONAS
-- =============================================
SOURCE 01_insert_personas_mysql.sql;
COMMIT;

-- =============================================
-- IMPORTAR DIRECCIONES
-- =============================================
SOURCE 02_insert_direcciones_mysql.sql;
COMMIT;

-- =============================================
-- IMPORTAR PRÉSTAMOS
-- =============================================
SOURCE 03_insert_prestamos_mysql.sql;
COMMIT;

-- =============================================
-- IMPORTAR PAGOS
-- =============================================
SOURCE 04_insert_pagos_mysql.sql;
COMMIT;

-- Rehabilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Rehabilitar autocommit
SET AUTOCOMMIT = 1;

-- =============================================
-- VERIFICACIÓN DE DATOS IMPORTADOS
-- =============================================

SELECT '=== RESUMEN DE IMPORTACIÓN ===' AS '';

SELECT 'Personas importadas:' AS 'Tabla', COUNT(*) AS 'Registros' FROM persona
UNION ALL
SELECT 'Direcciones importadas:', COUNT(*) FROM direccion
UNION ALL
SELECT 'Préstamos importados:', COUNT(*) FROM prestamo
UNION ALL
SELECT 'Pagos importados:', COUNT(*) FROM pago;

SELECT '=== IMPORTACIÓN COMPLETADA ===' AS '';
""")

    print(f"  ✓ Archivo creado: {import_file}")
    print()

    # Resumen final
    print("=" * 70)
    print("RESUMEN DE CONVERSIÓN")
    print("=" * 70)
    print(f"Total de líneas procesadas: {total_stats['processed']:,}")
    print(f"Total de líneas modificadas: {total_stats['modified']:,}")
    print(f"Total de líneas removidas: {total_stats['removed']}")
    print()
    print("ARCHIVOS GENERADOS:")
    print(f"  - 01_insert_personas_mysql.sql")
    print(f"  - 02_insert_direcciones_mysql.sql")
    print(f"  - 03_insert_prestamos_mysql.sql")
    print(f"  - 04_insert_pagos_mysql.sql")
    print(f"  - import_all_mysql.sql (archivo maestro)")
    print()
    print("=" * 70)
    print("INSTRUCCIONES DE USO:")
    print("=" * 70)
    print("Para importar los datos en MySQL, ejecute:")
    print()
    print("  mysql -u root -p -h localhost -P 3306 micro_app < import_all_mysql.sql")
    print()
    print("O desde el cliente MySQL:")
    print()
    print("  USE micro_app;")
    print("  SOURCE import_all_mysql.sql;")
    print()
    print("=" * 70)
    print("✓ Conversión completada exitosamente")
    print("=" * 70)


if __name__ == '__main__':
    main()
