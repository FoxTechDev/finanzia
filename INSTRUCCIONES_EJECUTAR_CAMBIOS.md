# Instrucciones para Ejecutar los Cambios - Periodicidad DIARIA

## Resumen de Cambios

Se modificó el formulario de solicitud de crédito para que cuando se seleccione la periodicidad de pago **DIARIA**, en lugar de mostrar campos de fecha, se muestre un único campo numérico llamado **"Número de Días de Pago"**.

**Archivo modificado:**
- `micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts`

---

## Opción 1: Ejecutar en Desarrollo

### 1. Backend (Terminal 1)

```bash
# Navegar al directorio del backend
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\backend

# Instalar dependencias (si es necesario)
npm install

# Ejecutar en modo desarrollo
npm run start:dev
```

**Resultado esperado:**
```
[Nest] 12345  - 31/01/2024, 10:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 31/01/2024, 10:00:00     LOG [InstanceLoader] AppModule dependencies initialized
...
[Nest] 12345  - 31/01/2024, 10:00:01     LOG [NestApplication] Nest application successfully started
```

Backend estará disponible en: **http://localhost:3000**

---

### 2. Frontend (Terminal 2)

```bash
# Navegar al directorio del frontend
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend

# Instalar dependencias (si es necesario)
npm install

# Ejecutar en modo desarrollo
npm start
# o
ng serve
```

**Resultado esperado:**
```
✔ Browser application bundle generation complete.

Initial Chunk Files | Names         |  Raw Size
polyfills.js        | polyfills     |  88.49 kB |
main.js             | main          |  15.35 kB |
styles.css          | styles        | 189.65 kB |

** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **

✔ Compiled successfully.
```

Frontend estará disponible en: **http://localhost:4200**

---

### 3. Abrir en Navegador

1. Abrir navegador (Chrome, Firefox, Edge)
2. Ir a: **http://localhost:4200**
3. Iniciar sesión con tus credenciales
4. Navegar a: **Créditos → Solicitudes → Nueva Solicitud**
5. Seguir las instrucciones del archivo `PRUEBA_RAPIDA_PERIODICIDAD_DIARIA.md`

---

## Opción 2: Compilar para Producción

### 1. Compilar Frontend

```bash
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend

# Compilar en modo producción
npm run build
# o
ng build --configuration=production
```

**Resultado esperado:**
```
✔ Browser application bundle generation complete.
✔ Copying assets complete.
✔ Index html generation complete.

Output location: C:\Users\javie\...\micro-app\frontend\dist\micro-app
Application bundle generation complete. [30.123 seconds]
```

Los archivos compilados estarán en: `micro-app/frontend/dist/micro-app`

---

### 2. Servir Archivos Estáticos (Opcional)

Si quieres servir los archivos compilados localmente:

```bash
# Instalar servidor estático (si no lo tienes)
npm install -g serve

# Servir archivos
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend\dist\micro-app
serve -s . -p 4200
```

---

## Opción 3: Ejecutar Solo el Componente Modificado

Si quieres verificar solo el componente en Angular:

```bash
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO\micro-app\frontend

# Verificar sintaxis TypeScript
npx tsc --noEmit

# Verificar que no hay errores en el componente específico
npx tsc --noEmit src/app/features/creditos/components/solicitudes/solicitud-form.component.ts
```

**Sin errores:** No imprime nada
**Con errores:** Imprime lista de errores

---

## Verificar Cambios Específicos

### Ver qué cambió en el archivo

```bash
cd C:\Users\javie\OneDrive\Documentos\DESARROLLO\MICRO

# Ver cambios en Git (si tienes Git)
git diff micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts
```

### Buscar el nuevo campo en el código

```bash
# Buscar referencias a "numeroDiasPago"
cd micro-app/frontend
grep -n "numeroDiasPago" src/app/features/creditos/components/solicitudes/solicitud-form.component.ts
```

**Resultado esperado:**
```
964:      numeroDiasPago: [''], // Campo para periodicidad DIARIA
975:    this.condicionesForm.get('numeroDiasPago')?.valueChanges.pipe(
...
```

---

## Comandos Útiles Durante Desarrollo

### Reiniciar servidor de desarrollo

**Backend:**
```bash
# Ctrl+C para detener
# Luego:
npm run start:dev
```

**Frontend:**
```bash
# Ctrl+C para detener
# Luego:
npm start
```

---

### Limpiar caché y reinstalar

Si algo no funciona correctamente:

**Backend:**
```bash
cd micro-app/backend
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

**Frontend:**
```bash
cd micro-app/frontend
rm -rf node_modules package-lock.json .angular
npm install
npm start
```

---

### Ver logs en tiempo real

**Backend (consola):**
Los logs se muestran automáticamente en la terminal donde ejecutaste `npm run start:dev`

**Frontend (navegador):**
1. Abrir DevTools: **F12** o **Ctrl+Shift+I**
2. Ir a pestaña **Console**
3. Filtrar por "solicitud" o "periodicidad" si es necesario

---

## Troubleshooting

### Error: "Puerto 3000 ya en uso"

**Backend:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número_del_proceso] /F

# Luego reiniciar
npm run start:dev
```

---

### Error: "Puerto 4200 ya en uso"

**Frontend:**
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID [número_del_proceso] /F

# O ejecutar en otro puerto
ng serve --port 4300
```

---

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
cd micro-app/frontend
npm install

# O instalar módulo específico
npm install @angular/material
```

---

### Error de compilación TypeScript

```bash
# Limpiar y recompilar
cd micro-app/frontend
rm -rf .angular/cache
npm start
```

---

### Error: "NullInjectorError: No provider for..."

Verificar que todos los módulos estén importados correctamente:

```typescript
// En solicitud-form.component.ts
imports: [
  CommonModule,
  ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  // ... etc
]
```

---

## Verificación Rápida de Funcionamiento

### Test de 30 segundos

1. Abrir frontend: **http://localhost:4200**
2. Login
3. Ir a **Créditos → Solicitudes → Nueva Solicitud**
4. Seleccionar un cliente
5. Seleccionar tipo de crédito
6. Seleccionar periodicidad: **DIARIO**
7. ✅ **Debe aparecer:** Campo "Número de Días de Pago"
8. Ingresar **30**
9. ✅ **Debe sincronizar:** Campo "Plazo (días)" = 30
10. ✅ **Test exitoso!**

---

## Archivos de Documentación

Después de ejecutar, revisa estos archivos para más detalles:

1. **`RESUMEN_MODIFICACION_PERIODICIDAD_DIARIA.md`**
   - Documentación técnica completa
   - Descripción de todos los cambios
   - Funciones modificadas/eliminadas

2. **`CAMBIOS_PERIODICIDAD_DIARIA_RESUMEN.md`**
   - Comparación visual antes/después
   - Métricas de mejora
   - Casos de uso

3. **`PRUEBA_RAPIDA_PERIODICIDAD_DIARIA.md`**
   - Guía paso a paso para testing
   - Checklist de verificación
   - Casos de error conocidos

---

## Próximos Pasos Recomendados

### Después de Verificar que Funciona

1. **Commit de los cambios:**
   ```bash
   git add micro-app/frontend/src/app/features/creditos/components/solicitudes/solicitud-form.component.ts
   git commit -m "feat: agregar campo Número de Días para periodicidad DIARIA en formulario de solicitud

   - Reemplazar campos de fecha por campo numérico simple
   - Validaciones: min 1, max 365, requerido
   - Sincronización automática con campo plazoSolicitado
   - Mejora UX: más intuitivo y rápido
   - Reducción de código: -82% de lógica compleja

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   ```

2. **Push a tu rama:**
   ```bash
   git push origin [tu-rama]
   ```

3. **Crear Pull Request** para code review

4. **Deploy a staging** para testing QA

5. **UAT (User Acceptance Testing)** con usuarios reales

6. **Deploy a producción** cuando esté aprobado

---

## Contacto y Soporte

Si tienes problemas ejecutando los cambios:

1. Revisar logs de consola (frontend y backend)
2. Verificar que las versiones de Node.js y npm son compatibles:
   ```bash
   node --version  # Debería ser >= 18.x
   npm --version   # Debería ser >= 9.x
   ```
3. Revisar archivo `PRUEBA_RAPIDA_PERIODICIDAD_DIARIA.md` sección "En Caso de Problemas"

---

**Autor:** Claude Code (Anthropic)
**Fecha:** 2026-01-31
**Versión:** 1.0.0
**Estado:** ✅ Listo para Testing
