import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="profil-container">
      <mat-card class="profil-card">
        <mat-card-header>
          <div mat-card-avatar class="avatar">
            <mat-icon>person</mat-icon>
          </div>
          <mat-card-title>Mein Profil</mat-card-title>
          <mat-card-subtitle>Benutzerinformationen</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          @if (authService.currentUser(); as user) {
            <div class="info-row">
              <strong>Benutzername:</strong>
              <span>{{ user.username }}</span>
            </div>
            <div class="info-row">
              <strong>E-Mail:</strong>
              <span>{{ user.email }}</span>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profil-container {
      padding: 2rem;
      display: flex;
      justify-content: center;
    }
    .profil-card {
      width: 100%;
      max-width: 500px;
    }
    .avatar {
      background-color: #8B1A1A;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }
    .info-row:last-child {
      border-bottom: none;
    }
  `]
})
export default class ProfilComponent {
  authService = inject(AuthService);
}
