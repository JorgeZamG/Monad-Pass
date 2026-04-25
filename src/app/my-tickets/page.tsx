import { TicketCard } from "@/components/ui/TicketCard";

const tickets = [
  { eventName: "Monad Dev Summit", tokenId: 12, checkedIn: false },
  { eventName: "Monad Builders Camp", tokenId: 2, checkedIn: true },
];

export default function MyTicketsPage() {
  return (
    <main className="container">
      <section className="panel" style={{ padding: 20 }}>
        <h1>Mis tickets</h1>
        <p className="subtitle">Tus tickets NFT aparecerán aquí.</p>
      </section>

      <section className="grid">
        {tickets.map((ticket) => (
          <TicketCard key={`${ticket.eventName}-${ticket.tokenId}`} {...ticket} />
        ))}
      </section>
    </main>
  );
}
