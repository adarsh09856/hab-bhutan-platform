// Editorial illustrations for six inherited event records. These are not
// documentary photographs of the events. A saved event image always wins.
const UNAVAILABLE_EVENT_IMAGE = '/assets/photos/image-unavailable.svg';

const EVENT_ILLUSTRATIONS: Record<string, string> = {
  'craft-bazaar-2026': '/assets/photos/hero-2-punakha.jpg',
  'export-clinic-sep': '/images/programs/trade.jpg',
  'sector-forum-2026': '/assets/photos/about-hab.jpg',
  'dye-training-nov': '/images/programs/dye_training.jpg',
  'buyer-mission-nov': '/images/programs/design_lab.jpg',
  'apprentice-intake-dec': '/images/training_workshop.jpg',
};

export function eventImage(key: string, savedImage?: string | null) {
  const image = savedImage?.trim();
  if (image) return { src: image, illustrative: false };
  const illustration = EVENT_ILLUSTRATIONS[key];
  return illustration
    ? { src: illustration, illustrative: true }
    : { src: UNAVAILABLE_EVENT_IMAGE, illustrative: false };
}

/** Keep fallback art clearly identified without calling it a photograph of the event. */
export function eventImageAlt(title: string, image: ReturnType<typeof eventImage>): string {
  if (image.src === UNAVAILABLE_EVENT_IMAGE) return '';
  return image.illustrative ? `Craft illustration related to ${title}` : title;
}
