#!/usr/bin/env python3
"""
Generador de Solicitudes SQL para FINANZIA
==========================================

Este script lee el archivo de préstamos existente y genera automáticamente
170 solicitudes de crédito correspondientes a cada préstamo.

Autor: Sistema FINANZIA
Fecha: 2026-01-26
"""

import re
from datetime import datetime, timedelta
from pathlib import Path

def extraer_datos_prestamos(archivo_prestamos):
    """
    Extrae los datos de cada préstamo del archivo SQL.

    Returns:
        list: Lista de tuplas con datos de préstamos
              (id, personaId, numeroCredito, tipoCreditoId, montoAutorizado,
               plazoAutorizado, tasaInteres, fechaOtorgamiento, estado)
    """
    print(f"📖 Leyendo archivo: {archivo_prestamos}")

    try:
        with open(archivo_prestamos, 'r', encoding='utf-8') as f:
            contenido = f.read()
    except FileNotFoundError:
        print(f"❌ Error: No se encuentra el archivo {archivo_prestamos}")
        return []
    except Exception as e:
        print(f"❌ Error al leer archivo: {e}")
        return []

    # Patrón regex para extraer datos de cada INSERT
    # Captura: id, personaId, numeroCredito, tipoCreditoId, montoAutorizado,
    #          plazoAutorizado, tasaInteres, fechaOtorgamiento, estado
    patron = r"VALUES\s*\(\s*(\d+),\s*NULL,\s*(\d+),\s*'([^']+)',\s*(\d+),\s*([0-9.]+),\s*[0-9.]+,\s*(\d+),\s*([0-9.]+),[^']*'[^']*',\s*'[^']*',\s*'([^']*)',.*?'(\d{4}-\d{2}-\d{2})'[^']*'(\d{4}-\d{2}-\d{2})'[^']*'(\d{4}-\d{2}-\d{2})'[^']*(?:'(\d{4}-\d{2}-\d{2})')?[^']*NULL[^']*'[A-E]'[^']*NULL[^']*'(VIGENTE|CANCELADO|MORA)'"

    matches = re.findall(patron, contenido, re.DOTALL)

    if not matches:
        # Patrón simplificado alternativo
        print("⚠️ Primer patrón no encontró resultados, probando patrón simplificado...")
        patron_simple = r"INSERT INTO prestamo.*?VALUES\s*\(\s*(\d+),\s*NULL,\s*(\d+),\s*'([^']+)',\s*(\d+),\s*([0-9.]+),[^,]*,\s*(\d+),\s*([0-9.]+)"
        matches_simple = re.findall(patron_simple, contenido, re.DOTALL)

        if matches_simple:
            print(f"✅ Encontrados {len(matches_simple)} préstamos con patrón simplificado")
            # Agregar fecha estimada y estado por defecto
            matches = [(m[0], m[1], m[2], m[3], m[4], m[5], m[6],
                       '2025-02-03', 'VIGENTE') for m in matches_simple]
        else:
            print("❌ No se pudieron extraer datos de préstamos")
            return []

    print(f"✅ Extraídos {len(matches)} préstamos del archivo")
    return matches

def generar_numero_solicitud(index, anio=2025):
    """
    Genera un número de solicitud único.

    Args:
        index: Número secuencial de solicitud (1-170)
        anio: Año de la solicitud

    Returns:
        str: Número de solicitud en formato SOL-{ANIO}-{NUMERO}
    """
    return f"SOL-{anio}-{index:06d}"

def calcular_fechas_solicitud(fecha_otorgamiento_str):
    """
    Calcula fechas estimadas de solicitud y aprobación.

    Args:
        fecha_otorgamiento_str: Fecha de otorgamiento en formato YYYY-MM-DD

    Returns:
        tuple: (fecha_solicitud, fecha_aprobacion) en formato YYYY-MM-DD
    """
    try:
        fecha_otorg = datetime.strptime(fecha_otorgamiento_str, '%Y-%m-%d')
    except ValueError:
        # Si hay error, usar fecha por defecto
        fecha_otorg = datetime(2025, 2, 3)

    fecha_solicitud = (fecha_otorg - timedelta(days=7)).strftime('%Y-%m-%d')
    fecha_aprobacion = (fecha_otorg - timedelta(days=1)).strftime('%Y-%m-%d')

    return fecha_solicitud, fecha_aprobacion

def generar_sql_solicitudes(prestamos, archivo_salida):
    """
    Genera el archivo SQL con todas las solicitudes.

    Args:
        prestamos: Lista de datos de préstamos
        archivo_salida: Ruta del archivo SQL de salida
    """
    print(f"\n📝 Generando SQL para {len(prestamos)} solicitudes...")

    sql_lines = [
        "-- =====================================================",
        "-- SOLICITUDES COMPLETAS - GENERADAS AUTOMÁTICAMENTE",
        f"-- Total: {len(prestamos)} solicitudes",
        "-- Generado: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "-- =====================================================",
        "--",
        "-- Este script genera solicitudes basadas en préstamos existentes.",
        "-- Cada solicitud corresponde 1:1 con un préstamo.",
        "--",
        "-- IMPORTANTE: Ejecutar DESPUÉS de importar personas y direcciones",
        "--             pero ANTES de importar préstamos.",
        "--",
        "-- =====================================================\n",
        "USE micro_app;\n",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "SET AUTOCOMMIT = 0;\n",
        "-- Obtener IDs de catálogos necesarios",
        "SET @estadoDesembolsada = (SELECT id FROM estado_solicitud WHERE codigo = 'DESEMBOLSADA' LIMIT 1);",
        "SET @lineaCreditoMicro = (SELECT id FROM linea_credito WHERE codigo = 'MICRO' LIMIT 1);\n",
        "-- =====================================================",
        "-- INSERTAR SOLICITUDES",
        "-- =====================================================\n"
    ]

    for i, prestamo in enumerate(prestamos, 1):
        # Desempaquetar datos del préstamo
        if len(prestamo) >= 9:
            prestamo_id, persona_id, numero_credito, tipo_credito_id, monto, plazo, tasa, fecha_otorg, estado = prestamo[:9]
        else:
            # Datos mínimos con valores por defecto
            prestamo_id, persona_id, numero_credito, tipo_credito_id, monto, plazo, tasa = prestamo[:7]
            fecha_otorg = '2025-02-03'
            estado = 'VIGENTE'

        # Generar datos de solicitud
        numero_sol = generar_numero_solicitud(i)
        fecha_solicitud, fecha_aprobacion = calcular_fechas_solicitud(fecha_otorg)

        # Determinar destino de crédito (todos son microcréditos de capital de trabajo)
        destino = 'CAPITAL_TRABAJO'

        # Generar observación
        observacion = f"Solicitud generada automáticamente desde préstamo {numero_credito}"
        if estado == 'CANCELADO':
            observacion += ". Préstamo cancelado."

        # Construir INSERT
        sql_lines.append(f"-- Solicitud {i}: Préstamo {numero_credito} - Persona {persona_id}")
        sql_lines.append("INSERT INTO solicitud (")
        sql_lines.append("    id, numeroSolicitud, personaId, lineaCreditoId, tipoCreditoId,")
        sql_lines.append("    montoSolicitado, plazoSolicitado, tasaInteresPropuesta,")
        sql_lines.append("    destinoCredito, estadoId,")
        sql_lines.append("    montoAprobado, plazoAprobado, tasaInteresAprobada,")
        sql_lines.append("    fechaSolicitud, fechaAprobacion,")
        sql_lines.append("    analistaId, nombreAnalista,")
        sql_lines.append("    observaciones, categoriaRiesgo")
        sql_lines.append(") VALUES (")
        sql_lines.append(f"    {prestamo_id}, '{numero_sol}', {persona_id}, @lineaCreditoMicro, {tipo_credito_id},")
        sql_lines.append(f"    {monto}, {plazo}, {tasa},")
        sql_lines.append(f"    '{destino}', @estadoDesembolsada,")
        sql_lines.append(f"    {monto}, {plazo}, {tasa},")
        sql_lines.append(f"    '{fecha_solicitud}', '{fecha_aprobacion}',")
        sql_lines.append(f"    1, 'Sistema',")
        sql_lines.append(f"    '{observacion}', 'A'")
        sql_lines.append(");\n")

        # Mostrar progreso cada 20 solicitudes
        if i % 20 == 0:
            print(f"  ⏳ Procesadas {i}/{len(prestamos)} solicitudes...")

    # Footer del script
    sql_lines.extend([
        "COMMIT;\n",
        "-- =====================================================",
        "-- ACTUALIZAR SECUENCIA",
        "-- =====================================================\n",
        f"ALTER TABLE solicitud AUTO_INCREMENT = {len(prestamos) + 1};\n",
        "-- =====================================================",
        "-- VERIFICACIÓN",
        "-- =====================================================\n",
        "SELECT '======================================' AS '';",
        "SELECT '=== SOLICITUDES GENERADAS ===' AS '';",
        "SELECT '======================================' AS '';\n",
        "SELECT 'Solicitudes creadas:' AS 'Tabla', COUNT(*) AS 'Registros' FROM solicitud;",
        "SELECT 'Personas con solicitudes:' AS 'Estadística', COUNT(DISTINCT personaId) AS 'Total' FROM solicitud;",
        "SELECT 'Estado de solicitudes:' AS 'Estadística',",
        "    es.nombre AS Estado,",
        "    COUNT(*) AS Cantidad",
        "FROM solicitud s",
        "JOIN estado_solicitud es ON s.estadoId = es.id",
        "GROUP BY es.nombre",
        "ORDER BY COUNT(*) DESC;\n",
        "SELECT '======================================' AS '';\n",
        "SET FOREIGN_KEY_CHECKS = 1;",
        "SET AUTOCOMMIT = 1;\n",
        "-- =====================================================",
        f"-- SCRIPT COMPLETADO - {len(prestamos)} solicitudes generadas",
        "-- ====================================================="
    ])

    # Escribir archivo
    try:
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_lines))
        print(f"\n✅ Archivo generado exitosamente: {archivo_salida}")
        print(f"📊 Total de solicitudes generadas: {len(prestamos)}")
        return True
    except Exception as e:
        print(f"\n❌ Error al escribir archivo: {e}")
        return False

def main():
    """Función principal del script."""
    print("=" * 60)
    print("GENERADOR DE SOLICITUDES SQL - FINANZIA")
    print("=" * 60)
    print()

    # Configuración de archivos
    directorio_base = Path(__file__).parent
    archivo_prestamos = directorio_base / "03_insert_prestamos_mysql.sql"
    archivo_salida = directorio_base / "05_generate_solicitudes_mysql.sql"

    # Verificar que existe el archivo de préstamos
    if not archivo_prestamos.exists():
        print(f"❌ Error: No se encuentra el archivo de préstamos:")
        print(f"   {archivo_prestamos}")
        print()
        print("Asegúrese de que el archivo 03_insert_prestamos_mysql.sql")
        print("esté en el mismo directorio que este script.")
        return 1

    # Extraer datos de préstamos
    prestamos = extraer_datos_prestamos(archivo_prestamos)

    if not prestamos:
        print("\n❌ No se pudieron extraer datos de préstamos.")
        print("Revise el formato del archivo 03_insert_prestamos_mysql.sql")
        return 1

    # Generar SQL de solicitudes
    if generar_sql_solicitudes(prestamos, archivo_salida):
        print("\n" + "=" * 60)
        print("✅ PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        print()
        print(f"Archivo generado: {archivo_salida.name}")
        print(f"Solicitudes creadas: {len(prestamos)}")
        print()
        print("Próximos pasos:")
        print("1. Revisar el archivo generado")
        print("2. Ejecutar en MySQL después de importar personas y direcciones")
        print("3. Continuar con la importación de préstamos")
        print()
        return 0
    else:
        print("\n❌ Error al generar el archivo SQL")
        return 1

if __name__ == "__main__":
    exit(main())
