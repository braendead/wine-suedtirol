export interface Kellerei {
  Id: string;
  Detail: {
    de?: { Title: string; Language: string };
    it?: { Title: string; Language: string };
    en?: { Title: string; Language: string };
  };
  ContactInfos?: {
    de?: ContactInfo;
    it?: ContactInfo;
  };
  GpsInfo?: {
    Latitude: number;
    Longitude: number;
  }[];
  ImageGallery?: {
    ImageUrl: string;
    Width: number;
    Height: number;
  }[];
  Tags?: { Id: string }[];
  HasLanguage?: string[];
  Active?: boolean;
  Source?: string;
}

export interface ContactInfo {
  Address?: string;
  City?: string;
  ZipCode?: string;
  Phonenumber?: string;
  Email?: string;
  Url?: string;
}

export interface PaginatedResponse<T> {
  TotalResults: number;
  TotalPages: number;
  CurrentPage: number;
  Items: T[];
}
