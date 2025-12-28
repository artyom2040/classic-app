import { ComposerBuilder, WeeklyAlbumBuilder } from './builders';

describe('ComposerBuilder', () => {
  it('builds a default composer', () => {
    const composer = new ComposerBuilder().build();
    expect(composer.id).toBe('test-composer-1');
    expect(composer.name).toBe('Test Composer');
  });

  it('builds a composer with custom fields', () => {
    const composer = new ComposerBuilder()
      .withId('bach')
      .withName('Bach')
      .withPeriod('Baroque')
      .build();

    expect(composer.id).toBe('bach');
    expect(composer.name).toBe('Bach');
    expect(composer.period).toBe('Baroque');
  });

  it('ensures immutability of the constructed object', () => {
    const builder = new ComposerBuilder().withName('Original');
    const composer1 = builder.build();
    
    // Modify builder
    builder.withName('Modified');
    const composer2 = builder.build();

    expect(composer1.name).toBe('Original');
    expect(composer2.name).toBe('Modified');
    expect(composer1).not.toBe(composer2);
  });
});

describe('WeeklyAlbumBuilder', () => {
  it('builds a default album', () => {
    const album = new WeeklyAlbumBuilder().build();
    expect(album.id).toBe('album-1');
    expect(album.title).toBe('Test Album');
  });

  it('builds an album with custom fields', () => {
    const album = new WeeklyAlbumBuilder()
      .withId('album-2')
      .withTitle('Custom Album')
      .withListenerLevel('advanced')
      .build();

    expect(album.id).toBe('album-2');
    expect(album.title).toBe('Custom Album');
    expect(album.listenerLevel).toBe('advanced');
  });
});
