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
                <div className="order-meta">
                  {o.customer_name} · {o.customer_phone || "sem telefone"} {p.size ? "· " + p.size : ""} ·{" "}
                  {formatDate(o.created_at)}
                </div>
                <div className="order-price">
                  {o.quantity}&times; {formatCents(unitCents)} = {formatCents(unitCents * o.quantity)}
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
