# compensalo

Protocolo abierto de reconciliacion financiera. Recibe eventos de pagos y movimientos bancarios via webhooks, los cruza automaticamente, y expone el estado de reconciliacion a traves de una API REST.

**[compensalo.com](https://www.compensalo.com)**

## Vision del producto

Compensalo es el motor de pagos del ecosistema Digitalo. Gestiona el pipeline completo desde que entra un pago hasta que queda liquidado entre las partes. Sus responsabilidades son:

1. **Reconciliacion bancaria** — matching de transferencias entrantes contra cobros registrados.
2. **Liquidacion** — ejecucion de la distribucion de ingresos una vez confirmado el pago.
3. **Compensacion** — registro de saldos entre profesionales y la organizacion.

Compensalo no define las reglas de distribucion — esas viven en Planificalo. Compensalo las consulta y las ejecuta. El trigger siempre es un evento de pago real.

## Stack

- **Framework**: Next.js 16 + TypeScript
- **Base de datos**: PostgreSQL (Supabase) + Prisma 6
- **Deploy**: Vercel
- **Analytics**: Vercel Analytics

## Setup local

```bash
# Clonar e instalar
git clone https://github.com/danioni/compensalo.git
cd compensalo
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Sincronizar schema con la base de datos
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripcion |
| --- | --- |
| `DATABASE_URL` | Connection string de PostgreSQL (pooled) |
| `DIRECT_URL` | Connection string directa (para migraciones) |
| `HABILITALO_WEBHOOK_SECRET` | Secret HMAC-SHA256 para verificar webhooks |
| `NEXT_PUBLIC_APP_URL` | URL publica de la app |
| `HABILITALO_BASE_URL` | URL base de la API de Habilitalo |
| `COMPENSALO_WEBHOOK_URL` | URL del webhook de Compensalo |

## API Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/api/webhook/habilitalo` | Recibe eventos de movimientos bancarios |
| `GET` | `/api/positions` | Lista posiciones de reconciliacion con filtros |
| `GET` | `/api/positions/summary` | Resumen por estado |
| `POST` | `/api/positions/[id]/force-match` | Match manual de posicion con pago |
| `POST` | `/api/positions/[id]/flag-exception` | Marcar posicion como excepcion |
| `POST` | `/api/waitlist` | Registrar email en lista de espera |

## Protocolo

El motor de matching funciona asi:

1. Un evento `bank.movement.created` llega al webhook
2. Se crea una `ReconciliationPosition` con estado `UNMATCHED`
3. El matching engine busca `PaymentRecord` candidatos (mismo monto, ventana de 3 dias)
4. Si hay un unico candidato: match `EXACT` (score 1.0)
5. Si hay multiples: match `FUZZY` con el mas cercano por fecha (score 0.7)
6. Se actualizan posicion, pago y evento en una transaccion atomica

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de produccion
npm run db:generate  # Regenerar Prisma Client
npm run db:push      # Sincronizar schema con DB
npm run db:migrate   # Correr migraciones
```

## Licencia

Proyecto privado.
