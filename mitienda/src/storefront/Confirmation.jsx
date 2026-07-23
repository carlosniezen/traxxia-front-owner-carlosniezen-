import React from 'react';
import { useStore } from '../App.jsx';
import { Link } from '../lib.jsx';

export default function Confirmation({ code }) {
  const { store } = useStore();
  return (
    <div className="pad center confirm">
      <div className="confirm-check">✓</div>
      <h1>¡Gracias por tu compra!</h1>
      <p className="muted">Tu pedido <strong>{code}</strong> ha sido recibido.</p>
      <p className="muted">
        Nos pondremos en contacto contigo para coordinar el pago y la entrega
        {store.whatsapp ? ` (${store.whatsapp})` : ''}.
      </p>
      <Link to="/" className="btn-primary inline">Volver a la tienda</Link>
    </div>
  );
}
