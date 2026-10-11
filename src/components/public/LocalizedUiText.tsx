'use client';

import type { ElementType } from 'react';
import { useLanguage } from '@/context/LanguageContext';

type Props = {
  translationKey: string;
  english: string;
  as?: ElementType;
  className?: string;
};

/** Renders a shared interface string in the selected site language. */
export default function LocalizedUiText({ translationKey, english, as: Tag = 'span', className }: Props) {
  const { t } = useLanguage();
  return <Tag className={className}>{t(translationKey, english)}</Tag>;
}
