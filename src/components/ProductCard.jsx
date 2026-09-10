import { Link } from "react-router-dom";
import ModelViewer from "./ModelViewer.jsx";
import { formatCents } from "../supabaseClient.js";

export default function ProductCard({ product, onOrder }) {
  return (
    <div className="card">
      <div className="card-media">
        {product.glbSrc && (
          <>
            <ModelViewer src={product.glbSrc} />
            <span className="rotate-hint">arraste p/ girar</span>
          </>
        )}
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        <div className="card-meta">
          <span>{product.size || ""}</span>
        </div>
        <div className="card-meta" style={{ marginTop: 6 }}>
          <span className="price">{formatCents(product.price_cents)}</span>
        </div>
        <div className="card-actions">
          <Link className="btn btn-secondary" to={"/produto/" + product.id}>
            Ver detalhes
          </Link>
          <button className="btn btn-primary" type="button" onClick={() => onOrder(product)}>
            Fazer pedido
          </button>
        </div>
      </div>
    </div>
  );
}
