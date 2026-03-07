"use client";

import { useState, type FormEvent } from "react";
import styles from "./WaitlistForm.module.css";

type FormStatus = "idle" | "loading" | "success" | "error";

export default function WaitlistForm({
  buttonLabel = "Quiero acceso",
}: {
  buttonLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.status === 409) {
        setStatus("error");
        setErrorMsg("Este email ya está en la lista.");
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Algo salió mal. Intenta de nuevo.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16.667 5L7.5 14.167 3.333 10"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Te avisaremos cuando Compensalo esté disponible.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="tu@empresa.com"
          className={styles.input}
          disabled={status === "loading"}
          required
        />
        <button
          type="submit"
          className={styles.button}
          disabled={status === "loading" || !email.trim()}
        >
          {status === "loading" ? (
            <span className={styles.spinner} />
          ) : (
            buttonLabel
          )}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className={styles.error}>{errorMsg}</p>
      )}
    </form>
  );
}
