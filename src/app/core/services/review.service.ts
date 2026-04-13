import { Injectable } from '@angular/core';

export interface Review {
  id: string;
  kellereiId: string;
  userId: string;
  username: string;
  stars: number;
  comment: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly STORAGE_KEY = 'wine_reviews';

  constructor() {}

  private getAllReviews(): Review[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getReviewsForKellerei(kellereiId: string): Review[] {
    return this.getAllReviews().filter(r => r.kellereiId === kellereiId);
  }

  addReview(review: Omit<Review, 'id' | 'date'>): void {
    const reviews = this.getAllReviews();
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString()
    };
    reviews.push(newReview);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
  }

  deleteReview(id: string): void {
    const reviews = this.getAllReviews().filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
  }
}
