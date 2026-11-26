import type { NewsArticle } from '@prisma/client';
import { normalizeNewsCategory } from '@/lib/news-categories';
import { referenceNewsImage } from '@/lib/reference-images';
import { publicDocumentUrl } from '@/lib/public-documents';

export function publicNewsArticles(dbArticles: NewsArticle[], category = '') {
  const seenArticleCopies = new Set<string>();
  const uniqueArticles = dbArticles.filter((article) => {
    const title = String(article.title || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
    const summary = article.blurb.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
    const identity = title && summary ? `${normalizeNewsCategory(article.kind)}\n${title}\n${summary}` : String(article.slug || article.id);
    if (seenArticleCopies.has(identity)) return false;
    seenArticleCopies.add(identity);
    return true;
  });

  return uniqueArticles.filter((article) => !category || normalizeNewsCategory(article.kind) === category).map((a) => {
    let image_path = '';
    let cleanContent = a.content || '';
    if (cleanContent.includes('<!-- HAB_COVER_IMAGE:')) {
      const match = cleanContent.match(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->/);
      if (match) {
        image_path = match[1];
        cleanContent = cleanContent.replace(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->\s*/, '');
      }
    }

    const finalImage = image_path || a.imageUrl || referenceNewsImage(a.slug ?? undefined) || null;

    return {
      ...a,
      kind: normalizeNewsCategory(a.kind),
      documentUrl: publicDocumentUrl(a.documentUrl),
      pdfUrl: null,
      date: a.dateString || '',
      published_at: a.dateString || '',
      slug: a.slug || a.id,
      image_path: finalImage,
      imageUrl: finalImage,
      content: cleanContent,
    };
  });
}
