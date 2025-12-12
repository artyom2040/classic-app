/**
 * Album Categories - Smart category assignment based on album content
 * Maps albums to categories for filtering on home screen
 */

// Category definitions matching the UI chips
export type AlbumCategory = 'baroque' | 'symphonies' | 'piano' | 'opera' | 'all';

// Keywords that indicate each category (case-insensitive)
const CATEGORY_KEYWORDS: Record<AlbumCategory, string[]> = {
    baroque: ['baroque', 'bach', 'vivaldi', 'handel', 'purcell', 'harpsichord', 'period instrument', 'english concert', 'europa galante'],
    symphonies: ['symphony', 'symphonic', 'orchestral', 'orchestra', 'philharmonic', 'concerto', 'overture', 'suite'],
    piano: ['piano', 'nocturne', 'sonata', 'prelude', 'etude', 'chopin', 'liszt', 'rachmaninoff', 'debussy', 'ravel', 'zimerman', 'pollini', 'gould'],
    opera: ['opera', 'verdi', 'puccini', 'tosca', 'traviata', 'carmen', 'wagner', 'ring', 'tristan', 'carmen', 'boheme', 'requiem', 'oratorio', 'messiah'],
    all: [], // Special case - matches everything
};

/**
 * Determines the categories an album belongs to based on its content
 */
export function getAlbumCategories(album: { title: string; artist: string; description?: string }): AlbumCategory[] {
    const searchText = `${album.title} ${album.artist} ${album.description || ''}`.toLowerCase();

    const categories: AlbumCategory[] = [];

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (category === 'all') continue; // Skip 'all' category

        const hasMatch = keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        if (hasMatch) {
            categories.push(category as AlbumCategory);
        }
    }

    // If no categories matched, assign to symphonies as default (orchestral music)
    if (categories.length === 0) {
        categories.push('symphonies');
    }

    return categories;
}

/**
 * Filters albums by category
 */
export function filterAlbumsByCategory<T extends { title: string; artist: string; description?: string }>(
    albums: T[],
    category: AlbumCategory
): T[] {
    if (category === 'all') {
        return albums;
    }

    return albums.filter(album => {
        const albumCategories = getAlbumCategories(album);
        return albumCategories.includes(category);
    });
}

/**
 * Gets a single album matching the category, with fallback
 */
export function getAlbumForCategory<T extends { title: string; artist: string; description?: string }>(
    albums: T[],
    category: AlbumCategory,
    weekIndex: number = 0
): T {
    const filtered = filterAlbumsByCategory(albums, category);

    if (filtered.length === 0) {
        // Fallback to first album if no match
        return albums[weekIndex % albums.length];
    }

    // Return album at index (cycling through matches)
    return filtered[weekIndex % filtered.length];
}
