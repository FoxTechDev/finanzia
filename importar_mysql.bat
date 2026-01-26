@echo off
REM =============================================
REM Script de Importación a MySQL
REM Base de datos: micro_app
REM =============================================

echo ======================================================================
echo IMPORTACION DE DATOS A MYSQL
echo ======================================================================
echo.
echo Base de datos: micro_app
echo Servidor: localhost:3306
echo Usuario: root
echo.
echo IMPORTANTE: Este script importara 1,273 registros:
echo   - 67 personas
echo   - 67 direcciones
echo   - 170 prestamos
echo   - 969 pagos
echo.
echo ======================================================================
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

echo Iniciando importacion...
echo.

REM Ejecutar importación
mysql -u root -proot -h localhost -P 3306 micro_app < import_all_mysql.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo IMPORTACION COMPLETADA EXITOSAMENTE
    echo ======================================================================
    echo.
    echo Todos los datos han sido importados correctamente.
    echo Verifica los resultados mostrados arriba.
    echo.
) else (
    echo.
    echo ======================================================================
    echo ERROR EN LA IMPORTACION
    echo ======================================================================
    echo.
    echo Codigo de error: %ERRORLEVEL%
    echo.
    echo Posibles causas:
    echo   - MySQL no esta en ejecucion
    echo   - Credenciales incorrectas
    echo   - Base de datos 'micro_app' no existe
    echo   - Tablas no han sido creadas
    echo.
    echo Verifica el archivo README_IMPORTACION_MYSQL.md para mas ayuda.
    echo.
)

pause
