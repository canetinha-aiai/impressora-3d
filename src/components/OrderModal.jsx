import { useEffect, useState } from "react";
import { supabase, formatCents } from "../supabaseClient.js";

export default function OrderModal({ product, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      product_id: product.id,
      quantity: Math.max(1, qty),
      customer_name: name.trim(),
      customer_phone: phone.trim(),
    });
    setSubmitting(false);
    if (error) {
      console.error("order insert failed", error);
      alert("Não deu pra registrar o pedido agora. Tenta de novo em instantes.");
      return;
    }
    setSuccess(true);
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        {success ? (
          <>
            <h3>Pedido enviado!</h3>
            <p className="modal-product">
              Recebemos seu pedido. O Mateus vai entrar em contato pelo telefone que você passou pra combinar
              pagamento e entrega.
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" type="button" onClick={onClose}>
                Fechar
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Fazer pedido</h3>
            <p className="modal-product">
              {product.name} · {product.size || ""} · {formatCents(product.price_cents)}
            </p>
            <form onSubmit={handleSubmit}>
              <label className="field-label mono" htmlFor="order-name">
                Seu nome
              </label>
              <input
                className="field-input"
                id="order-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label className="field-label mono" htmlFor="order-phone">
                WhatsApp / telefone
              </label>
              <input
                className="field-input"
                id="order-phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <label className="field-label mono" htmlFor="order-qty">
                Quantidade
              </label>
              <input
                className="field-input"
                id="order-qty"
                type="number"
                min="1"
                step="1"
                required
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />

              <p className="modal-total">Total: {formatCents(product.price_cents * qty)}</p>

              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={onClose}>
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Confirmar pedido"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
