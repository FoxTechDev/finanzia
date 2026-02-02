@echo off
echo ===============================================
echo  MIGRACION: Tipo Vivienda de ENUM a Tabla
echo ===============================================
echo.

REM Configurar variables de entorno
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_NAME=finanzia

echo Este script ejecutara la migracion de tipo_vivienda
echo.
echo IMPORTANTE:
echo - Asegurate de tener un backup de la base de datos
echo - Verifica las credenciales de conexion en este script
echo.
echo Base de datos: %DB_NAME%
echo Host: %DB_HOST%
echo Puerto: %DB_PORT%
echo Usuario: %DB_USER%
echo.
set /p continuar=Deseas continuar? (S/N):

if /i "%continuar%" neq "S" (
    echo Operacion cancelada.
    pause
    exit /b
)

echo.
echo Ejecutando migracion...
echo.

REM Ejecutar el script SQL
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p %DB_NAME% < migracion-tipo-vivienda.sql

if %errorlevel% equ 0 (
    echo.
    echo ===============================================
    echo  MIGRACION COMPLETADA EXITOSAMENTE
    echo ===============================================
    echo.
    echo IMPORTANTE: Revisa los resultados de la verificacion
    echo Si todo esta correcto, descomenta la linea final
    echo del script SQL para eliminar la columna antigua.
    echo.
) else (
    echo.
    echo ===============================================
    echo  ERROR EN LA MIGRACION
    echo ===============================================
    echo.
    echo Revisa los errores arriba y corrige antes de continuar.
    echo.
)

pause
