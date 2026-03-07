import styles from "./ForWho.module.css";

export default function ForWho() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className="section-label mono">Para quién es</p>
        <h2 className={styles.heading}>
          Dos mundos. Un protocolo.
        </h2>

        <div className={styles.grid}>
          {/* Card 1 — Business owners */}
          <div className={styles.card}>
            <div className={styles.iconWrap}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
              </svg>
            </div>
            <h3 className={styles.title}>Dueños de negocio de servicios</h3>
            <p className={styles.description}>
              Tienes un equipo, cobras por sesiones o proyectos, y a fin de mes
              pierdes horas cruzando pagos con el banco. Compensalo lo hace por
              ti.
            </p>
          </div>

          {/* Card 2 — Developers */}
          <div className={styles.card}>
            <div className={styles.iconWrap}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
                <line x1="14" y1="4" x2="10" y2="20" />
              </svg>
            </div>
            <h3 className={styles.title}>Developers y plataformas</h3>
            <p className={styles.description}>
              Compensalo es un protocolo abierto. Integra reconciliación en tu
              SaaS con un webhook y un schema de eventos estándar.
            </p>
            <a href="/docs" className={styles.link}>
              Ver el protocolo
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 7h12m0 0L8 2m5 5L8 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
