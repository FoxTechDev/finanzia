# Componente de Recibo de Pago para Impresora Térmica

Este componente genera e imprime recibos de pago optimizados para impresoras térmicas de 80mm.

## Especificaciones de Impresión

- **Ancho del papel**: 80mm
- **Resolución**: 203 PPI
- **Fuente**: Courier New (monoespaciada)
- **Formato**: Texto plano con caracteres especiales para separadores

## Uso del Componente

### 1. Como Componente Standalone

```typescript
import { ReciboPagoComponent } from './components/pagos/recibo-pago/recibo-pago.component';

// En tu componente
<app-recibo-pago [pagoId]="123"></app-recibo-pago>
```

### 2. Como Ruta Independiente

El componente está disponible en la ruta: `/creditos/pagos/:id/recibo`

### 3. Abrir en Nueva Ventana

```typescript
const url = this.router.serializeUrl(
  this.router.createUrlTree(['/creditos/pagos', pagoId, 'recibo'])
);
window.open(url, '_blank', 'width=400,height=800');
```

## Integración con Componentes Existentes

### En Registrar Pago Dialog

Después de crear un pago exitosamente, se muestra un botón "Imprimir Recibo" que abre el recibo en una nueva ventana.

### En Detalle de Pago Dialog

Si el pago está en estado "APLICADO", se muestra un botón "Imprimir Recibo" en las acciones del diálogo.

## Estructura del Recibo

```
================================
    FINANZIA S.C. DE R.L. DE C.V.
================================

RECIBO DE PAGO
N°: PAG2026000001
Fecha: 23/01/2026

--------------------------------
CLIENTE
Nombre: Juan Pérez García
DUI: 12345678-9

--------------------------------
PRÉSTAMO
Código: CRE-2026-0001
Tipo: Crédito Personal

--------------------------------
DETALLE DEL PAGO

Monto Pagado:        $500.00

Distribución:
  Capital:           $400.00
  Interés:           $ 80.00
  Recargos:          $ 10.00
  Mora:              $ 10.00

--------------------------------
SALDOS
Saldo Anterior:    $2,500.00
Saldo Actual:      $2,100.00

--------------------------------


_____________________________
Firma del Cliente


Usuario: admin
Impreso: 23/01/2026 16:30:45
================================
```

## Endpoint del Backend

El componente consume el siguiente endpoint:

```
GET /api/pagos/:id/recibo
```

**Respuesta esperada:**

```typescript
interface ReciboData {
  numeroPago: string;
  fechaPago: string;
  fechaImpresion: string;

  cliente: {
    nombre: string;
    apellido: string;
    numeroDui: string;
  };

  prestamo: {
    numeroCredito: string;
    tipoCredito: string;
  };

  montoPagado: number;
  distribucion: {
    capitalAplicado: number;
    interesAplicado: number;
    recargosAplicado: number;
    interesMoratorioAplicado: number;
  };

  saldoAnterior: number;
  saldoActual: number;
  nombreUsuario: string;
}
```

## Estilos de Impresión

El componente incluye estilos específicos para impresión usando `@media print`:

- Ancho fijo de 80mm
- Márgenes mínimos
- Fuente monoespaciada
- Blanco y negro estricto
- Sin bordes ni sombras
- Optimizado para impresoras térmicas

## Configuración de la Impresora

Para obtener mejores resultados:

1. Configurar la impresora en modo "Recibo" o "Thermal"
2. Establecer el ancho del papel en 80mm
3. Deshabilitar márgenes
4. Usar resolución de 203 DPI
5. Configurar en blanco y negro

## Testing

Para probar el recibo sin imprimir:

1. Abrir el recibo en el navegador
2. Usar "Vista Previa de Impresión" (Ctrl + P)
3. Verificar que el diseño se ajuste correctamente
4. Seleccionar "Guardar como PDF" para guardar una copia

## Características

- ✅ Carga dinámica de datos desde el backend
- ✅ Diseño responsive para pantalla
- ✅ Estilos optimizados para impresión térmica
- ✅ Botón de impresión rápida
- ✅ Opción de abrir en nueva ventana
- ✅ Manejo de errores y estados de carga
- ✅ Formato de moneda consistente
- ✅ Área para firma del cliente
- ✅ Información de auditoría (usuario y fecha de impresión)

## Notas Importantes

1. **Fuente Monoespaciada**: Es crucial usar una fuente monoespaciada como Courier New para mantener la alineación de los separadores de texto.

2. **Medidas en mm**: Los estilos de impresión usan medidas en milímetros para ser precisos con el papel de 80mm.

3. **Sin Colores**: Las impresoras térmicas son monocromo, por lo que todos los colores se convierten a negro en impresión.

4. **Papel Térmico**: El papel térmico se desvanece con el tiempo y es sensible al calor y la luz. Considere generar también un PDF para archivo permanente.

## Solución de Problemas

### El recibo no se imprime correctamente

- Verificar que la impresora esté configurada para papel de 80mm
- Revisar la configuración de márgenes (deben ser 0)
- Asegurar que esté en modo "Recibo" o "Thermal"

### Los separadores no se alinean

- Verificar que se esté usando una fuente monoespaciada
- Revisar la configuración de codificación de caracteres (UTF-8)

### El contenido se corta

- Verificar el ancho del papel en la configuración de la impresora
- Reducir el tamaño de fuente si es necesario
- Revisar que no haya contenido que exceda las 80 columnas

## Personalización

Para personalizar el diseño del recibo:

1. Editar el template HTML en `recibo-pago.component.html`
2. Ajustar los estilos en `recibo-pago.component.scss`
3. Modificar especialmente la sección `@media print` para cambios en impresión

## Archivos del Componente

```
recibo-pago/
├── recibo-pago.component.ts      # Lógica del componente
├── recibo-pago.component.html    # Template del recibo
├── recibo-pago.component.scss    # Estilos (pantalla e impresión)
└── README.md                     # Esta documentación
```
