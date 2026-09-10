import { useEffect, useState } from "react";
import { supabase, productModelUrl, formatCents } from "../supabaseClient.js";
import ModelViewer from "./ModelViewer.jsx";
import ProductModal from "./ProductModal.jsx";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = new, object = edit

  async function loadProducts() {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("load products failed", error);
      return;
    }
    setProducts(data || []);
    setLoaded(true);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function removeProduct(id, glbPath) {
    if (!confirm("Remover esse produto do catálogo?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Não deu pra remover: " + error.message);
      return;
    }
    if (glbPath) await supabase.storage.from("models").remove([glbPath]);
    loadProducts();
  }

  return (
    <div>
      <div className="orders-head">
        <h1>Produtos</h1>
        <button className="btn btn-primary" type="button" onClick={() => setModalProduct(null)}>
          Novo produto
        </button>
      </div>

      {loaded && products.length === 0 && <div className="empty-state">Nenhum produto cadastrado.</div>}

      <div className="order-list">
        {products.map((p) => {
          const url = productModelUrl(p.glb_path);
          return (
            <div className="order-card" key={p.id}>
              <div className="order-media">{url && <ModelViewer src={url} />}</div>
              <div className="order-info">
                <div className="order-top">
                  <h3>{p.name}</h3>
                </div>
                <div className="order-meta">{p.size || ""}</div>
                <div className="order-price">{formatCents(p.price_cents)}</div>
              </div>
              <div className="order-actions">
                <button className="btn btn-secondary" type="button" onClick={() => setModalProduct(p)}>
                  Editar
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => removeProduct(p.id, p.glb_path)}>
                  Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => {
            setModalProduct(undefined);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
