import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, productModelUrl, formatCents } from "../supabaseClient.js";
import ModelViewer from "../components/ModelViewer.jsx";
import OrderModal from "../components/OrderModal.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(undefined);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (cancelled) return;
      if (error) {
        console.error("load product failed", error);
        setProduct(null);
        return;
      }
      setProduct({ ...data, glbSrc: productModelUrl(data.glb_path) });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <>
      <header>
        <div className="header-row" style={{ padding: "16px 0" }}>
          <Link className="brand" to="/">
            MATEUS<span className="dot">&nbsp;3D</span>
          </Link>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <Link className="back-link mono" to="/">
            ← Voltar ao catálogo
          </Link>

          {product === undefined && <p className="mono">carregando…</p>}
          {product === null && <div className="empty-state">Peça não encontrada.</div>}

          {product && (
            <div className="detail-layout">
              <div className="detail-media">
                {product.glbSrc ? (
                  <>
                    <ModelViewer src={product.glbSrc} />
                    <span className="rotate-hint">arraste para girar</span>
                  </>
                ) : null}
              </div>
              <div className="detail-info">
                <h2>{product.name}</h2>
                <div className="card-meta">
                  <span>{product.size || ""}</span>
                </div>
                <div className="card-meta" style={{ marginTop: 6 }}>
                  <span className="price">{formatCents(product.price_cents)}</span>
                </div>
                <p className="description">{product.description}</p>
                <button className="btn btn-primary" type="button" onClick={() => setOrdering(true)}>
                  Fazer pedido
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer>Mateus 3D — impressão 3D sob encomenda.</footer>

      {ordering && product && <OrderModal product={product} onClose={() => setOrdering(false)} />}
    </>
  );
}
