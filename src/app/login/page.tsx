"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { registerUser } from "@/app/actions/auth";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (activeTab === "login") {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      const name = formData.get("name") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setError("As senhas não coincidem");
        setLoading(false);
        return;
      }

      const res = await registerUser({ name, email, password });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Se cadastrou com sucesso, faz o login
        await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        router.push("/dashboard");
      }
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <Image
          src="/logo.png"
          alt="ScreenLog Logo"
          width={240}
          height={80}
          priority
          unoptimized
          style={{ width: '100%', height: 'auto', maxWidth: '240px', margin: '0 auto' }}
        />
      </div>

      <div className={`${styles.authBox} glass-panel`}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab("login"); setError(""); }}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab("signup"); setError(""); }}
            type="button"
          >
            Criar conta
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {activeTab === "signup" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nome</label>
              <input name="name" type="text" required className={styles.input} placeholder="Seu nome" />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>E-mail</label>
            <input name="email" type="email" required className={styles.input} placeholder="seu@email.com" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha</label>
            <input name="password" type="password" required className={styles.input} placeholder="••••••••" minLength={6} />
          </div>

          {activeTab === "signup" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirmar Senha</label>
              <input name="confirmPassword" type="password" required className={styles.input} placeholder="••••••••" minLength={6} />
            </div>
          )}

          <button type="submit" disabled={loading} className={`btn-primary ${styles.submitBtn}`}>
            {loading ? "Aguarde..." : activeTab === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
