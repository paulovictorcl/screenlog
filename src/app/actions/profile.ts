"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfileInfo(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    throw new Error("Não autorizado");
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  if (!name) {
    throw new Error("O nome é obrigatório.");
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name,
      image: image || null,
    },
  });

  revalidatePath("/perfil");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    throw new Error("Não autorizado");
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    throw new Error("Preencha todas as senhas.");
  }

  if (newPassword.length < 6) {
    throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isPasswordValid) {
    throw new Error("Senha atual incorreta.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      password: hashedPassword,
    },
  });

  return { success: true };
}
