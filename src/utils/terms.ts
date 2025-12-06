import { Term, TermMedia } from '../types';
import { buildYouTubeUrl } from './musicLinks';

// Helpers to keep glossary field handling consistent
export function getLongDefinition(term: Term): string {
  const value = term.longDefinition || term.definition || term.shortDefinition || '';
  return value.trim();
}

export function getShortDefinition(term: Term): string {
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

export function getTermMedia(term: Term): TermMedia[] {
  if (term.media && term.media.length > 0) return term.media;

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
