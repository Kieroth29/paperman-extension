export type PapermanAPIResponse = {
  publications: Publication[];
};

export type Publication = {
  authors: Author[];
  title: string;
  venue: null | string;
  year: number;
  access: Access | null;
  type: string;
  ee: string;
  url: string;
  publisher: null | string;
};

export enum Access {
  Closed = "closed",
  Open = "open",
}

export type Author = {
  pid: string;
  name: string;
};
