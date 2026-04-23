export interface WineAward {
  Awardyear: any;
  Vintage: any;
  Awards: any;
  Detail: any;
  Id: string;
  Awardname: string;
  Winnername: string;
  Wine: string;
  Year: number;
  Category: string;
  ImageGallery?: {
    ImageUrl: string;
    Width: number;
    Height: number;
  }[];
}
