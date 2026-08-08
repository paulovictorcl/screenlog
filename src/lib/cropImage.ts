export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Para evitar problemas de CORS se usar URLs externas
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível iniciar o contexto do Canvas.');
  }

  // Definir tamanho do canvas para o tamanho do crop desejado
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Desenhar a imagem recortada no canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Retornar base64 da imagem
  return new Promise((resolve, reject) => {
    // Usamos jpeg com qualidade 0.8 para ficar leve (ideal para avatar no DB)
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    if (!base64Image) {
      reject(new Error('Canvas está vazio'));
      return;
    }
    resolve(base64Image);
  });
}
