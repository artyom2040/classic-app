// Public domain composer portraits from Wikimedia Commons
// These are all historical portraits in the public domain

export const COMPOSER_PORTRAITS: Record<string, any> = {
  // Generated Portraits
  bach: require('../../assets/generated/composer_bach_1765122792731.png'),
  mozart: require('../../assets/generated/composer_mozart_1765122806578.png'),
  beethoven: require('../../assets/generated/composer_beethoven_1765122823271.png'),
  chopin: require('../../assets/generated/composer_chopin_1765122840100.png'),
  tchaikovsky: require('../../assets/generated/composer_tchaikovsky_1765122855669.png'),
  vivaldi: require('../../assets/generated/composer_vivaldi_1765122880434.png'),
  handel: require('../../assets/generated/composer_handel_1765122902011.png'),
  brahms: require('../../assets/generated/composer_brahms_1765122922669.png'),
  debussy: require('../../assets/generated/composer_debussy_1765122939084.png'),
  stravinsky: require('../../assets/generated/composer_stravinsky_1765122956129.png'),

  // Medieval (placeholders / Wikimedia where available)
  hildegard: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Heiligenlexikon_Hildegard_von_Bingen.jpg/220px-Heiligenlexikon_Hildegard_von_Bingen.jpg',
  machaut: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Guillaume_de_Machaut.jpg/220px-Guillaume_de_Machaut.jpg',
  perotin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Perotin.jpg/220px-Perotin.jpg',
  leonin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Perotinus.jpg/220px-Perotinus.jpg',
  guido_arezzo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Guido_von_Arezzo.jpg/220px-Guido_von_Arezzo.jpg',
  adam_st_victor: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Adam_of_Saint_Victor_-_Stained_Glass_Window.jpg/220px-Adam_of_Saint_Victor_-_Stained_Glass_Window.jpg',
  adam_de_la_halle: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Adam_de_la_Halle.png/220px-Adam_de_la_Halle.png',
  troubadours: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chansonnier_du_Roy_1.jpg/220px-Chansonnier_du_Roy_1.jpg',
  le_jeune: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Claude_Le_Jeune_-_1580.jpg/220px-Claude_Le_Jeune_-_1580.jpg',
  dunstable: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Dunstaple.jpg/220px-Dunstaple.jpg',

  // Romantic (Overrides for generated, keeping others as fallback if needed)
  schubert: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Franz_Schubert_by_Wilhelm_August_Rieder_1875_larger_version.png/220px-Franz_Schubert_by_Wilhelm_August_Rieder_1875_larger_version.png',
  liszt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Franz_Liszt_1858.jpg/220px-Franz_Liszt_1858.jpg',
  dvorak: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Dvorak.jpg/220px-Dvorak.jpg',
  wagner: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/RichardWagner.jpg/220px-RichardWagner.jpg',
  verdi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Giuseppe_Verdi_by_Giovanni_Boldini.jpg/220px-Giuseppe_Verdi_by_Giovanni_Boldini.jpg',
  mendelssohn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Felix_Mendelssohn_Bartholdy.jpg/220px-Felix_Mendelssohn_Bartholdy.jpg',
  schumann: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Robert_Schumann_1839.jpg/220px-Robert_Schumann_1839.jpg',

  // Late Romantic / Impressionist
  ravel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Maurice_Ravel_1925.jpg/220px-Maurice_Ravel_1925.jpg',
  mahler: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mahler_1909.jpg/220px-Mahler_1909.jpg',
  rachmaninoff: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sergei_Rachmaninoff%2C_1901.jpg/220px-Sergei_Rachmaninoff%2C_1901.jpg',

  // 20th Century
  shostakovich: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Dmitri_Shostakovich_credit_Deutsche_Fotothek_adjusted.jpg/220px-Dmitri_Shostakovich_credit_Deutsche_Fotothek_adjusted.jpg',
  prokofiev: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Sergei_Prokofiev_circa_1918_over_Chair_Bain.jpg/220px-Sergei_Prokofiev_circa_1918_over_Chair_Bain.jpg',
  bartok: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Bart%C3%B3k_B%C3%A9la_1927.jpg/220px-Bart%C3%B3k_B%C3%A9la_1927.jpg',
  copland: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Aaron_Copland_1970.jpg/220px-Aaron_Copland_1970.jpg',
  bernstein: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Leonard_Bernstein_by_Jack_Mitchell.jpg/220px-Leonard_Bernstein_by_Jack_Mitchell.jpg',
  glass: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Philip_Glass_in_Florence%2C_Italy_-_1993.jpg/220px-Philip_Glass_in_Florence%2C_Italy_-_1993.jpg',

  // Additional composers
  puccini: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/GiacomoPuccini.jpg/220px-GiacomoPuccini.jpg',
  sibelius: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Jean_Sibelius%2C_1913.jpg/220px-Jean_Sibelius%2C_1913.jpg',
  grieg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Edvard_Grieg_%281888%29_by_Elliot_and_Fry_-_02.jpg/220px-Edvard_Grieg_%281888%29_by_Elliot_and_Fry_-_02.jpg',
  elgar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Edward_Elgar.jpg/220px-Edward_Elgar.jpg',
  saintSaens: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Camille_Saint-Sa%C3%ABns_by_Pierre_Petit.jpg/220px-Camille_Saint-Sa%C3%ABns_by_Pierre_Petit.jpg',
};

// Period/Era placeholder images
export const ERA_IMAGES: Record<string, any> = {
  baroque: require('../../assets/generated/era_baroque_1765122657164.png'),
  classical: require('../../assets/generated/era_classical_1765122673236.png'),
  romantic: require('../../assets/generated/era_romantic_1765122776629.png'),
  medieval: require('../../assets/generated/era_medieval_1765122690844.png'),
  renaissance: require('../../assets/generated/era_renaissance_1765122706396.png'),
  modern: require('../../assets/generated/era_modern_1765122728054.png'),
  contemporary: require('../../assets/generated/era_contemporary_1765122750612.png'),
};

// Helper to get composer portrait with fallback
export function getComposerPortrait(composerId: string): string | number | null {
  return COMPOSER_PORTRAITS[composerId.toLowerCase()] || null;
}

// Helper to get era image
export function getEraImage(periodId: string): string | number | null {
  return ERA_IMAGES[periodId.toLowerCase()] || null;
}

// Generic music-related placeholder images
export const PLACEHOLDER_IMAGES = {
  album: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Vinyl_record.jpg/220px-Vinyl_record.jpg',
  sheet_music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Beethoven_piano_sonata_14_-_title.png/220px-Beethoven_piano_sonata_14_-_title.png',
  orchestra: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Konzerthaus_Berlino%2C_interior.jpg/320px-Konzerthaus_Berlino%2C_interior.jpg',
  piano: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Steinway_Model_D_Concert_Grand_Piano.jpg/320px-Steinway_Model_D_Concert_Grand_Piano.jpg',
  violin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Old_violin.jpg/140px-Old_violin.jpg',
};
