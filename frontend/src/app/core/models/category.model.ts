export interface Category {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
}

export type CategoryPayload = Pick<Category, 'name'> &
  Partial<Pick<Category, 'description' | 'color' | 'icon'>>;
