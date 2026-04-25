import { notFound } from "next/navigation";
import { getAddress, isAddress } from "viem";

import { BuyTicketButton } from "@/components/ui/BuyTicketButton";
import { EVENTS } from "@/lib/events";

type EventDetailPageProps = {
  params: {
    address: string;
  };
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  if (!isAddress(params.address)) {
    notFound();
  }

  const checksummedAddress = getAddress(params.address);
  const event = EVENTS.find((item) => item.address?.toLowerCase() === checksummedAddress.toLowerCase());

  if (!event || !event.address) {
    notFound();
  }

  return (
    <main className="container">
      <section className="panel" style={{ padding: 20 }}>
        <h1>{event.title}</h1>
        <p className="subtitle">Contrato: {event.address}</p>
        <p className="meta">Precio: {event.priceMon} MON</p>
        <BuyTicketButton eventAddress={event.address} amountMon={event.priceMon} />
      </section>
    </main>
  );
}
