# Compensalo — Sprint 4 Summary

## Qué se construyó

### 1. Tabla AccountIdentity (schema: compensalo)
Modelo de aprendizaje que mapea cuentas bancarias (por `holderName` del counterparty de Fintoc) a clientes conocidos.

| Campo          | Tipo     | Notas                              |
|----------------|----------|------------------------------------|
| id             | String   | cuid PK                           |
| organizationId | String   |                                    |
| accountNumber  | String?  | número de cuenta si disponible     |
| holderName     | String   | nombre del titular según Fintoc    |
| bankName       | String?  | banco origen                       |
| clientId       | String?  | ID del cliente en Coordinalo       |
| clientName     | String   | nombre legible para UI             |
| clientEmail    | String?  |                                    |
| matchCount     | Int      | cuántas veces se confirmó (confianza) |
| lastMatchedAt  | DateTime | última confirmación                |
| createdBy      | String   | userId del primer match manual     |
| confirmedAt    | DateTime |                                    |

`@@unique([organizationId, holderName])` — mismo nombre = mismo cliente en la misma org.

### 2. Campos de sugerencia en ReconciliationPosition
- `suggestedClientName` — nombre sugerido por el motor
- `suggestedClientId` — ID sugerido
- `suggestionSource` — `"account_identity"` o null

### 3. SuggestionEngine (`src/compensalo/engine/SuggestionEngine.ts`)
Motor que busca coincidencias en AccountIdentity para posiciones UNMATCHED:
1. Extrae `holderName` del `counterparty` de la posición
2. Busca match exacto por `[organizationId, holderName]`
3. Fallback: búsqueda case-insensitive
4. Devuelve el `AccountIdentity` o `null`

Integrado en el MatchingEngine: cuando no hay PaymentRecord candidato (UNMATCHED), el SuggestionEngine anota la sugerencia en la posición.

### 4. Force-match con aprendizaje (`POST /api/positions/:id/force-match`)
Body ampliado:
```json
{
  "paymentId": "string",
  "notes": "string",
  "clientName": "string",
  "clientId?": "string",
  "clientEmail?": "string"
}
```
Después de crear el match, el endpoint:
- Si ya existe AccountIdentity para ese holderName → incrementa `matchCount` y actualiza datos
- Si no existe → crea nuevo AccountIdentity con los datos del match manual

### 5. Endpoint de asociación directa (`POST /api/positions/unmatched/associate`)
Para el flujo principal (transferencias sin PaymentRecord):
- Marca la posición como MATCHED
- Crea/actualiza AccountIdentity (aprendizaje)

### 6. API endpoints nuevos
| Método | Ruta                             | Descripción                        |
|--------|----------------------------------|------------------------------------|
| GET    | /api/account-identities          | Lista identidades aprendidas (por matchCount desc) |
| GET    | /api/positions/unmatched         | Posiciones UNMATCHED con sugerencias y `isFirstTime` |
| POST   | /api/positions/unmatched/associate | Asociación directa + aprendizaje |

### 7. UI: Pantalla de pendientes (`/reconciliacion`)
Dashboard operacional para la administradora:
- Lista de transferencias UNMATCHED ordenadas por fecha desc
- Cada fila: fecha, monto (CLP formateado), titular, badge de estado
- Badge amarillo "Primera vez" si no hay sugerencia
- Badge verde "Sugerencia: [nombre]" si el motor encontró match
- Botón "Asociar" abre modal contextual:
  - **Con sugerencia**: confirmación simple de 1 click
  - **Primera vez**: formulario con nombre + email opcional
- Toast de confirmación tras asociar
- Estado vacío cuando todo está reconciliado
- Diseño dark theme consistente con el sistema visual existente

---

## Cómo funciona el aprendizaje

```
Transferencia llega (Fintoc)
       ↓
MatchingEngine busca PaymentRecord → no encuentra
       ↓
SuggestionEngine busca AccountIdentity por holderName
       ↓
  ┌─── Encontró? ───┐
  │                  │
  Sí                 No
  │                  │
  Anota sugerencia   isFirstTime = true
  en posición        │
  │                  │
  ↓                  ↓
  Admin ve           Admin ve
  "Sugerencia: Ana"  "Primera vez"
  │                  │
  1-click confirmar  Escribe nombre
  │                  │
  ↓                  ↓
  matchCount++       Crea AccountIdentity
  │                  │
  └──────────────────┘
           ↓
  Próxima transferencia de la misma cuenta
  → sugerencia automática
```

El `matchCount` es la métrica de confianza: a más confirmaciones, más fiable el mapeo.

---

## Qué queda para mayor autonomía

1. **Auto-match con umbral de confianza**: cuando `matchCount >= N`, hacer match automático sin confirmación humana (configurable por org)
2. **Fuzzy matching de nombres**: normalización de tildes, espacios, abreviaciones (`GARCIA PEREZ` → `García Pérez`)
3. **Múltiples cuentas por cliente**: un cliente puede pagar desde distintas cuentas bancarias
4. **Integración con Coordinalo**: traer clientId real desde la API de pacientes en vez de texto libre
5. **Búsqueda de pacientes en UI**: autocompletar desde Coordinalo al asociar por primera vez
6. **Dashboard de identidades**: ver/editar/corregir mapeos aprendidos
7. **Autenticación**: reemplazar `userId: "manual"` con auth real
8. **Notificaciones**: alertar a la admin cuando hay transferencias pendientes
9. **Bulk associate**: asociar múltiples transferencias del mismo titular en un solo click
10. **Auditoría**: historial de cambios en cada AccountIdentity
