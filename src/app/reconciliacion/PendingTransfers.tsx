"use client";

import { useCallback, useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────── */

interface UnmatchedPosition {
  id: string;
  movementId: string;
  organizationId: string;
  amount: string;
  currency: string;
  date: string;
  description: string;
  counterparty: string | null;
  suggestedClientName: string | null;
  suggestedClientId: string | null;
  suggestionSource: string | null;
  isFirstTime: boolean;
}

interface PendingCobro {
  id: string;
  externalId: string;
  source: string;
  amount: string;
  currency: string;
  paidAt: string;
  description: string | null;
  clientId: string | null;
  status: string;
}

interface SummaryData {
  matched: { count: number; amount: number };
  pending: { count: number; amount: number };
  exception: { count: number; amount: number };
  autoMatch: { count: number; total: number; pct: number };
}

// TODO: replace with real org ID from auth context
const ORG_ID = "demo-org";

/* ─── Main component ─────────────────────────────────────────── */

export function PendingTransfers() {
  const [positions, setPositions] = useState<UnmatchedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] =
    useState<UnmatchedPosition | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/positions/unmatched?organizationId=${ORG_ID}`
      );
      if (!res.ok) throw new Error("Error al cargar posiciones");
      const data: UnmatchedPosition[] = await res.json();
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/positions/summary?organizationId=${ORG_ID}`
      );
      if (res.ok) {
        setSummary(await res.json());
      }
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchPositions();
    fetchSummary();
  }, [fetchPositions, fetchSummary]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleAssociateWithCobro(
    position: UnmatchedPosition,
    cobroId: string
  ) {
    const res = await fetch("/api/reconciliacion/associate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId: position.id,
        cobroId,
      }),
    });

    if (!res.ok) {
      setError("Error al asociar la transferencia");
      return;
    }

    setSelectedPosition(null);
    setToast("Asociado correctamente. Compensalo recordará esta cuenta.");
    fetchPositions();
    fetchSummary();
  }

  async function handleAssociateWithName(
    position: UnmatchedPosition,
    clientName: string,
    clientEmail?: string
  ) {
    const res = await fetch("/api/positions/unmatched/associate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        positionId: position.id,
        clientName,
        clientEmail: clientEmail || undefined,
        clientId: position.suggestedClientId ?? undefined,
      }),
    });

    if (!res.ok) {
      setError("Error al asociar la transferencia");
      return;
    }

    setSelectedPosition(null);
    setToast("Asociado. Compensalo recordará esta cuenta.");
    fetchPositions();
    fetchSummary();
  }

  function formatCLP(amount: string) {
    const num = parseInt(amount, 10);
    if (isNaN(num)) return `$${amount}`;
    return "$" + num.toLocaleString("es-CL");
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return <div className="recon-loading">Cargando transferencias...</div>;
  }

  if (error) {
    return <div className="recon-error">{error}</div>;
  }

  return (
    <>
      {/* Auto-match metric */}
      {summary && (
        <div className="recon-metrics">
          <div className="recon-metric-card">
            <span className="recon-metric-value mono">
              {summary.autoMatch.pct}%
            </span>
            <span className="recon-metric-label">auto-match</span>
          </div>
          <div className="recon-metric-card">
            <span className="recon-metric-value mono">
              {summary.matched.count}
            </span>
            <span className="recon-metric-label">reconciliadas</span>
          </div>
          <div className="recon-metric-card">
            <span className="recon-metric-value mono">
              {summary.pending.count}
            </span>
            <span className="recon-metric-label">pendientes</span>
          </div>
          {summary.exception.count > 0 && (
            <div className="recon-metric-card recon-metric-warn">
              <span className="recon-metric-value mono">
                {summary.exception.count}
              </span>
              <span className="recon-metric-label">excepciones</span>
            </div>
          )}
        </div>
      )}

      {positions.length === 0 ? (
        <div className="recon-empty">
          <div className="recon-empty-icon">&#127881;</div>
          <h2>Todo está reconciliado</h2>
          <p>Cuando lleguen nuevas transferencias aparecerán aquí.</p>
        </div>
      ) : (
        <>
          <div className="recon-count mono">
            {positions.length} pendiente{positions.length !== 1 ? "s" : ""}
          </div>
          <div className="recon-table">
            <div className="recon-table-header">
              <span>Fecha</span>
              <span>Monto</span>
              <span>Titular / Descripción</span>
              <span>Estado</span>
              <span></span>
            </div>
            {positions.map((p) => (
              <div key={p.id} className="recon-row">
                <span className="recon-cell recon-date">
                  {formatDate(p.date)}
                </span>
                <span className="recon-cell recon-amount mono">
                  {formatCLP(p.amount)}
                </span>
                <span className="recon-cell recon-holder">
                  <span className="recon-holder-name">
                    {p.counterparty ?? "Sin identificar"}
                  </span>
                  {p.description && (
                    <span className="recon-holder-desc">{p.description}</span>
                  )}
                </span>
                <span className="recon-cell">
                  {p.isFirstTime ? (
                    <span className="recon-badge recon-badge-new">
                      Primera vez
                    </span>
                  ) : (
                    <span className="recon-badge recon-badge-suggestion">
                      Sugerencia: {p.suggestedClientName}
                    </span>
                  )}
                </span>
                <span className="recon-cell recon-action">
                  <button
                    className="recon-btn"
                    onClick={() => setSelectedPosition(p)}
                  >
                    Asociar
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedPosition && (
        <AssociatePanel
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
          onAssociateCobro={handleAssociateWithCobro}
          onAssociateName={handleAssociateWithName}
          formatCLP={formatCLP}
          formatDate={formatDate}
        />
      )}

      {toast && <div className="recon-toast">{toast}</div>}
    </>
  );
}

/* ─── Associate Panel (modal) ────────────────────────────────── */

function AssociatePanel({
  position,
  onClose,
  onAssociateCobro,
  onAssociateName,
  formatCLP,
  formatDate,
}: {
  position: UnmatchedPosition;
  onClose: () => void;
  onAssociateCobro: (
    position: UnmatchedPosition,
    cobroId: string
  ) => Promise<void>;
  onAssociateName: (
    position: UnmatchedPosition,
    clientName: string,
    clientEmail?: string
  ) => Promise<void>;
  formatCLP: (amount: string) => string;
  formatDate: (dateStr: string) => string;
}) {
  const [tab, setTab] = useState<"cobro" | "manual">("cobro");
  const [cobros, setCobros] = useState<PendingCobro[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAmount, setSearchAmount] = useState(position.amount);
  const [loadingCobros, setLoadingCobros] = useState(false);
  const [selectedCobro, setSelectedCobro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Manual association fields
  const [clientName, setClientName] = useState(
    position.suggestedClientName ?? ""
  );
  const [clientEmail, setClientEmail] = useState("");

  // Search cobros on mount and when filters change
  useEffect(() => {
    if (tab !== "cobro") return;
    const timer = setTimeout(() => searchCobros(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchAmount, tab]);

  async function searchCobros() {
    setLoadingCobros(true);
    try {
      const params = new URLSearchParams({ organizationId: ORG_ID });
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (searchAmount.trim()) params.set("amount", searchAmount.trim());

      const res = await fetch(
        `/api/reconciliacion/cobros-pendientes?${params}`
      );
      if (res.ok) {
        setCobros(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoadingCobros(false);
    }
  }

  async function handleConfirmCobro() {
    if (!selectedCobro) return;
    setSubmitting(true);
    await onAssociateCobro(position, selectedCobro);
    setSubmitting(false);
  }

  async function handleConfirmManual(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;
    setSubmitting(true);
    await onAssociateName(
      position,
      clientName.trim(),
      clientEmail.trim() || undefined
    );
    setSubmitting(false);
  }

  return (
    <div className="recon-overlay" onClick={onClose}>
      <div
        className="recon-modal recon-modal-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Asociar transferencia</h3>
        <p className="recon-modal-detail">
          <strong>{formatCLP(position.amount)}</strong> de{" "}
          <strong>{position.counterparty ?? "desconocido"}</strong> —{" "}
          {formatDate(position.date)}
        </p>
        {position.description && (
          <p className="recon-modal-desc">{position.description}</p>
        )}

        {/* Tabs */}
        <div className="recon-tabs">
          <button
            className={`recon-tab ${tab === "cobro" ? "recon-tab-active" : ""}`}
            onClick={() => setTab("cobro")}
          >
            Buscar cobro pendiente
          </button>
          <button
            className={`recon-tab ${tab === "manual" ? "recon-tab-active" : ""}`}
            onClick={() => setTab("manual")}
          >
            Asociar por nombre
          </button>
        </div>

        {tab === "cobro" && (
          <div className="recon-cobro-search">
            {/* Search filters */}
            <div className="recon-search-row">
              <label className="recon-field recon-field-sm">
                <span>Paciente / descripción</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                />
              </label>
              <label className="recon-field recon-field-sm">
                <span>Monto exacto</span>
                <input
                  type="text"
                  value={searchAmount}
                  onChange={(e) => setSearchAmount(e.target.value)}
                  placeholder="Ej: 50000"
                />
              </label>
            </div>

            {/* Results */}
            <div className="recon-cobro-list">
              {loadingCobros ? (
                <div className="recon-cobro-empty">Buscando cobros...</div>
              ) : cobros.length === 0 ? (
                <div className="recon-cobro-empty">
                  No se encontraron cobros pendientes
                </div>
              ) : (
                cobros.map((c) => (
                  <div
                    key={c.id}
                    className={`recon-cobro-item ${selectedCobro === c.id ? "recon-cobro-selected" : ""}`}
                    onClick={() => setSelectedCobro(c.id)}
                  >
                    <div className="recon-cobro-main">
                      <span className="recon-cobro-amount mono">
                        {formatCLP(c.amount)}
                      </span>
                      <span className="recon-cobro-desc">
                        {c.description ?? c.clientId ?? "Sin descripción"}
                      </span>
                    </div>
                    <div className="recon-cobro-meta">
                      <span>{formatDate(c.paidAt)}</span>
                      <span className="recon-cobro-source">{c.source}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="recon-modal-actions">
              <button
                className="recon-btn recon-btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className="recon-btn recon-btn-primary"
                onClick={handleConfirmCobro}
                disabled={submitting || !selectedCobro}
              >
                {submitting ? "Asociando..." : "Confirmar asociación"}
              </button>
            </div>
          </div>
        )}

        {tab === "manual" && (
          <form onSubmit={handleConfirmManual}>
            {position.suggestedClientName && (
              <p className="recon-modal-question">
                Sugerencia:{" "}
                <strong>{position.suggestedClientName}</strong>
              </p>
            )}
            <label className="recon-field">
              <span>Nombre de la paciente</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Ana García"
                autoFocus
                required
              />
            </label>
            <label className="recon-field">
              <span>Email (opcional)</span>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="ana@email.com"
              />
            </label>
            <div className="recon-modal-actions">
              <button
                type="button"
                className="recon-btn recon-btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="recon-btn recon-btn-primary"
                disabled={submitting || !clientName.trim()}
              >
                {submitting ? "Asociando..." : "Asociar y recordar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
