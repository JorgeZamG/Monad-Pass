type EventDetailPageProps = {
  params: {
    address: string;
  };
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  return (
    <main className="container">
      <section className="panel" style={{ padding: 20 }}>
        <h1>Evento</h1>
        <p className="subtitle">Contrato: {params.address}</p>
        <button className="btn btn-primary">Comprar ticket</button>
      </section>
    </main>
  );
}
