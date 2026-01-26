@echo off
REM =============================================
REM Script de conversión PostgreSQL a MySQL
REM =============================================

echo ======================================================================
echo CONVERSION DE SQL: PostgreSQL - MySQL
echo ======================================================================
echo.

cd /d "C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO"

REM Convertir 01_insert_personas.sql
echo Procesando: 01_insert_personas.sql
sed -e "s/\"\([^\"]*\)\"/\`\1\`/g" -e "/SELECT setval/d" "01_insert_personas.sql" > "01_insert_personas_mysql.sql"
echo   - Generado: 01_insert_personas_mysql.sql
echo.

REM Convertir 02_insert_direcciones.sql
echo Procesando: 02_insert_direcciones.sql
sed -e "s/\"\([^\"]*\)\"/\`\1\`/g" -e "/SELECT setval/d" "02_insert_direcciones.sql" > "02_insert_direcciones_mysql.sql"
echo   - Generado: 02_insert_direcciones_mysql.sql
echo.

REM Convertir 03_insert_prestamos.sql
echo Procesando: 03_insert_prestamos.sql
sed -e "s/\"\([^\"]*\)\"/\`\1\`/g" -e "/SELECT setval/d" "03_insert_prestamos.sql" > "03_insert_prestamos_mysql.sql"
echo   - Generado: 03_insert_prestamos_mysql.sql
echo.

REM Convertir 04_insert_pagos.sql
echo Procesando: 04_insert_pagos.sql
sed -e "s/\"\([^\"]*\)\"/\`\1\`/g" -e "/SELECT setval/d" "04_insert_pagos.sql" > "04_insert_pagos_mysql.sql"
echo   - Generado: 04_insert_pagos_mysql.sql
echo.

echo ======================================================================
echo Conversion completada exitosamente
echo ======================================================================
echo.
echo Archivos generados:
echo   - 01_insert_personas_mysql.sql
echo   - 02_insert_direcciones_mysql.sql
echo   - 03_insert_prestamos_mysql.sql
echo   - 04_insert_pagos_mysql.sql
echo.

pause
