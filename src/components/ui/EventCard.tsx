import type { EventSummary } from "@/types";

export function EventCard({ title, location, date, priceMon, sold, total, soldOut = false }: EventSummary) {
  return (
    <article className="card panel">
      <div className="thumb" aria-hidden />
      <h3>{title}</h3>
      <p>{location}</p>
      <p>{date}</p>
      <p className="meta">
        {priceMon} MON · {sold}/{total}
      </p>
      <span className={`badge ${soldOut ? "badge-muted" : ""}`}>{soldOut ? "Agotado" : "Activo"}</span>
      <button className={`btn ${soldOut ? "btn-outline" : "btn-primary"}`}>
        {soldOut ? "Ver evento" : `Comprar por ${priceMon} MON`}
      </button>
    </article>
  );
}
