import { useEffect, useRef, useState } from "react";
import { supabase, productModelUrl } from "../supabaseClient.js";
import ModelViewer from "./ModelViewer.jsx";

export default function ProductModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name || "");
  const [size, setSize] = useState(product?.size || "");
  const [price, setPrice] = useState(product ? (product.price_cents / 100).toFixed(2) : "");
  const [description, setDescription] = useState(product?.description || "");
  const [previewUrl, setPreviewUrl] = useState(product ? productModelUrl(product.glb_path) : null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleFileChange(e) {
    const file = e.target.files[0] || null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(product ? productModelUrl(product.glb_path) : null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const priceReais = parseFloat(price);
    if (!name.trim() || isNaN(priceReais)) return;

    setSubmitting(true);
    try {
      const file = fileRef.current.files[0] || null;
      let glbPath = product ? product.glb_path : null;
      const previousGlbPath = product ? product.glb_path : null;

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        glbPath = crypto.randomUUID() + "-" + safeName;
        const { error: uploadError } = await supabase.storage
          .from("models")
          .upload(glbPath, file, { contentType: "model/gltf-binary" });
        if (uploadError) throw uploadError;
      }

      const payload = {
        name: name.trim(),
        size: size.trim() || null,
        price_cents: Math.round(priceReais * 100),
        description: description.trim() || null,
        glb_path: glbPath,
      };

      const { error: saveError } = isEdit
        ? await supabase.from("products").update(payload).eq("id", product.id)
        : await supabase.from("products").insert(payload);
      if (saveError) throw saveError;

      if (file && previousGlbPath && previousGlbPath !== glbPath) {
        await supabase.storage.from("models").remove([previousGlbPath]);
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Erro ao salvar produto.");
    }
    setSubmitting(false);
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <h3>{isEdit ? "Editar produto" : "Novo produto"}</h3>

        {previewUrl && (
          <div className="modal-preview">
            <ModelViewer src={previewUrl} />
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="field-label mono" htmlFor="product-name">
            Nome
          </label>
          <input
            className="field-input"
            id="product-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="field-label mono" htmlFor="product-size">
            Tamanho
          </label>
          <input
            className="field-input"
            id="product-size"
            type="text"
            placeholder="Ex.: P · ~6 cm"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />

          <label className="field-label mono" htmlFor="product-price">
            Preço (R$)
          </label>
          <input
            className="field-input"
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <label className="field-label mono" htmlFor="product-description">
            Descrição
          </label>
          <textarea
            className="field-input"
            id="product-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="field-label mono" htmlFor="product-glb">
            Arquivo 3D (.glb)
          </label>
          <input className="field-input" id="product-glb" type="file" accept=".glb" ref={fileRef} onChange={handleFileChange} />

          <div className="modal-actions">
            <button className="btn btn-secondary" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
