import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const RESPONSIVE_WIDTHS = [480, 960, 1600] as const;

export type ProcessedImage = {
  originalUrl: string;
  url: string;
  width: number;
  height: number;
  variants: { width: number; url: string }[];
};

export async function storeResponsiveImage(buffer: Buffer, baseName: string, extension: string): Promise<ProcessedImage> {
  const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
  const originalsDir = path.join(uploadsRoot, 'originals');
  const responsiveDir = path.join(uploadsRoot, 'responsive');
  await Promise.all([
    fs.mkdir(originalsDir, { recursive: true }),
    fs.mkdir(responsiveDir, { recursive: true }),
  ]);

  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const originalName = `${baseName}.${safeExtension}`;
  const writtenFiles: string[] = [];

  try {
    const source = sharp(buffer, { failOn: 'warning' }).rotate();
    const metadata = await source.metadata();
    const sourceWidth = metadata.width || 0;
    const sourceHeight = metadata.height || 0;
    if (!metadata.format || !sourceWidth || !sourceHeight) {
      throw new Error('The uploaded image is invalid or could not be decoded.');
    }

    const requestedWidths = RESPONSIVE_WIDTHS.filter((width) => width < sourceWidth);
    const terminalWidth = Math.min(sourceWidth, 1600);
    const widths = Array.from(new Set([...requestedWidths, terminalWidth])).sort((a, b) => a - b);
    const variants: { width: number; url: string }[] = [];

    for (const width of widths) {
      const name = `${baseName}-${width}w.webp`;
      const outputPath = path.join(responsiveDir, name);
      await sharp(buffer, { failOn: 'warning' })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 84, effort: 5 })
        .toFile(outputPath);
      writtenFiles.push(outputPath);
      variants.push({ width, url: `/uploads/responsive/${name}` });
    }

    const originalPath = path.join(originalsDir, originalName);
    await fs.writeFile(originalPath, buffer);
    writtenFiles.push(originalPath);

    const preferred = [...variants].reverse().find((item) => item.width <= 1600) || variants[variants.length - 1];
    return {
      originalUrl: `/uploads/originals/${originalName}`,
      url: preferred.url,
      width: sourceWidth,
      height: sourceHeight,
      variants,
    };
  } catch (error) {
    await Promise.allSettled(writtenFiles.map((file) => fs.unlink(file)));
    throw error;
  }
}
