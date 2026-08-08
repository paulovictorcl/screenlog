"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveMediaStatus(
  tmdbId: number,
  type: string,
  title: string,
  posterPath: string | null,
  status: "WATCHLIST" | "WATCHED",
  rating?: number,
  review?: string
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return { error: "Não autorizado" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { error: "Usuário não encontrado" };
    }

    // 1. Garante que a mídia existe no nosso banco (Cache do TMDB)
    const mediaIdString = `${type}-${tmdbId}`;
    let media = await prisma.media.findUnique({
      where: { id: mediaIdString },
    });

    if (!media) {
      media = await prisma.media.create({
        data: {
          id: mediaIdString,
          tmdbId,
          type,
          title,
          posterPath,
        },
      });
    }

    // 2. Cria ou atualiza o status do usuário para essa mídia
    const inWatchlist = status === "WATCHLIST";
    const watched = status === "WATCHED";

    await prisma.mediaStatus.upsert({
      where: {
        userId_mediaId: {
          userId: user.id,
          mediaId: media.id,
        },
      },
      update: {
        inWatchlist: inWatchlist ? true : undefined, // só atualiza se for verdadeiro ou não mexe
        watched: watched ? true : undefined,
        rating: watched ? rating : undefined,
        review: watched ? review : undefined,
      },
      create: {
        userId: user.id,
        mediaId: media.id,
        inWatchlist,
        watched,
        rating: watched ? rating : null,
        review: watched ? review : null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/watchlist");
    revalidatePath("/assistidos");

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar mídia:", error);
    return { error: "Ocorreu um erro ao salvar." };
  }
}

export async function removeMediaStatus(tmdbId: number, type: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return { error: "Não autorizado" };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return { error: "Usuário não encontrado" };

    const mediaIdString = `${type}-${tmdbId}`;
    const media = await prisma.media.findUnique({
      where: { id: mediaIdString },
    });
    if (!media) return { error: "Mídia não encontrada" };

    await prisma.mediaStatus.delete({
      where: {
        userId_mediaId: {
          userId: user.id,
          mediaId: media.id,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/watchlist");
    revalidatePath("/assistidos");

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover mídia:", error);
    return { error: "Ocorreu um erro ao remover." };
  }
}
