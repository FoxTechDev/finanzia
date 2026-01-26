@echo off
echo =============================================
echo Ejecutando importacion de datos MySQL
echo =============================================

cd /d "C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO"

echo Limpiando tablas existentes...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app < cleanup_before_import.sql

echo Importando personas...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app < 01_insert_personas_mysql.sql

echo Importando direcciones...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app < 02_insert_direcciones_mysql.sql

echo Importando prestamos...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app < 03_insert_prestamos_mysql.sql

echo Importando pagos...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app < 04_insert_pagos_mysql.sql

echo.
echo =============================================
echo Verificando importacion...
echo =============================================
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot micro_app -e "SELECT 'Personas' AS Tabla, COUNT(*) AS Registros FROM persona UNION ALL SELECT 'Direcciones', COUNT(*) FROM direccion UNION ALL SELECT 'Prestamos', COUNT(*) FROM prestamo UNION ALL SELECT 'Pagos', COUNT(*) FROM pago;"

echo.
echo Importacion completada!
