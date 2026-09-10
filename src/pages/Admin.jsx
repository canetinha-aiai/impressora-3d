import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient.js";
import LoginForm from "../components/LoginForm.jsx";
import OrdersTab from "../components/OrdersTab.jsx";
import ProductsTab from "../components/ProductsTab.jsx";

export default function Admin() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [tab, setTab] = useState("pedidos");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <>
      <header>
        <div className="header-row" style={{ padding: "16px 0" }}>
          <Link className="brand" to="/">
            MATEUS<span className="dot">&nbsp;3D</span>
            <span className="sub">· pedidos</span>
          </Link>
          {session && (
            <div className="session-row">
              <span>{session.user.email}</span>
              <button className="btn btn-secondary" type="button" onClick={() => supabase.auth.signOut()}>
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {session === undefined ? null : !session ? (
        <LoginForm />
      ) : (
        <div className="orders-shell">
          <div className="wrap">
            <div className="tabs">
              <button
                className={"tab-btn" + (tab === "pedidos" ? " active" : "")}
                type="button"
                onClick={() => setTab("pedidos")}
              >
                Pedidos
              </button>
              <button
                className={"tab-btn" + (tab === "produtos" ? " active" : "")}
                type="button"
                onClick={() => setTab("produtos")}
              >
                Produtos
              </button>
            </div>
            {tab === "pedidos" ? <OrdersTab /> : <ProductsTab />}
          </div>
        </div>
      )}
    </>
  );
}
