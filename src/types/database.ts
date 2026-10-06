export type Document = {
  id: string;
  owner_id: string;
  title: string;
  file_path: string;
  file_size: number | null;
  updated_at: string;
  created_at: string;
};

export type ReadingProgress = {
  document_id: string;
  user_id: string;
  page: number;
  updated_at: string;
};

export type Bookmark = {
  id: string;
  document_id: string;
  user_id: string;
  page: number;
  note: string | null;
  created_at: string;
};
