@echo off
echo =============================================
echo Ejecutando scripts de catalogos MySQL
echo =============================================

cd /d "C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\backend"

echo Creando tablas de catalogos...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app < src\database\migrations\create-catalogos-tables.sql

echo Insertando datos iniciales...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app < src\database\seeds\catalogos-data.sql

echo.
echo =============================================
echo Verificando tablas creadas...
echo =============================================
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app -e "SELECT 'estado_garantia' AS Tabla, COUNT(*) AS Registros FROM estado_garantia UNION ALL SELECT 'recomendacion_asesor', COUNT(*) FROM recomendacion_asesor UNION ALL SELECT 'tipo_decision_comite', COUNT(*) FROM tipo_decision_comite UNION ALL SELECT 'tipo_pago', COUNT(*) FROM tipo_pago UNION ALL SELECT 'estado_pago', COUNT(*) FROM estado_pago UNION ALL SELECT 'sexo', COUNT(*) FROM sexo UNION ALL SELECT 'estado_solicitud', COUNT(*) FROM estado_solicitud UNION ALL SELECT 'destino_credito', COUNT(*) FROM destino_credito UNION ALL SELECT 'estado_cuota', COUNT(*) FROM estado_cuota UNION ALL SELECT 'tipo_interes', COUNT(*) FROM tipo_interes UNION ALL SELECT 'periodicidad_pago', COUNT(*) FROM periodicidad_pago UNION ALL SELECT 'tipo_calculo', COUNT(*) FROM tipo_calculo;"

echo.
echo Catalogos creados exitosamente!
