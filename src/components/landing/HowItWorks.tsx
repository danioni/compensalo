import styles from "./HowItWorks.module.css";

const steps = [
  {
    number: "01",
    title: "Conecta tu banco",
    description:
      "Vincula tu cuenta corriente en segundos. Compensalo recibe tus movimientos en tiempo real vía Open Banking.",
  },
  {
    number: "02",
    title: "Compensalo trabaja solo",
    description:
      "Cada pago que recibes se cruza automáticamente contra el movimiento bancario correspondiente. Sin intervención manual.",
  },
  {
    number: "03",
    title: "Solo ves lo que importa",
    description:
      "Un semáforo simple: verde es reconciliado, amarillo es pendiente, rojo necesita tu atención. El 95% del tiempo todo está verde.",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className="section-label mono">Cómo funciona</p>
        <h2 className={styles.heading}>
          Tres pasos. Cero fricción.
        </h2>

        <div className={styles.grid}>
          {steps.map((step) => (
            <div key={step.number} className={styles.card}>
              <span className={`${styles.number} mono`}>{step.number}</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.description}>{step.description}</p>

              {step.number === "03" && (
                <div className={styles.semaphore}>
                  <span
                    className={styles.dot}
                    style={{ background: "var(--accent)" }}
                    title="Reconciliado"
                  />
                  <span
                    className={styles.dot}
                    style={{ background: "var(--yellow)" }}
                    title="Pendiente"
                  />
                  <span
                    className={styles.dot}
                    style={{ background: "var(--red)" }}
                    title="Atención"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
