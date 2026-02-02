@echo off
echo ================================================
echo MIGRACION: Nuevos Campos de Clientes
echo ================================================
echo.
echo Esta migracion agregara:
echo - Tabla dependencia_familiar
echo - Campos de vivienda en direccion
echo - Campos de ingresos/gastos en actividad_economica
echo.
echo IMPORTANTE: Se recomienda hacer un backup de la BD antes de ejecutar
echo.
pause

echo.
echo Compilando proyecto...
call npm run build

echo.
echo Mostrando migraciones pendientes...
npx typeorm migration:show -d dist/config/typeorm.config.js

echo.
echo ================================================
echo Deseas ejecutar la migracion? (S/N)
echo ================================================
set /p confirmar=

if /i "%confirmar%"=="S" (
    echo.
    echo Ejecutando migracion...
    npx typeorm migration:run -d dist/config/typeorm.config.js
    echo.
    echo ================================================
    echo Migracion completada!
    echo ================================================
) else (
    echo.
    echo Migracion cancelada.
)

echo.
pause
