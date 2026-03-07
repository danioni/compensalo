# Compensalo — Sprint 2 Summary

## Stack
- **Framework**: Next.js 16 + TypeScript strict
- **ORM**: Prisma 6 con Postgres
- **DB**: Misma `DATABASE_URL` que Balancealo, schema aislado `compensalo`

---

## Schema de tablas (schema: compensalo)

### CompensaloEvent
| Campo          | Tipo        | Notas                          |
|----------------|-------------|--------------------------------|
| id             | String (PK) | cuid                           |
| eventId        | String      | @unique — idempotencia         |
| eventType      | String      |                                |
| source         | String      |                                |
| rawPayload     | Json        | Payload completo del evento    |
| receivedAt     | DateTime    | default: now()                 |
| status         | EventStatus | RECEIVED/PROCESSING/MATCHED/UNMATCHED/ERROR |
| organizationId | String      |                                |

### ReconciliationPosition
| Campo            | Tipo           | Notas                          |
|------------------|----------------|--------------------------------|
| id               | String (PK)    | cuid                           |
| organizationId   | String         |                                |
| movementId       | String         | @unique — de bank.movement.created |
| journalEntryId   | String         |                                |
| amount           | Decimal(18,2)  | Nunca Float                    |
| currency         | String         | default: "CLP"                 |
| date             | DateTime       |                                |
| description      | String         |                                |
| counterparty     | String?        |                                |
| type             | MovementType   | CREDIT/DEBIT                   |
| categoryId       | String?        | Para Categorizalo futuro       |
| categorySource   | String?        |                                |
| status           | PositionStatus | UNMATCHED/PENDING_MATCH/MATCHED/SETTLED/DISPUTED/EXCEPTION |
| matchedPaymentId | String?        | @unique FK a PaymentRecord     |
| matchedAt        | DateTime?      |                                |
| settledAt        | DateTime?      |                                |
| notes            | String?        | Razón de excepción, etc.       |
| createdAt        | DateTime       |                                |
| updatedAt        | DateTime       |                                |

### PaymentRecord
| Campo          | Tipo          | Notas                          |
|----------------|---------------|--------------------------------|
| id             | String (PK)   | cuid                           |
| organizationId | String        |                                |
| externalId     | String        | @@unique(externalId, source)   |
| source         | String        | coordinalo/khipu/flow/manual   |
| amount         | Decimal(18,2) | Nunca Float                    |
| currency       | String        | default: "CLP"                 |
| paidAt         | DateTime      |                                |
| description    | String?       |                                |
| clientId       | String?       |                                |
| status         | PaymentStatus | PENDING/CONFIRMED/RECONCILED/DISPUTED |
| positionId     | String?       |                                |
| createdAt      | DateTime      |                                |
| updatedAt      | DateTime      |                                |

### ReconciliationMatch
| Campo          | Tipo      | Notas                          |
|----------------|-----------|--------------------------------|
| id             | String (PK) | cuid                         |
| organizationId | String    |                                |
| positionId     | String    | FK a ReconciliationPosition    |
| paymentId      | String    | FK a PaymentRecord             |
| matchType      | MatchType | EXACT/FUZZY/MANUAL             |
| matchScore     | Float     | 0.0 - 1.0                     |
| matchedBy      | String?   | userId si fue manual           |
| matchedAt      | DateTime  | default: now()                 |
| notes          | String?   |                                |

---

## Endpoints disponibles

### Webhook
| Método | Ruta                        | Descripción                                |
|--------|-----------------------------|--------------------------------------------|
| POST   | /api/webhook/habilitalo     | Recibe eventos de Habilitalo (bank.movement.created) |

- Verifica HMAC-SHA256 via `X-Habilitalo-Signature`
- 401 si firma inválida
- 409 si eventId ya existe (idempotencia)
- 200 con acknowledgment inmediato + procesamiento asíncrono

### Positions API
| Método | Ruta                              | Descripción                               |
|--------|-----------------------------------|-------------------------------------------|
| GET    | /api/positions                    | Lista posiciones (filtros: organizationId, status, from, to) |
| GET    | /api/positions/summary            | Resumen: matched/pending/exception counts + amounts |
| POST   | /api/positions/:id/force-match    | Match manual (requiere paymentId + notes)  |
| POST   | /api/positions/:id/flag-exception | Marca posición como EXCEPTION con razón    |

---

## Matching Engine v1

Ubicación: `src/compensalo/engine/MatchingEngine.ts`

### Flujo de procesamiento
1. Recibe `compensaloEventId` → carga evento de BD
2. Marca evento como `PROCESSING`
3. Extrae `movementId`, `amount`, `date`, `type` del payload
4. Crea/upsert `ReconciliationPosition` con status `UNMATCHED`
5. Busca `PaymentRecord` candidatos:
   - Mismo `organizationId`
   - `amount` exactamente igual (Decimal)
   - `paidAt` dentro de ±3 días del movimiento
   - Status `PENDING` o `CONFIRMED`
6. Resultado:
   - **0 candidatos** → Position queda `UNMATCHED`, Event → `UNMATCHED`
   - **1 candidato** → `EXACT` match, score 1.0
   - **N candidatos** → toma el más cercano en fecha → `FUZZY` match, score 0.7
7. Si hay match, en transacción:
   - Crea `ReconciliationMatch`
   - Position → `MATCHED`
   - Payment → `RECONCILED`
   - Event → `MATCHED`

### Decisiones de diseño
- Montos siempre en `Prisma.Decimal`, nunca `Float`
- Upsert en position para idempotencia (mismo movementId no crea duplicados)
- Procesamiento asíncrono via `setTimeout` (v1, sin queue real)

---

## Script de auto-registro

```bash
npm run setup
```

Registra el webhook en Habilitalo llamando a `POST /api/habilitalo/webhooks` con la URL de este servicio y los eventos a escuchar.

---

## Qué falta para Sprint 3

1. **Queue real**: Reemplazar `setTimeout` con BullMQ/Redis o similar para procesamiento confiable
2. **Autenticación**: Agregar auth a los endpoints de API (JWT/session)
3. **UI de reconciliación**: Dashboard para ver posiciones, hacer match manual, resolver excepciones
4. **API de pagos**: Endpoint para crear/importar PaymentRecords desde Coordinalo u otras fuentes
5. **Matching engine v2**:
   - Match por descripción (fuzzy text matching)
   - Match parcial (un pago cubre múltiples movimientos)
   - Reglas configurables por organización
6. **Webhooks de salida**: Notificar a otros servicios cuando hay match/excepción
7. **Retry logic**: Reintentar eventos con status ERROR
8. **Tests**: Unit tests para MatchingEngine, integration tests para webhook
9. **Integración con Categorizalo**: Consumir categorías para enriquecer posiciones
10. **Audit log completo**: Historial de cambios en cada posición
