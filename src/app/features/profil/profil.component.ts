import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/services/auth.service';
import { ReviewService, Review } from '../../core/services/review.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatDividerModule, MatInputModule, MatFormFieldModule, MatSnackBarModule
  ],
  template: `
    <div class="profil-container">
      <div class="content-wrapper">
        <mat-card class="profil-card">
          <mat-card-header>
            <div mat-card-avatar class="avatar"><mat-icon>person</mat-icon></div>
            <mat-card-title>Mein Profil</mat-card-title>
            <mat-card-subtitle>Benutzerinformationen</mat-card-subtitle>
            <button mat-icon-button class="edit-button" (click)="toggleEditMode()">
              <mat-icon>{{ isEditing() ? 'close' : 'edit' }}</mat-icon>
            </button>
          </mat-card-header>

          <mat-card-content>
            @if (authService.currentUser(); as user) {
              <div class="info-row">
                <strong>Benutzername:</strong>
                @if (!isEditing()) {
                  <span>{{ user.username }}</span>
                } @else {
                  <mat-form-field appearance="outline" class="edit-field" subscriptSizing="dynamic">
                    <input matInput [(ngModel)]="editUsername" placeholder="Neuer Benutzername">
                  </mat-form-field>
                }
              </div>
              <div class="info-row">
                <strong>E-Mail:</strong>
                <span>{{ user.email }}</span>
              </div>
              @if (isEditing()) {
                <div class="actions-row">
                  <button mat-raised-button color="primary" (click)="saveProfile()" [disabled]="!editUsername.trim()">
                    <mat-icon>save</mat-icon> Speichern
                  </button>
                </div>
              }
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="reviews-card">
          <mat-card-header>
            <mat-card-title>Meine Bewertungen</mat-card-title>
            <mat-card-subtitle>Von dir dagelassene Kommentare</mat-card-subtitle>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content class="review-content">
            @if (myReviews().length === 0) {
              <p class="no-reviews">Du hast noch keine Bewertungen abgegeben.</p>
            } @else {
              <div class="review-list">
                @for (review of myReviews(); track review.id) {
                  <div class="review-item">
                    <div class="review-header">
                      <h4 class="kellerei-link" (click)="goToKellerei(review.kellereiId)">
                        {{ review.kellereiName || 'Kellerei ansehen' }}
                        <mat-icon class="link-icon">launch</mat-icon>
                      </h4>
                      <button mat-icon-button color="warn" (click)="deleteMyReview(review.id!)" title="Löschen">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                    <div class="stars">
                      @for (star of [1,2,3,4,5]; track star) { <mat-icon [class.active]="star <= review.stars">star</mat-icon> }
                      <span class="date-text">{{ review.date | date:'dd.MM.yyyy' }}</span>
                    </div>
                    <p class="comment-text">"{{ review.comment }}"</p>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profil-container { padding: 2rem; display: flex; justify-content: center; }
    .content-wrapper { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 2rem; }
    .profil-card, .reviews-card { width: 100%; }
    mat-card-header { position: relative; }
    .edit-button { position: absolute; right: 16px; top: 16px; }
    .avatar { background-color: #8B1A1A; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee; min-height: 48px; }
    .info-row:last-child { border-bottom: none; }
    .edit-field { width: 200px; }
    .actions-row { display: flex; justify-content: flex-end; margin-top: 1rem; }
    .review-content { padding-top: 1rem; }
    .no-reviews { text-align: center; color: #666; font-style: italic; padding: 2rem 0; }
    .review-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .review-item { background-color: #f9f9f9; border-radius: 8px; padding: 1rem; border-left: 4px solid #8B1A1A; }
    .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .kellerei-link { margin: 0; color: #8B1A1A; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
    .kellerei-link:hover { color: #b52c2c; text-decoration: underline; }
    .link-icon { font-size: 16px; width: 16px; height: 16px; }
    .stars { display: flex; align-items: center; margin-bottom: 0.5rem; }
    .stars mat-icon { color: #ccc; font-size: 16px; width: 16px; height: 16px; }
    .stars mat-icon.active { color: #ffd700; }
    .date-text { margin-left: 10px; font-size: 0.8rem; color: #888; }
    .comment-text { margin: 0; color: #333; font-style: italic; line-height: 1.4; }
  `]
})
export default class ProfilComponent implements OnInit {
  authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  myReviews = signal<Review[]>([]);
  isEditing = signal<boolean>(false);
  editUsername: string = '';

  ngOnInit() {
    this.loadMyReviews();
  }

  toggleEditMode() {
    const user = this.authService.currentUser();
    if (!this.isEditing() && user) {
      this.editUsername = user.username;
    }
    this.isEditing.set(!this.isEditing());
  }

  saveProfile() {
    if (this.editUsername.trim()) {
      this.authService.updateUsername(this.editUsername.trim());
      this.isEditing.set(false);
      this.loadMyReviews();
      this.snackBar.open('Profil erfolgreich aktualisiert', 'Schließen', { duration: 3000 });
    }
  }

  loadMyReviews() {
    const user = this.authService.currentUser();
    if (user) {
      this.reviewService.getReviewsByUser(user.username).subscribe(reviews => {
        reviews.forEach(review => {
          this.apiService.getKellereiById(review.kellereiId).subscribe(data => {
            review.kellereiName = data.Detail?.de?.Title || data.Detail?.it?.Title || 'Unbekannte Kellerei';
            this.myReviews.set([...reviews]);
          });
        });
        this.myReviews.set(reviews);
      });
    }
  }

  deleteMyReview(reviewId: string) {
    if (confirm('Möchtest du diese Bewertung wirklich löschen?')) {
      this.reviewService.deleteReview(reviewId).subscribe(() => {
        this.loadMyReviews();
        this.snackBar.open('Bewertung gelöscht', 'Schließen', { duration: 3000 });
      });
    }
  }

  goToKellerei(kellereiId: string) {
    this.router.navigate(['/kellerei', kellereiId]);
  }
}
