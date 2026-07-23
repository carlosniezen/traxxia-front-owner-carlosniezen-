import React, { useState } from 'react';
import { api } from '../api.js';
import { useStore } from '../App.jsx';
import { Link, navigate, cartStore, useCart, money } from '../lib.jsx';

const FREE_SHIPPING_THRESHOLD = 10000; // cents (S/100)
const FLAT_SHIPPING = 1000;            // cents (S/10)

export default function Checkout() {
  const { store } = useStore();
  const { items, subtotal } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', notes: '' });
  const [payment, setPayment] = useState('contra_entrega');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) {
    return <div className="pad center"><h2>Tu carrito está vacío</h2><Link to="/" className="btn-primary inline">Ir a la tienda</Link></div>;
  }

  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal - discount + shipping;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const applyCoupon = async () => {
    setCouponMsg(null);
    if (!couponCode.trim()) { setDiscount(0); return; }
    try {
      const r = await api.validateCoupon(couponCode.trim(), subtotal);
      setDiscount(r.discount);
      setCouponMsg({ ok: true, text: `Cupón aplicado: −${money(r.discount, store.currency_symbol)}` });
    } catch (e) {
      setDiscount(0);
      setCouponMsg({ ok: false, text: e.message });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer: form,
        items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
        coupon: discount > 0 ? couponCode.trim() : null,
        payment_method: payment,
      });
      cartStore.clear();
      navigate(`/order/${order.code}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout">
      <h1>Finalizar compra</h1>
      <form className="checkout-grid" onSubmit={submit}>
        <div className="checkout-form">
          <h3>Datos de contacto y envío</h3>
          <div className="field-row">
            <label>Nombre completo *<input required value={form.name} onChange={set('name')} /></label>
            <label>Teléfono<input value={form.phone} onChange={set('phone')} /></label>
          </div>
          <label>Correo electrónico<input type="email" value={form.email} onChange={set('email')} /></label>
          <label>Dirección<input value={form.address} onChange={set('address')} /></label>
          <div className="field-row">
            <label>Ciudad<input value={form.city} onChange={set('city')} /></label>
          </div>
          <label>Notas del pedido<textarea rows="2" value={form.notes} onChange={set('notes')} /></label>

          <h3>Método de pago</h3>
          <div className="pay-options">
            {[
              ['contra_entrega', 'Pago contra entrega'],
              ['transferencia', 'Transferencia bancaria'],
              ['yape_plin', 'Yape / Plin'],
            ].map(([val, label]) => (
              <label key={val} className={payment === val ? 'pay on' : 'pay'}>
                <input type="radio" name="pay" checked={payment === val} onChange={() => setPayment(val)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <aside className="checkout-summary">
          <h3>Tu pedido</h3>
          {items.map((i) => (
            <div className="row sm" key={i.id}>
              <span>{i.qty}× {i.name}</span>
              <span>{money(i.price * i.qty, store.currency_symbol)}</span>
            </div>
          ))}
          <hr />
          <div className="coupon">
            <input placeholder="Código de cupón" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <button type="button" onClick={applyCoupon}>Aplicar</button>
          </div>
          {couponMsg && <p className={couponMsg.ok ? 'coupon-ok' : 'coupon-err'}>{couponMsg.text}</p>}
          <div className="row"><span>Subtotal</span><span>{money(subtotal, store.currency_symbol)}</span></div>
          {discount > 0 && <div className="row"><span>Descuento</span><span>−{money(discount, store.currency_symbol)}</span></div>}
          <div className="row"><span>Envío</span><span>{shipping === 0 ? 'Gratis' : money(shipping, store.currency_symbol)}</span></div>
          <div className="row total"><span>Total</span><strong>{money(total, store.currency_symbol)}</strong></div>
          {error && <p className="coupon-err">{error}</p>}
          <button className="btn-primary full" disabled={submitting}>
            {submitting ? 'Procesando…' : 'Confirmar pedido'}
          </button>
        </aside>
      </form>
    </div>
  );
}
