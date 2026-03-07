import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.tagline}>
          <span className={styles.brand}>compensalo</span>
          <span className={styles.brandDot}>.com</span>
          <span className={styles.brandSep}> · </span>
          Protocolo abierto de reconciliación financiera
        </p>
        <nav className={styles.links}>
          <a href="/docs">Documentación</a>
          <a
            href="https://github.com/danioni/compensalo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="mailto:contacto@compensalo.com">contacto@compensalo.com</a>
        </nav>
      </div>
    </footer>
  );
}
