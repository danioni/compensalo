import type { Metadata } from "next";
import styles from "./docs.module.css";

export const metadata: Metadata = {
  title: "Documentación — Compensalo",
  description:
    "Documentación del protocolo abierto de reconciliación financiera de Compensalo.",
};

export default function DocsPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <a href="/" className={styles.backLink}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13 7H1m0 0l5 5M1 7l5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver
        </a>

        <div className={styles.logo}>
          <span className={styles.logoName}>compensalo</span>
          <span className={styles.logoDot}>.com</span>
        </div>

        <p className={styles.intro}>
          Compensalo es un protocolo abierto de reconciliación financiera.
          Recibe eventos de pagos y movimientos bancarios vía webhooks, los cruza
          automáticamente, y expone el estado de reconciliación a través de una
          API REST.
        </p>

        {/* ─── Cómo funciona ─────────────────────────────── */}
        <section className={styles.section}>
          <p className="section-label mono">Flujo</p>
          <h2 className={styles.sectionTitle}>Cómo funciona</h2>
          <div className={styles.flow}>
            <div className={styles.flowStep}>Evento recibido</div>
            <div className={styles.flowArrow}>&rarr;</div>
            <div className={styles.flowStep}>Posición creada</div>
            <div className={styles.flowArrow}>&rarr;</div>
            <div className={styles.flowStep}>Matching engine</div>
            <div className={styles.flowArrow}>&rarr;</div>
            <div className={`${styles.flowStep} ${styles.flowStepAccent}`}>
              Reconciliado
            </div>
          </div>
        </section>

        {/* ─── Eventos ───────────────────────────────────── */}
        <section className={styles.section}>
          <p className="section-label mono">Eventos</p>
          <h2 className={styles.sectionTitle}>Tipos de eventos</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <span className={`${styles.cardLabel} mono`}>
                bank.movement.created
              </span>
              <h3 className={styles.cardTitle}>Movimiento bancario</h3>
              <p className={styles.cardDesc}>
                Se emite cuando un nuevo movimiento aparece en la cuenta
                bancaria. Contiene monto, fecha, contraparte y tipo
                (crédito/débito).
              </p>
            </div>
            <div className={styles.card}>
              <span className={`${styles.cardLabel} mono`}>
                payment.received
              </span>
              <h3 className={styles.cardTitle}>Pago recibido</h3>
              <p className={styles.cardDesc}>
                Se emite cuando un pago es registrado en tu plataforma. Incluye
                monto, fecha, ID externo y fuente del pago.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Webhook API ───────────────────────────────── */}
        <section className={styles.section}>
          <p className="section-label mono">API</p>
          <h2 className={styles.sectionTitle}>Webhook</h2>
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>
                <span className={styles.codeMethod}>POST</span>{" "}
                /api/webhook/habilitalo
              </span>
              <span>HMAC-SHA256</span>
            </div>
            <div className={styles.codeContent}>
              <pre>{`{
  "eventType": "bank.movement.created",
  "eventId": "evt_abc123",
  "source": "habilitalo",
  "timestamp": "2026-03-07T12:00:00Z",
  "data": {
    "movementId": "mov_001",
    "accountId": "org_xxx",
    "amount": 150000,
    "currency": "CLP",
    "date": "2026-03-07",
    "description": "Transferencia recibida",
    "counterparty": "Cliente SpA",
    "type": "credit",
    "journalEntryId": "je_001"
  }
}`}</pre>
            </div>
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-tertiary)",
              marginTop: "12px",
            }}
          >
            La firma se envía en el header{" "}
            <code className={styles.mono}>X-Habilitalo-Signature</code> y se
            verifica con HMAC-SHA256 usando tu secret.
          </p>
        </section>

        {/* ─── Schema ────────────────────────────────────── */}
        <section className={styles.section}>
          <p className="section-label mono">Schema</p>
          <h2 className={styles.sectionTitle}>Modelos principales</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Descripción</th>
                  <th>Estados</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.mono}>ReconciliationPosition</td>
                  <td>
                    Movimiento bancario normalizado como posición a reconciliar
                  </td>
                  <td>UNMATCHED → MATCHED → SETTLED</td>
                </tr>
                <tr>
                  <td className={styles.mono}>PaymentRecord</td>
                  <td>Pago registrado desde la plataforma del cliente</td>
                  <td>PENDING → CONFIRMED → RECONCILED</td>
                </tr>
                <tr>
                  <td className={styles.mono}>ReconciliationMatch</td>
                  <td>
                    Relación entre posición y pago con tipo (EXACT/FUZZY) y
                    score
                  </td>
                  <td>&mdash;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Quick Start ───────────────────────────────── */}
        <section className={styles.section}>
          <p className="section-label mono">Integración</p>
          <h2 className={styles.sectionTitle}>Quick start</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Registra tu webhook</h3>
                <p className={styles.stepDesc}>
                  Configura la URL de tu endpoint y el secret HMAC-SHA256 para
                  verificar las firmas de los eventos entrantes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Envía eventos</h3>
                <p className={styles.stepDesc}>
                  Publica eventos <code className={styles.mono}>bank.movement.created</code>{" "}
                  y <code className={styles.mono}>payment.received</code> al
                  webhook. Compensalo los procesa y ejecuta el matching
                  automáticamente.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Consulta posiciones</h3>
                <p className={styles.stepDesc}>
                  Usa <code className={styles.mono}>GET /api/positions</code>{" "}
                  para ver el estado de reconciliación. Filtra por estado, fecha
                  u organización.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── GitHub CTA ────────────────────────────────── */}
        <a
          href="https://github.com/danioni/compensalo"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubCta}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Ver código en GitHub
        </a>
      </div>
    </main>
  );
}
