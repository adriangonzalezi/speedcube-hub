import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-head">
      <h2 className="co-title">Página no encontrada</h2>
      <p className="co-explain">Esta página no existe. <Link href="/">Volver al inicio</Link></p>
    </section>
  );
}
