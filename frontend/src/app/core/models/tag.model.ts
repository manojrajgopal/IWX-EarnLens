export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

export type TagPayload = Pick<Tag, 'name'> & Partial<Pick<Tag, 'color'>>;
