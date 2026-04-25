import { BuyTicketButton } from "@/components/ui/BuyTicketButton";

type EventDetailPageProps = {
  params: {
    address: string;
  };
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  return (
    <main className="container">
      <section className="panel" style={{ padding: 20 }}>
        <h1>Monad Blitz</h1>
        <p className="subtitle">Contrato: {params.address}</p>
        <p className="meta">Precio: 1 MON</p>
        <BuyTicketButton eventAddress={params.address} amountMon="1" />
      </section>
    </main>
  );
}
