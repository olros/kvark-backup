import { CheatsheetType, Study, WarningType } from 'types/Enums';

export interface Cheatsheet {
  course: string;
  creator: string;
  grade: number;
  id: string;
  official: boolean;
  study: Study;
  title: string;
  type: CheatsheetType;
  url: string;
}

export interface CompaniesEmail {
  info: {
    bedrift: string;
    kontaktperson: string;
    epost: string;
  };
  time: Array<string>;
  type: Array<string>;
  comment: string;
}

export interface FileUploadResponse {
  url: string;
}

export interface Notification {
  id: number;
  read: boolean;
  title: string;
  description: string;
  link?: string;
  created_at: string;
}

export interface PaginationResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  results: Array<T>;
}

export interface Permissions {
  write: boolean;
  read: boolean;
  destroy?: boolean;
}

export interface RequestResponse {
  detail: string;
}

export interface ShortLink {
  name: string;
  url: string;
}

export interface Warning {
  created_at: string;
  id: number;
  text: string;
  type: WarningType;
  updated_at: string;
}
