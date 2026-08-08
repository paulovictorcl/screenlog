import Sidebar from "@/components/Sidebar";
import GlobalModal from "@/components/GlobalModal";
import styles from "./layout.module.css";
import { Suspense } from "react";
import { Providers } from "@/components/Providers";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Suspense fallback={null}>
        <GlobalModal />
      </Suspense>
    </div>
    </Providers>
  );
}
