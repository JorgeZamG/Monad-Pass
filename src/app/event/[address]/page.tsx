"use client";

import { useMemo } from "react";

import { useEventTicket } from "@/hooks/useEventTicket";

type EventDetailPageProps = {
  params: {
    address: string;
  };
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const eventAddress = useMemo(() => params.address as `0x${string}`, [params.address]);
  const { eventInfo, isLoading, error } = useEventTicket(eventAddress);

  return (
    <main className="container">
      <section className="panel" style={{ padding: 20 }}>
        <h1>{eventInfo?.name ?? "Evento"}</h1>
        <p className="subtitle">Contrato: {eventAddress}</p>

        {isLoading && <p className="status">Cargando datos del evento...</p>}
        {error && <p className="status status-error">No se pudo leer la información on-chain de este evento.</p>}

        {eventInfo && (
          <div className="event-details">
            <p>
              <strong>Ubicación:</strong> {eventInfo.location}
            </p>
            <p>
              <strong>Fecha:</strong> {eventInfo.date}
            </p>
            <p>
              <strong>Precio:</strong> {eventInfo.priceMon} MON
            </p>
            <p>
              <strong>Tickets:</strong> {eventInfo.totalMinted}/{eventInfo.maxSupply}
            </p>
            <p>
              <strong>Estado:</strong> {eventInfo.active ? "Activo" : "Inactivo"}
            </p>
          </div>
        )}

        <button className="btn btn-primary" disabled={!eventInfo?.active}>
          Comprar ticket
        </button>
      </section>
    </main>
  );
}
