import Link from "next/link";

import { EventCard } from "@/components/ui/EventCard";
import { ConnectWalletButton } from "@/components/ui/ConnectWalletButton";
import type { EventSummary } from "@/types";

const events: EventSummary[] = [
  {
    address: "0x0000000000000000000000000000000000001010",
    title: "Monad Dev Summit",
    location: "Miami",
    date: "18 Jul 2026",
    priceMon: "0.45",
    sold: 128,
    total: 300,
    soldOut: false,
  },
  {
    address: "0x0000000000000000000000000000000000002020",
    title: "Web3 Product Night",
    location: "CDMX",
    date: "03 Ago 2026",
    priceMon: "0.30",
    sold: 300,
    total: 300,
    soldOut: true,
  },
  {
    address: "0x0000000000000000000000000000000000003030",
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
          <Link href="#">Eventos</Link>
          <Link href="/my-tickets">Mis tickets</Link>
          <Link href="/create">Crear evento</Link>
        </nav>
        <ConnectWalletButton />
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
            <Link className="btn btn-ghost" href="/create">
              Crear evento
            </Link>
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
            <Link key={`${event.title}-${event.date}`} href={`/event/${event.address}`}>
              <EventCard {...event} />
            </Link>
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
