import WaitlistForm from "./WaitlistForm";
import styles from "./WaitlistCTA.module.css";

export default function WaitlistCTA() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <p className="section-label mono">Acceso anticipado</p>
        <h2 className={styles.heading}>Compensalo está en desarrollo activo.</h2>
        <p className={styles.sub}>
          Déjanos tu email y te avisamos cuando esté disponible para tu
          organización.
        </p>
        <WaitlistForm buttonLabel="Quiero acceso" />
      </div>
    </section>
  );
}
