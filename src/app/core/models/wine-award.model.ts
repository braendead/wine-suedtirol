export interface WineAward {
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
