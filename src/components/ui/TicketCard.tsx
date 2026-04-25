type TicketCardProps = {
  eventName: string;
  tokenId: number;
  checkedIn: boolean;
};

export function TicketCard({ eventName, tokenId, checkedIn }: TicketCardProps) {
  return (
    <article className="card panel">
      <h3>{eventName}</h3>
      <p>Token #{tokenId}</p>
      <p className="meta">Estado: {checkedIn ? "Check-in completado" : "Pendiente"}</p>
      <button className="btn btn-primary">Ver QR</button>
    </article>
  );
}
