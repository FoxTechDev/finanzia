@echo off
REM =====================================================
REM Script de Configuración Automática de Catálogos
REM =====================================================

echo.
echo ========================================
echo   CONFIGURACION DE CATALOGOS
echo ========================================
echo.

REM Configuración de base de datos
set DB_HOST=localhost
set DB_USER=root
set DB_NAME=micro_app

echo [1/6] Generando módulos TypeScript...
node generate-catalogos.js
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar módulos TypeScript
    pause
    exit /b 1
)
echo ✓ Módulos generados exitosamente

echo.
echo [2/6] Creando tablas de catálogos en la base de datos...
mysql -h %DB_HOST% -u %DB_USER% -p %DB_NAME% < src\database\migrations\create-catalogos-tables.sql
if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear tablas
    pause
    exit /b 1
)
echo ✓ Tablas creadas exitosamente

echo.
echo [3/6] Insertando datos iniciales...
mysql -h %DB_HOST% -u %DB_USER% -p %DB_NAME% < src\database\seeds\catalogos-data.sql
if %errorlevel% neq 0 (
    echo ERROR: Fallo al insertar datos
    pause
    exit /b 1
)
echo ✓ Datos iniciales insertados

echo.
echo [4/6] Agregando columnas FK y migrando datos...
mysql -h %DB_HOST% -u %DB_USER% -p %DB_NAME% < src\database\migrations\add-catalog-foreign-keys.sql
if %errorlevel% neq 0 (
    echo ERROR: Fallo al agregar FKs
    pause
    exit /b 1
)
echo ✓ Relaciones creadas y datos migrados

echo.
echo [5/6] Instalando dependencias (si es necesario)...
npm install
echo ✓ Dependencias verificadas

echo.
echo [6/6] Compilando proyecto...
npm run build
if %errorlevel% neq 0 (
    echo ADVERTENCIA: Fallo al compilar, revisa los errores de TypeScript
    echo Debes actualizar las entidades manualmente
)

echo.
echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Siguientes pasos:
echo   1. Actualizar entidades TypeScript (ver INSTRUCCIONES_CATALOGOS.md)
echo   2. Actualizar DTOs
echo   3. Actualizar servicios
echo   4. Registrar CatalogosModule en app.module.ts
echo   5. Probar con: npm run start:dev
echo   6. Verificar endpoints con test-catalogos.http
echo.
echo Documentación: INSTRUCCIONES_CATALOGOS.md
echo Resumen: CATALOGOS_RESUMEN.md
echo.

pause
