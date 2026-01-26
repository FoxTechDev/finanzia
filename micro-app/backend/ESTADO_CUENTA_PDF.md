# Endpoint de Estado de Cuenta en PDF

## Descripción

Este endpoint genera un reporte profesional en PDF del estado de cuenta de un préstamo, incluyendo toda la información relevante del cliente, préstamo, saldos actuales y detalle de todos los pagos realizados.

## Endpoint

```
GET /api/pagos/prestamo/:prestamoId/estado-cuenta-pdf
```

## Parámetros

- **prestamoId** (number, requerido): ID del préstamo para el cual se generará el estado de cuenta

## Respuesta

- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="estado-cuenta-{numeroCredito}.pdf"`
- El PDF se descarga automáticamente con el nombre del archivo basado en el número de crédito

## Estructura del PDF

El PDF generado contiene las siguientes secciones:

### 1. Encabezado
- Nombre de la institución: **FINANZIA S.C. DE R.L. DE C.V.**
- Dirección de la institución
- Título del documento: **ESTADO DE CUENTA**
- Número de crédito

### 2. Datos del Cliente
- Nombre completo
- DUI
- Teléfono
- Email
- Dirección completa (departamento, municipio, detalle)

### 3. Datos del Préstamo
- Tipo de crédito
- Monto desembolsado
- Plazo (en meses)
- Periodicidad de pago
- Tasa de interés
- Tasa de interés moratorio
- Fecha de otorgamiento
- Fecha de vencimiento

### 4. Saldos Actuales
Sección destacada con fondo gris que muestra:
- Saldo capital
- Saldo interés
- Capital en mora
- Interés moratorio
- Días en mora
- **Saldo total** (en negrita)

### 5. Resumen de Pagos Realizados
- Número de pagos realizados
- Capital pagado
- Interés pagado
- Recargos pagados
- Mora pagada
- **Total pagado** (en negrita)

### 6. Detalle de Pagos
Tabla con todos los pagos aplicados:
- No. (número secuencial)
- Fecha de pago
- Monto pagado
- Capital aplicado
- Interés aplicado
- Recargos aplicados
- Mora aplicada
- Número de pago (identificador único)

### 7. Pie de Página
- Fecha y hora de emisión del reporte
- Nota informativa

## Ejemplo de Uso

### cURL
```bash
curl -X GET "http://localhost:3000/api/pagos/prestamo/123/estado-cuenta-pdf" \
  -H "Authorization: Bearer {token}" \
  -o "estado-cuenta.pdf"
```

### JavaScript (Fetch API)
```javascript
async function descargarEstadoCuenta(prestamoId) {
  const response = await fetch(
    `http://localhost:3000/api/pagos/prestamo/${prestamoId}/estado-cuenta-pdf`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `estado-cuenta-${prestamoId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Uso
descargarEstadoCuenta(123);
```

### Axios
```javascript
async function descargarEstadoCuenta(prestamoId) {
  const response = await axios.get(
    `/api/pagos/prestamo/${prestamoId}/estado-cuenta-pdf`,
    {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `estado-cuenta-${prestamoId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
```

## Códigos de Estado HTTP

- **200 OK**: PDF generado correctamente
- **404 Not Found**: El préstamo no existe
- **500 Internal Server Error**: Error al generar el PDF

## Archivos Relacionados

### DTOs
- `src/creditos/pagos/dto/estado-cuenta-pdf.dto.ts` - Define las estructuras de datos para el PDF

### Servicios
- `src/creditos/pagos/services/estado-cuenta-pdf.service.ts` - Lógica de generación del PDF
- `src/creditos/pagos/services/pago-consulta.service.ts` - Consulta de datos de pagos

### Controladores
- `src/creditos/pagos/controllers/pago.controller.ts` - Endpoint del controlador

### Módulos
- `src/creditos/pagos/pagos.module.ts` - Registro del servicio

## Dependencias

Este endpoint utiliza las siguientes librerías:

```json
{
  "pdfkit": "^0.15.2",
  "@types/pdfkit": "^0.13.5"
}
```

## Notas Técnicas

1. **Streaming**: El PDF se genera como stream para optimizar el uso de memoria
2. **Paginación automática**: Si los pagos exceden el espacio disponible, se crean páginas adicionales automáticamente
3. **Formato de moneda**: Todos los montos se formatean con 2 decimales (ej: $1,234.56)
4. **Formato de porcentaje**: Las tasas se muestran como porcentaje (ej: 12.50%)
5. **Formato de fecha**: dd/mm/yyyy (ej: 24/01/2026)
6. **Redondeo**: Todos los cálculos se redondean a 2 decimales para evitar errores de precisión

## Personalización

Para personalizar el PDF, puedes modificar:

1. **Nombre y dirección de la institución**: En el método `obtenerDatosEstadoCuenta` del servicio
2. **Colores y estilos**: En los métodos de generación del PDF (fuentes, tamaños, colores de fondo)
3. **Estructura de las secciones**: Modificando los métodos privados de generación (`generarSeccionCliente`, etc.)
4. **Logo**: Agregando un logo en el encabezado (requiere la imagen en el servidor)

## Seguridad

Recomendaciones de seguridad:

1. **Autenticación**: Asegúrate de que el endpoint esté protegido con autenticación JWT
2. **Autorización**: Verifica que el usuario solo pueda acceder a sus propios estados de cuenta
3. **Rate limiting**: Implementa límite de solicitudes para evitar abuso
4. **Validación de parámetros**: El ParseIntPipe ya valida que el ID sea numérico

## Troubleshooting

### El PDF no se descarga
- Verifica que el `Content-Type` sea `application/pdf`
- Asegúrate de que el frontend maneje correctamente la respuesta blob

### Error de memoria
- Si hay muchos pagos, considera implementar paginación en la tabla
- Verifica que el stream se esté cerrando correctamente

### Formato incorrecto
- Verifica que las relaciones de TypeORM estén cargadas correctamente
- Asegúrate de que los datos del préstamo incluyan las relaciones necesarias
