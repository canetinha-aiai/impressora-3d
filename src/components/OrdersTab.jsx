import { useEffect, useState } from "react";
import { supabase, productModelUrl, formatCents } from "../supabaseClient.js";
import ModelViewer from "./ModelViewer.jsx";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, products(name, size, price_cents, glb_path)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("load orders failed", error);
      return;
    }
    setOrders(data || []);
    setLoaded(true);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function toggleStatus(id, current) {
    const next = current === "pago" ? "pendente" : "pago";
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", id);
    if (error) {
      alert("Não deu pra atualizar: " + error.message);
      return;
    }
    loadOrders();
  }

  return (
    <div>
      <div className="orders-head">
        <h1>Pedidos</h1>
        <button className="btn btn-secondary" type="button" onClick={loadOrders}>
          Atualizar
        </button>
      </div>

      {loaded && orders.length === 0 && <div className="empty-state">Nenhum pedido ainda.</div>}

      <div className="order-list">
        {orders.map((o) => {
          const p = o.products || {};
          const url = productModelUrl(p.glb_path);
          const unitCents = p.price_cents || 0;
          return (
            <div className="order-card" key={o.id}>
              <div className="order-media">{url && <ModelViewer src={url} />}</div>
              <div className="order-info">
                <div className="order-top">
                  <h3>{p.name || "Produto removido"}</h3>
                  <span className={"status-pill " + o.status}>{o.status === "pago" ? "PAGO" : "PENDENTE"}</span>
                </div>

                <div className="order-fields">
                  <div className="order-field">
                    <span className="order-field-label">Cliente</span>
                    <span className="order-field-value">{o.customer_name}</span>
                  </div>
                  <div className="order-field">
                    <span className="order-field-label">Telefone</span>
                    <span className="order-field-value">{o.customer_phone || "—"}</span>
                  </div>
                  {p.size && (
                    <div className="order-field">
                      <span className="order-field-label">Tamanho</span>
                      <span className="order-field-value">{p.size}</span>
                    </div>
                  )}
                  <div className="order-field">
                    <span className="order-field-label">Quantidade</span>
                    <span className="order-field-value">{o.quantity}</span>
                  </div>
                  <div className="order-field">
                    <span className="order-field-label">Pedido em</span>
                    <span className="order-field-value">{formatDate(o.created_at)}</span>
                  </div>
                </div>

                <div className="order-total-row">
                  <span className="order-qty-line">
                    {o.quantity}&times; {formatCents(unitCents)}
                  </span>
                  <span className="order-total-value">{formatCents(unitCents * o.quantity)}</span>
                </div>
              </div>
              <div className="order-actions">
                <button className="btn btn-secondary" type="button" onClick={() => toggleStatus(o.id, o.status)}>
                  Marcar como {o.status === "pago" ? "pendente" : "pago"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
