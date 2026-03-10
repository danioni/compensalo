import { Metadata } from "next";
import { PendingTransfers } from "./PendingTransfers";

export const metadata: Metadata = {
  title: "Transferencias pendientes — Compensalo",
};

export default function ReconciliacionPage() {
  return (
    <div className="recon-page">
      <header className="recon-header">
        <div className="recon-header-inner">
          <a href="/" className="recon-logo">
            compensalo<span className="recon-logo-dot">.</span>
          </a>
          <span className="recon-label mono">Reconciliación</span>
        </div>
      </header>
      <main className="recon-main">
        <div className="recon-container">
          <h1 className="recon-title">Transferencias pendientes</h1>
          <p className="recon-subtitle">
            Asocia cada transferencia a una paciente. Compensalo recordará la
            cuenta para la próxima vez.
          </p>
          <PendingTransfers />
        </div>
      </main>
    </div>
  );
}
