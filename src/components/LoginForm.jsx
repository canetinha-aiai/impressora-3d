import { useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function LoginForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: authError } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (mode === "signup") {
      setError("Conta criada. Se pedir confirmação por e-mail, confirme antes de entrar.");
      setMode("login");
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h2>{mode === "signup" ? "Criar conta" : "Entrar"}</h2>
        <p className="hint">
          {mode === "signup"
            ? "Só a conta cadastrada aqui como admin (via configuração do banco) consegue ver os pedidos depois."
            : "Acesso restrito à conta admin do catálogo."}
        </p>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field-label mono" htmlFor="login-email">
            E-mail
          </label>
          <input
            className="field-input"
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="field-label mono" htmlFor="login-password">
            Senha
          </label>
          <input
            className="field-input"
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="login-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
            </button>
          </div>
        </form>
        <p className="login-toggle">
          {mode === "login" ? (
            <>
              Primeiro acesso?{" "}
              <button type="button" onClick={() => setMode("signup")}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button type="button" onClick={() => setMode("login")}>
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
