"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: any) {
  try {
    const { name, email, password } = data;

    // Trava de 2 usuários
    const userCount = await prisma.user.count();
    
    if (userCount >= 2) {
      return { error: "O limite de contas (2 usuários) já foi atingido neste sistema privado." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este e-mail já está cadastrado." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro no registro:", error);
    return { error: "Ocorreu um erro ao criar a conta. Tente novamente." };
  }
}
