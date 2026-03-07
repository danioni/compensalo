import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.tagline}>
          <span className={styles.brand}>Compensalo</span> · Protocolo abierto
          de reconciliación financiera
        </p>
        <nav className={styles.links}>
          <a href="/docs">Documentación</a>
          <a
            href="https://github.com/compensalo"
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
