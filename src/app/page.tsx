"use client";

import Link from "next/link";

import { EventCard } from "@/components/ui/EventCard";
import { ConnectWalletButton } from "@/components/ui/ConnectWalletButton";
import { useTicketFactory } from "@/hooks/useTicketFactory";
import type { EventSummary } from "@/types";

const fallbackEvents: EventSummary[] = [
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
];

export default function HomePage() {
  const { events, isLoading, error } = useTicketFactory();

  const visibleEvents = events.length > 0 ? events : fallbackEvents;

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

        {isLoading && <p className="status">Cargando eventos on-chain...</p>}
        {error && <p className="status status-error">No se pudo leer la Factory. Mostrando eventos de ejemplo.</p>}

        <section className="grid">
          {visibleEvents.map((event) => (
            <Link key={`${event.title}-${event.date}`} href={`/event/${event.address ?? ""}`}>
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
