import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import { redirect } from "next/navigation";

export default async function PerfilPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      image: true
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header className="page-header">
        <h1 className="page-title">Configurações de Perfil</h1>
        <p className="page-subtitle">
          Gerencie suas informações pessoais e credenciais de acesso.
        </p>
      </header>
      
      <ProfileForm initialData={user} />
    </div>
  );
}
