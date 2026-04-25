import { EventCard } from "@/components/ui/EventCard";

const events = [
  {
    title: "Monad Dev Summit",
    location: "Miami",
    date: "18 Jul 2026",
    priceMon: "0.45",
    sold: 128,
    total: 300,
    soldOut: false,
  },
  {
    title: "Web3 Product Night",
    location: "CDMX",
    date: "03 Ago 2026",
    priceMon: "0.30",
    sold: 300,
    total: 300,
    soldOut: true,
  },
  {
    title: "Monad Builders Camp",
    location: "Madrid",
    date: "22 Sep 2026",
    priceMon: "0.25",
    sold: 42,
    total: 180,
    soldOut: false,
  },
];

export default function HomePage() {
  return (
    <>
      <header className="topbar container">
        <div className="logo">🎟️ Monad Pass</div>
        <nav>
          <a href="#">Eventos</a>
          <a href="#">Mis tickets</a>
          <a href="#">Crear evento</a>
        </nav>
        <button className="btn btn-outline">Conectar wallet</button>
      </header>

      <main className="container">
        <section className="hero panel">
          <p className="kicker">Monad Testnet</p>
          <h1>Descubre eventos tokenizados y compra tickets NFT</h1>
          <p className="subtitle">
            Flujo simple para asistentes y organizadores: compra, ticket QR y check-in on-chain.
          </p>
          <div className="actions">
            <button className="btn btn-primary">Explorar eventos</button>
            <button className="btn btn-ghost">Crear evento</button>
          </div>
        </section>

        <section className="filters panel">
          <input type="search" placeholder="Buscar evento por nombre..." />
          <div className="chips">
            <button className="chip chip-active">Todos</button>
            <button className="chip">Próximos</button>
            <button className="chip">Agotados</button>
          </div>
        </section>

        <section className="grid">
          {events.map((event) => (
            <EventCard key={`${event.title}-${event.date}`} {...event} />
          ))}
        </section>
      </main>

      <footer className="container footer">
        <span>Docs</span>
        <span>Factory</span>
        <span>Monad Explorer</span>
      </footer>
    </>
  );
}
