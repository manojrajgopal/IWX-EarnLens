import { Category } from '../../../../core/models/category.model';
import { Source } from '../../../../core/models/source.model';
import { Tag } from '../../../../core/models/tag.model';

/** Name lookups used to resolve foreign keys on an income into labels. */
export interface DetailLookups {
  categories: Map<string, Category>;
  sources: Map<string, Source>;
  tags: Map<string, Tag>;
}

export const EMPTY_LOOKUPS: DetailLookups = {
  categories: new Map(),
  sources: new Map(),
  tags: new Map(),
};
