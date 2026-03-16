# wallet-health-connect

Este es un proyecto de [Next.js](https://nextjs.org) generado inicialmente con [v0](https://v0.app).

## Construido con v0

Este repositorio está vinculado a un proyecto de [v0](https://v0.app). Puedes seguir desarrollándolo desde el siguiente enlace: inicia nuevos chats para hacer cambios y v0 enviará commits directamente a este repo. Cada merge a `main` se desplegará automáticamente.

[Seguir trabajando en v0 →](https://v0.app/chat/projects/prj_VFOYteTs6MtsugQbeHv0e4VidrEL)

## Primeros pasos

Primero, ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

Puedes empezar a editar la aplicación modificando `app/page.tsx`. La página se actualiza automáticamente mientras editas.

## Integraciones externas

Este dashboard combina dos fuentes externas de datos:

- Datos de salud desde HealthConnectGateway v2
- Datos financieros desde la API de Wallet de Budget Bakers

El objetivo de esta app es mostrar ambos dominios en un solo dashboard, manteniendo un fallback seguro a datos mock cuando faltan credenciales o cuando un proveedor no está disponible temporalmente.

### HealthConnectGateway

HealthConnectGateway es el proveedor de datos de salud usado por este proyecto. La integración de esta app está basada en las rutas v2 que compartiste, especialmente en los endpoints autenticados bajo `/api/v2`.

Referencias relevantes:

- Repositorio: https://github.com/ShuchirJ/HCGateway
- Archivo de rutas usado como referencia: https://github.com/ShuchirJ/HCGateway/blob/main/api/apiVersions/v2/routes.py
- Instancia hospedada usada por esta app: https://health.tereredev.com

La app usa actualmente estos conceptos de HCGateway:

- `Authorization: Bearer <token>` para solicitudes autenticadas
- `POST /api/v2/fetch/<method>` para leer registros de salud
- Métodos de salud como `steps`, `heartRate`, `sleepSession`, `weight`, `distance` y `totalCaloriesBurned`

En este proyecto, los datos de HCGateway se usan para poblar:

- Métricas actuales de salud
- Historial semanal de pasos
- Historial de calorías
- Gráfico de ritmo cardíaco
- Historial de sueño
- Evolución del peso

### API de Wallet de Budget Bakers

Wallet es el proveedor financiero usado por este proyecto. La implementación sigue la documentación REST de Budget Bakers y utiliza los endpoints de datos de usuario expuestos bajo su API v1.

Referencias relevantes:

- Documentación: https://rest.budgetbakers.com/wallet/reference
- OpenAPI: https://rest.budgetbakers.com/wallet/openapi/ui
- Base de API usada por esta app: https://rest.budgetbakers.com/wallet/v1/api

La app usa actualmente Wallet para:

- Cuentas
- Registros financieros
- Categorías

Esas respuestas luego se agregan en:

- Balance total
- Ingresos y gastos mensuales
- Ahorro
- Gráficos de gastos por categoría
- Gráficos de gasto diario
- Transacciones recientes

### Cómo los conecté

Ambas integraciones están conectadas mediante rutas internas de la API de Next.js, en lugar de llamadas directas desde el navegador.

Rutas agregadas en este proyecto:

- `app/api/dashboard/route.ts`: carga y combina datos de salud y finanzas en un solo payload para la UI
- `app/api/integrations/test/route.ts`: valida las credenciales de los proveedores desde el diálogo de configuración

Por qué se usó este enfoque:

- Evitar exponer detalles de implementación de los proveedores directamente en la capa de UI
- Reducir problemas de CORS del lado del navegador
- Permitir usar variables de entorno del servidor sin obligar a poner todos los secretos en el navegador
- Mantener un fallback consistente a datos mock cuando no hay autenticación real disponible

La lógica de integración del servidor vive en `lib/server/dashboard-data.ts` y hace lo siguiente:

- Resuelve credenciales desde overrides en `localStorage` o variables de entorno del servidor
- Llama a endpoints v2 de HCGateway para datos de salud
- Llama a endpoints paginados v1 de Wallet para datos financieros
- Mapea payloads específicos de cada proveedor a los tipos internos de la app
- Agrega datos para gráficos y métricas resumen
- Hace fallback a mock data si un proveedor falta o devuelve error

### Prioridad de configuración

La app resuelve credenciales en este orden:

1. Valores guardados en el diálogo de configuración en `localStorage`
2. Variables de entorno del servidor desde `.env.local`
3. Datos mock integrados cuando no hay una configuración válida disponible

Esto significa que puedes ejecutar la app en tres modos:

- Totalmente mock, sin credenciales
- Mixto, con solo salud o solo finanzas configuradas
- Totalmente en vivo, con ambos proveedores configurados

### `.env.local`

Crea un archivo `.env.local` a partir de `.env.example`.

Valores recomendados para tu configuración:

```env
HCGATEWAY_BASE_URL=https://health.tereredev.com
HCGATEWAY_TOKEN=your_healthconnectgateway_token
WALLET_API_TOKEN=your_budget_bakers_wallet_token
```

Notas:

- `HCGATEWAY_BASE_URL` debe ser solo el host. La app agrega `/api/v2/...` internamente.
- Las solicitudes a Wallet se envían a `https://rest.budgetbakers.com/wallet/v1/api`.
- Aún puedes sobrescribir los valores del env por sesión del navegador desde el diálogo de configuración.
- Si no hay auth válida disponible, el dashboard mantiene los mockups activos en lugar de romper la UI.

## Más información

Para aprender más, revisa los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs) - características y API de Next.js.
- [Learn Next.js](https://nextjs.org/learn) - tutorial interactivo de Next.js.
- [Documentación de v0](https://v0.app/docs) - cómo usar v0.

<a href="https://v0.app/chat/api/kiro/clone/marcosferr/wallet-health-connect" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
