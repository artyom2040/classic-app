import { Term, TermMedia } from '../types';
import { buildYouTubeUrl } from './musicLinks';

// Type that matches both raw JSON and transformed Term
interface TermLike {
  id: string | number;
  term: string;
  category: string;
  shortDefinition?: string;
  longDefinition?: string;
  definition?: string;
  example?: string;
  media?: Array<{
    label: string;
    url: string;
    type: string;
  }>;
}

// Helpers to keep glossary field handling consistent
export function getLongDefinition(term: TermLike): string {
  const value = term.longDefinition || term.definition || term.shortDefinition || '';
  return value.trim();
}

export function getShortDefinition(term: TermLike): string {
  if (term.shortDefinition && term.shortDefinition.trim().length > 0) {
    return term.shortDefinition.trim();
  }

  const source = getLongDefinition(term);
  if (!source) return '';

  if (source.length <= 140) return source;

  const firstSentence = source.split('. ').shift() || source;
  const condensed = firstSentence.trim();
  if (condensed.length > 30 && condensed.length <= 200) {
    return condensed.endsWith('.') ? condensed : `${condensed}.`;
  }

  return `${source.slice(0, 140).trim()}…`;
}

export function getTermMedia(term: TermLike): TermMedia[] {
  if (term.media && term.media.length > 0) return term.media as TermMedia[];

  if (term.example) {
    return [
      {
        label: 'Listen on YouTube',
        url: buildYouTubeUrl(term.example),
        type: 'youtube',
      },
    ];
  }

  return [];
}

