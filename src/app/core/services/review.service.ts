import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: string; // id wird vom JSON-Server generiert
  kellereiId: string;
  userId: string;
  username: string;
  stars: number;
  comment: string;
  date: string;
  kellereiName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/reviews';

  getReviewsForKellerei(kellereiId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}?kellereiId=${kellereiId}`);
  }

  getReviewsByUser(username: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}?username=${username}`);
  }

  addReview(review: Omit<Review, 'id' | 'date'>): Observable<Review> {
    const newReview = {
      ...review,
      date: new Date().toISOString()
    };
    return this.http.post<Review>(this.API_URL, newReview);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
