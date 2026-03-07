import WaitlistForm from "./WaitlistForm";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.logo}>
          <span className={styles.logoName}>compensalo</span>
          <span className={styles.logoDot}>.com</span>
        </div>

        <h1 className={styles.headline}>
          El dinero que entra siempre debe cuadrar
          <br />
          <em className={styles.italic}>con el que se cobró.</em>
        </h1>

        <p className={styles.sub}>
          Compensalo reconcilia automáticamente tus pagos contra tus movimientos
          bancarios. Sin Excel. Sin revisar el banco a fin de mes. Sin
          discrepancias sin resolver.
        </p>

        <div className={styles.ctas}>
          <WaitlistForm buttonLabel="Únete a la lista de espera" />
          <a href="/docs" className={styles.docsLink}>
            Ver documentación
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

        {/* Flow diagram */}
        <div className={styles.flow}>
          <div className={styles.flowStep}>
            <div className={`${styles.flowIcon} mono`}>$</div>
            <span className={styles.flowLabel}>Pago recibido</span>
          </div>

          <div className={styles.flowArrow}>
            <svg
              width="40"
              height="12"
              viewBox="0 0 40 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 6h36m0 0l-4-4m4 4l-4 4"
                stroke="var(--text-tertiary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className={styles.flowStep}>
            <div className={`${styles.flowIcon} mono`}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="1"
                  y="3"
                  width="14"
                  height="10"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path d="M1 6h14" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
            <span className={styles.flowLabel}>Movimiento bancario</span>
          </div>

          <div className={styles.flowArrow}>
            <svg
              width="40"
              height="12"
              viewBox="0 0 40 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 6h36m0 0l-4-4m4 4l-4 4"
                stroke="var(--text-tertiary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className={`${styles.flowStep} ${styles.flowStepAccent}`}>
            <div className={styles.flowIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 4.5L7 12.5 3 8.5"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className={styles.flowLabel}>Reconciliado</span>
          </div>
        </div>
      </div>
    </section>
  );
}
