import Link from "next/link";

import { EventCard } from "@/components/ui/EventCard";
import { ConnectWalletButton } from "@/components/ui/ConnectWalletButton";
import { EVENTS } from "@/lib/events";

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
          {EVENTS.map((event) => (
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
