import { Composer, WeeklyAlbum, KeyWork, KeyMoment, ListenerLevel } from '../../types';

/**
 * Generic Builder interface
 */
export interface Builder<T> {
  build(): T;
}

/**
 * Composer Builder
 * Implements fluent interface for creating Composer test objects
 */
export class ComposerBuilder implements Builder<Composer> {
  private composer: Composer;

  constructor(initial: Partial<Composer> = {}) {
    this.composer = {
      id: 'test-composer-1',
      name: 'Test Composer',
      years: '1800-1900',
      period: 'romantic',
      nationality: 'German',
      portrait: 'test.jpg',
      shortBio: 'Short bio',
      fullBio: 'Full bio',
      keyWorks: [],
      funFact: 'Fun fact',
      listenFirst: 'test-work',
      spotifyUri: 'spotify:artist:test',
      youtubeSearch: 'test search',
      ...initial,
    };
  }

  withId(id: string): ComposerBuilder {
    this.composer.id = id;
    return this;
  }

  withName(name: string): ComposerBuilder {
    this.composer.name = name;
    return this;
  }

  withPeriod(period: string): ComposerBuilder {
    this.composer.period = period;
    return this;
  }

  withYears(years: string): ComposerBuilder {
    this.composer.years = years;
    return this;
  }

  withNationality(nationality: string): ComposerBuilder {
    this.composer.nationality = nationality;
    return this;
  }

  addKeyWork(work: KeyWork): ComposerBuilder {
    this.composer.keyWorks = [...this.composer.keyWorks, work];
    return this;
  }

  build(): Composer {
    // Return a shallow copy to ensure immutability of the constructed object relative to the builder
    return { ...this.composer };
  }
}

/**
 * Weekly Album Builder
 */
export class WeeklyAlbumBuilder implements Builder<WeeklyAlbum> {
  private album: WeeklyAlbum;

  constructor(initial: Partial<WeeklyAlbum> = {}) {
    this.album = {
      id: 'album-1',
      week: 1,
      title: 'Test Album',
      artist: 'Test Artist',
      year: 2023,
      description: 'Test Description',
      whyListen: 'Why listen text',
      spotifyUri: 'spotify:album:test',
      appleMusicUrl: 'https://music.apple.com/test',
      keyMoments: [],
      listenerLevel: 'beginner',
      ...initial,
    };
  }

  withId(id: string): WeeklyAlbumBuilder {
    this.album.id = id;
    return this;
  }

  withTitle(title: string): WeeklyAlbumBuilder {
    this.album.title = title;
    return this;
  }

  withWeek(week: number): WeeklyAlbumBuilder {
    this.album.week = week;
    return this;
  }

  withListenerLevel(level: ListenerLevel): WeeklyAlbumBuilder {
    this.album.listenerLevel = level;
    return this;
  }

  addKeyMoment(moment: KeyMoment): WeeklyAlbumBuilder {
    this.album.keyMoments = [...this.album.keyMoments, moment];
    return this;
  }

  build(): WeeklyAlbum {
    return { ...this.album };
  }
}
