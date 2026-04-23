import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ApiService } from '../../core/services/api.service';
import { ReviewService, Review } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { Kellerei } from '../../core/models/kellerei.model';
import { SharedBackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { LanguagePipe } from '../../shared/pipes/language.pipe';
import * as L from 'leaflet';

// Fix Leaflet default icon paths completely
L.Icon.Default.imagePath = 'assets/';

@Component({
  selector: 'app-kellerei-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SharedBackButtonComponent,
    LanguagePipe
  ],
  template: `
    <div class="detail-container">
      <app-back-button></app-back-button>

      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (kellerei()) {
        <mat-card class="kellerei-card">
          <mat-card-header>
            <mat-card-title>{{ kellerei()?.Detail | language }}</mat-card-title>
            <mat-card-subtitle>{{ getContactInfo()?.City }}</mat-card-subtitle>
          </mat-card-header>

          @if (kellerei()?.ImageGallery?.length) {
            <div class="image-gallery">
              <img [src]="kellerei()?.ImageGallery![0].ImageUrl" alt="Kellerei Bild" class="main-image">
            </div>
          }

          <mat-card-content>
            <div class="info-section">
              <h3>Kontakt</h3>
              <p><mat-icon>location_on</mat-icon> {{ getContactInfo()?.Address }}, {{ getContactInfo()?.ZipCode }} {{ getContactInfo()?.City }}</p>
              @if (getContactInfo()?.Phonenumber) {
                <p><mat-icon>phone</mat-icon> {{ getContactInfo()?.Phonenumber }}</p>
              }
              @if (getContactInfo()?.Email) {
                <p><mat-icon>email</mat-icon> <a href="mailto:{{ getContactInfo()?.Email }}">{{ getContactInfo()?.Email }}</a></p>
              }
              @if (getContactInfo()?.Url) {
                <p><mat-icon>language</mat-icon> <a [href]="getContactInfo()?.Url" target="_blank">{{ getContactInfo()?.Url }}</a></p>
              }
            </div>

            @if (kellerei()?.Tags?.length) {
              <div class="tags-section">
                <mat-chip-set>
                  @for (tag of kellerei()?.Tags; track tag.Id) {
                    <mat-chip>{{ tag.Id }}</mat-chip>
                  }
                </mat-chip-set>
              </div>
            }

            <mat-divider></mat-divider>

            <div class="map-section">
              <h3>Standort</h3>
              <div id="mini-map" class="mini-map"></div>
            </div>

            <mat-divider></mat-divider>

            <div class="reviews-section">
              <h3>Bewertungen</h3>

              @if (reviews().length === 0) {
                <p>Noch keine Bewertungen vorhanden.</p>
              } @else {
                <div class="review-list">
                  @for (review of reviews(); track review.id) {
                    <mat-card class="review-item">
                      <mat-card-header>
                        <mat-card-title class="review-title">
                          {{ review.username }}
                          <span class="stars">
                            @for (star of [1,2,3,4,5]; track star) {
                              <mat-icon [class.active]="star <= review.stars">star</mat-icon>
                            }
                          </span>
                        </mat-card-title>
                        <mat-card-subtitle>{{ review.date | date }}</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <p>{{ review.comment }}</p>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              }

              @if (authService.currentUser()) {
                <div class="add-review-section">
                  <h4>Bewertung abgeben</h4>
                  <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                    <div class="star-rating">
                      @for (star of [1,2,3,4,5]; track star) {
                        <mat-icon
                          (click)="setRating(star)"
                          [class.active]="star <= selectedRating()">
                          star
                        </mat-icon>
                      }
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Kommentar</mat-label>
                      <textarea matInput formControlName="comment" rows="3"></textarea>
                      @if (reviewForm.get('comment')?.hasError('minlength')) {
                        <mat-error>Mindestens 10 Zeichen erforderlich</mat-error>
                      }
                    </mat-form-field>

                    <button mat-raised-button color="primary" type="submit" [disabled]="reviewForm.invalid || selectedRating() === 0">
                      Bewertung speichern
                    </button>
                  </form>
                </div>
              } @else {
                <p class="login-prompt">Bitte melden Sie sich an, um eine Bewertung abzugeben.</p>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }
    .kellerei-card {
      margin-top: 1rem;
    }
    .image-gallery {
      width: 100%;
      height: 300px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .info-section p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .tags-section {
      margin: 1rem 0;
    }
    .map-section {
      margin: 1.5rem 0;
    }
    .mini-map {
      height: 250px;
      width: 100%;
      border-radius: 4px;
    }
    .reviews-section {
      margin-top: 1.5rem;
    }
    .review-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .review-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .stars mat-icon {
      color: #ccc;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .stars mat-icon.active {
      color: #ffd700;
    }
    .star-rating {
      margin-bottom: 1rem;
      cursor: pointer;
    }
    .star-rating mat-icon {
      color: #ccc;
    }
    .star-rating mat-icon.active {
      color: #ffd700;
    }
    .full-width {
      width: 100%;
    }
    .login-prompt {
      font-style: italic;
      color: #666;
    }
  `]
})
export default class KellereiDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private reviewService = inject(ReviewService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  kellerei = signal<Kellerei | null>(null);
  isLoading = signal<boolean>(true);
  reviews = signal<Review[]>([]);
  selectedRating = signal<number>(0);

  reviewForm: FormGroup = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });

  private map: L.Map | undefined;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadKellerei(id);
      this.loadReviews(id);
    }
  }

  loadKellerei(id: string) {
    this.apiService.getKellereiById(id).subscribe({
      next: (data) => {
        this.kellerei.set(data);
        this.isLoading.set(false);
        setTimeout(() => this.initMap(), 100); // Wait for DOM
      },
      error: (err) => {
        console.error('Error loading kellerei', err);
        this.isLoading.set(false);
        this.snackBar.open('Fehler beim Laden der Kellerei', 'Schließen', { duration: 3000 });
      }
    });
  }

  loadReviews(id: string) {
    this.reviews.set(this.reviewService.getReviewsForKellerei(id));
  }

  getContactInfo() {
    const k = this.kellerei();
    if (!k) return null;
    return k.ContactInfos?.de || k.ContactInfos?.it;
  }

  initMap() {
    const k = this.kellerei();
    if (!k || !k.GpsInfo || k.GpsInfo.length === 0) return;

    const lat = k.GpsInfo[0].Latitude;
    const lng = k.GpsInfo[0].Longitude;

    this.map = L.map('mini-map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map);
  }

  setRating(rating: number) {
    this.selectedRating.set(rating);
  }

  submitReview() {
    if (this.reviewForm.valid && this.selectedRating() > 0) {
      const user = this.authService.currentUser();
      const k = this.kellerei();

      if (user && k) {
        this.reviewService.addReview({
          kellereiId: k.Id,
          userId: user.username, // Mock user ID
          username: user.username,
          stars: this.selectedRating(),
          comment: this.reviewForm.value.comment
        });

        this.snackBar.open('Bewertung erfolgreich gespeichert', 'Schließen', { duration: 3000 });
        this.reviewForm.reset();
        this.selectedRating.set(0);
        this.loadReviews(k.Id);
      }
    }
  }
}
