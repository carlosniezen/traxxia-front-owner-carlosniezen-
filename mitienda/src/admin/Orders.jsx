import React, { useEffect, useState } from 'react';
import { admin } from '../api.js';
import { useStore } from '../App.jsx';
import { money } from '../lib.jsx';

export const STATUS_LABELS = {
  pending: 'Pendiente', paid: 'Pagado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
};
const FLOW = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const { store } = useStore();
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null); // order detail

  const load = () => admin.orders(filter).then(setOrders);
  useEffect(() => { load(); }, [filter]);

  const sym = store.currency_symbol;

  const changeStatus = async (order, status) => {
    await admin.setOrderStatus(order.id, status);
    load();
    if (open && open.id === order.id) setOpen({ ...open, status });
  };

  return (
    <div>
      <div className="page-head">
        <h1>Pedidos</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          {FLOW.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {orders === null ? <p className="muted">Cargando…</p> : orders.length === 0 ? (
        <p className="muted">No hay pedidos.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Código</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.code}</strong></td>
                <td>{o.customer_name}<br /><span className="muted small">{o.customer_phone || o.customer_email || ''}</span></td>
                <td className="muted small">{o.created_at}</td>
                <td>{money(o.total, sym)}</td>
                <td>
                  <select className={`status-select s-${o.status}`} value={o.status} onChange={(e) => changeStatus(o, e.target.value)}>
                    {FLOW.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td><button className="link" onClick={() => admin.order(o.id).then(setOpen)}>Ver</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {open && <OrderDetail order={open} sym={sym} onClose={() => setOpen(null)} onStatus={changeStatus} />}
    </div>
  );
}

function OrderDetail({ order, sym, onClose, onStatus }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Pedido {order.code}</h2>
        <div className="detail-grid">
          <div>
            <h4>Cliente</h4>
            <p>{order.customer_name}</p>
            {order.customer_phone && <p className="muted">{order.customer_phone}</p>}
            {order.customer_email && <p className="muted">{order.customer_email}</p>}
            {order.address && <p className="muted">{order.address}{order.city ? `, ${order.city}` : ''}</p>}
            {order.notes && <p className="muted">Nota: {order.notes}</p>}
            <p className="muted small">Pago: {order.payment_method}</p>
          </div>
          <div>
            <h4>Estado</h4>
            <select className={`status-select s-${order.status}`} value={order.status} onChange={(e) => onStatus(order, e.target.value)}>
              {FLOW.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <h4>Productos</h4>
        <table className="table compact">
          <tbody>
            {(order.items || []).map((it) => (
              <tr key={it.id}><td>{it.qty}× {it.name}</td><td className="right">{money(it.price * it.qty, sym)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="totals">
          <div className="row"><span>Subtotal</span><span>{money(order.subtotal, sym)}</span></div>
          {order.discount > 0 && <div className="row"><span>Descuento {order.coupon_code ? `(${order.coupon_code})` : ''}</span><span>−{money(order.discount, sym)}</span></div>}
          <div className="row"><span>Envío</span><span>{order.shipping === 0 ? 'Gratis' : money(order.shipping, sym)}</span></div>
          <div className="row total"><span>Total</span><strong>{money(order.total, sym)}</strong></div>
        </div>
        <div className="modal-actions"><button className="btn-outline" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}
