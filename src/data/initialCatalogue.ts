import { BELSA_CATALOGUE_FULL, BelsaProductSeries } from './belsaCatalogueFull';
import catalogueOverrides from './catalogueOverrides.json';

const deletedSet = new Set(catalogueOverrides.deletedIds || []);
const modifiedMap = (catalogueOverrides.modifiedItems || {}) as Record<string, BelsaProductSeries>;
const customList = (catalogueOverrides.customItems || []) as BelsaProductSeries[];

// Initial catalogue synchronized with admin overrides for immediate zero-flicker rendering
export const INITIAL_CATALOGUE: BelsaProductSeries[] = [
  ...BELSA_CATALOGUE_FULL
    .filter((item) => !deletedSet.has(item.id))
    .map((item) => modifiedMap[item.id] || item),
  ...customList
    .filter((item) => !deletedSet.has(item.id))
    .map((item) => modifiedMap[item.id] || item),
];
