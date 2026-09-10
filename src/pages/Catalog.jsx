import { useEffect, useState } from "react";
import { supabase, productModelUrl, waLink } from "../supabaseClient.js";
import ProductCard from "../components/ProductCard.jsx";
import OrderModal from "../components/OrderModal.jsx";

const WHATSAPP_NUMBER = "5527992877594";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("carregando…");
  const [orderingProduct, setOrderingProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("load products failed", error);
        setStatus("erro ao carregar");
        return;
      }
      const withUrls = (data || []).map((p) => ({ ...p, glbSrc: productModelUrl(p.glb_path) }));
      setProducts(withUrls);
      setStatus(withUrls.length + (withUrls.length === 1 ? " peça" : " peças"));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header>
        <div className="header-row" style={{ padding: "16px 0" }}>
          <span className="brand">
            MATEUS<span className="dot">&nbsp;3D</span>
          </span>
          <nav>
            <a href="#catalogo">Catálogo</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#contato">Contato</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow mono">// MINIATURAS IMPRESSAS EM 3D</span>
          <h1>Peças em 3D, sob encomenda, prontas pra chamar no WhatsApp.</h1>
          <p>
            Escolha um modelo do catálogo, veja em 3D antes de pedir, e combine tamanho, cor e prazo direto com quem
            imprime.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#catalogo">
              Ver catálogo
            </a>
            <a
              className="btn btn-secondary"
              href={waLink(WHATSAPP_NUMBER, "Olá! Vi seu catálogo de miniaturas 3D e quero saber mais.")}
              target="_blank"
              rel="noopener"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="block" id="catalogo">
        <div className="wrap">
          <div className="section-head">
            <h2>Catálogo</h2>
            <span className="mono">{status}</span>
          </div>
          {products.length === 0 && status !== "carregando…" && (
            <div className="empty-state">Nenhuma peça cadastrada ainda.</div>
          )}
          <div className="catalog-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onOrder={setOrderingProduct} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="block"
        id="como-funciona"
        style={{ background: "color-mix(in srgb, var(--surface) 92%, var(--ink) 3%)" }}
      >
        <div className="wrap">
          <div className="section-head">
            <h2>Como funciona</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step-num mono">01</span>
              <h3>Escolha no catálogo</h3>
              <p>Veja o modelo, o tamanho e o preço — gire em 3D quando disponível.</p>
            </div>
            <div className="step">
              <span className="step-num mono">02</span>
              <h3>Confirme no WhatsApp</h3>
              <p>Combine cor, acabamento e prazo direto na conversa.</p>
            </div>
            <div className="step">
              <span className="step-num mono">03</span>
              <h3>Receba a peça</h3>
              <p>Impressão sob encomenda, com combinação de entrega ou retirada.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="contato">
        <div className="wrap">
          <div className="contact-box">
            <div>
              <h2 style={{ fontSize: "1.3rem" }}>Bateu o interesse?</h2>
              <p>Manda uma mensagem e já combina o modelo, tamanho e prazo.</p>
            </div>
            <a
              className="btn btn-primary"
              href={waLink(WHATSAPP_NUMBER, "Olá! Vim pelo catálogo e quero encomendar uma peça.")}
              target="_blank"
              rel="noopener"
            >
              Chamar no WhatsApp
            </a>
          </div>
          <p className="pending-note">Instagram e Shopee: em breve.</p>
        </div>
      </section>

      <footer>Mateus 3D — impressão 3D sob encomenda.</footer>

      {orderingProduct && <OrderModal product={orderingProduct} onClose={() => setOrderingProduct(null)} />}
    </>
  );
}
