import { useEffect, useRef, useState } from "react";
import { supabase, productModelUrl } from "../supabaseClient.js";
import { stlFileToGlbBlob } from "../stlToGlb.js";
import ModelViewer from "./ModelViewer.jsx";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export default function ProductModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name || "");
  const [size, setSize] = useState(product?.size || "");
  const [price, setPrice] = useState(product ? (product.price_cents / 100).toFixed(2) : "");
  const [description, setDescription] = useState(product?.description || "");
  const [previewUrl, setPreviewUrl] = useState(product ? productModelUrl(product.glb_path) : null);
  const [pendingFile, setPendingFile] = useState(null); // { rawFile, glbBlob }
  const [converting, setConverting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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

  async function handleFileChange(e) {
    const file = e.target.files[0] || null;
    setError("");
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setPendingFile(null);
      setPreviewUrl(product ? productModelUrl(product.glb_path) : null);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Arquivo maior que 100 MB. Escolha um arquivo menor.");
      e.target.value = "";
      setPendingFile(null);
      return;
    }

    const isStl = file.name.toLowerCase().endsWith(".stl");

    if (isStl) {
      setConverting(true);
      try {
        const glbBlob = await stlFileToGlbBlob(file);
        const url = URL.createObjectURL(glbBlob);
        objectUrlRef.current = url;
        setPreviewUrl(url);
        setPendingFile({ rawFile: file, glbBlob });
      } catch (err) {
        console.error("stl conversion failed", err);
        setError("Não deu pra converter esse STL. Confira se o arquivo não está corrompido.");
        setPendingFile(null);
        e.target.value = "";
      }
      setConverting(false);
    } else {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
      setPendingFile({ rawFile: file, glbBlob: file });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const priceReais = parseFloat(price);
    if (!name.trim() || isNaN(priceReais)) return;

    setSubmitting(true);
    try {
      let glbPath = product ? product.glb_path : null;
      let sourcePath = product ? product.source_path : null;
      const previousGlbPath = product ? product.glb_path : null;
      const previousSourcePath = product ? product.source_path : null;

      if (pendingFile) {
        const { rawFile, glbBlob } = pendingFile;
        const isAlreadyGlb = rawFile.name.toLowerCase().endsWith(".glb");
        const baseName = rawFile.name.replace(/\.(stl|glb)$/i, "").replace(/[^a-zA-Z0-9_.-]/g, "_") || "modelo";
        const uid = crypto.randomUUID();

        const newGlbPath = uid + "-" + baseName + ".glb";
        const { error: previewUploadError } = await supabase.storage
          .from("models")
          .upload(newGlbPath, glbBlob, { contentType: "model/gltf-binary" });
        if (previewUploadError) throw previewUploadError;

        let newSourcePath = newGlbPath;
        if (!isAlreadyGlb) {
          const ext = "." + (rawFile.name.split(".").pop() || "stl").toLowerCase();
          newSourcePath = uid + "-original-" + baseName + ext;
          const { error: sourceUploadError } = await supabase.storage
            .from("models")
            .upload(newSourcePath, rawFile, { contentType: rawFile.type || "application/octet-stream" });
          if (sourceUploadError) throw sourceUploadError;
        }

        glbPath = newGlbPath;
        sourcePath = newSourcePath;
      }

      const payload = {
        name: name.trim(),
        size: size.trim() || null,
        price_cents: Math.round(priceReais * 100),
        description: description.trim() || null,
        glb_path: glbPath,
        source_path: sourcePath,
      };

      const { error: saveError } = isEdit
        ? await supabase.from("products").update(payload).eq("id", product.id)
        : await supabase.from("products").insert(payload);
      if (saveError) throw saveError;

      if (pendingFile) {
        const oldPaths = [...new Set([previousGlbPath, previousSourcePath].filter(Boolean))];
        const newPaths = new Set([glbPath, sourcePath]);
        const toRemove = oldPaths.filter((p) => !newPaths.has(p));
        if (toRemove.length) await supabase.storage.from("models").remove(toRemove);
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
            Arquivo 3D (.glb ou .stl, até 100 MB)
          </label>
          <input
            className="field-input"
            id="product-glb"
            type="file"
            accept=".glb,.stl"
            onChange={handleFileChange}
          />
          {converting && <p className="form-hint mono">Convertendo modelo STL pra pré-visualização...</p>}

          <div className="modal-actions">
            <button className="btn btn-secondary" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitting || converting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
