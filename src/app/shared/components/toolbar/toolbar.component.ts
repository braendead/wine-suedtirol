import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SharedSearchBarComponent } from '../search-bar/search-bar.component';
import { AuthDialogComponent } from '../../../features/auth/auth-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    SharedSearchBarComponent
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <div class="toolbar-left">
        <a routerLink="/home" class="logo">wine-suedtirol</a>
      </div>

      <div class="toolbar-center">
        <app-search-bar
          [allOptions]="kellereiNamen"
          (search)="onSearch($event)">
        </app-search-bar>
      </div>

      <div class="toolbar-right">
        <button mat-button routerLink="/wine-awards">Wine Awards</button>

        @if (authService.currentUser()) {
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profil">
              <mat-icon>person</mat-icon>
              <span>Mein Profil</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Abmelden</span>
            </button>
          </mat-menu>
        } @else {
          <button mat-raised-button color="accent" (click)="openAuthDialog()">Anmelden</button>
        }
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .toolbar-left {
      flex: 1;
    }
    .logo {
      color: white;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .toolbar-center {
      flex: 2;
      display: flex;
      justify-content: center;
    }
    .toolbar-right {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .toolbar-center {
        display: none;
      }
    }
  `]
})
export class SharedToolbarComponent implements OnInit {
  authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private apiService = inject(ApiService);

  kellereiNamen: string[] = [];

  ngOnInit() {
    // Wir fordern 200 Einträge an, damit wir möglichst alle im Dropdown haben
    this.apiService.getKellereien(1, 200).subscribe({
      next: (response: any) => {
        // Zieht die Liste aus der PaginatedResponse und filtert die Namen heraus
        const kellereien = response.Items || response.items || [];
        this.kellereiNamen = kellereien.map((k: any) => k.ShortName || k.name || k.Detail?.de?.Title);
      },
      error: (err) => console.error('Fehler beim Laden der Kellereien für die Suche', err)
    });
  }

  openAuthDialog() {
    this.dialog.open(AuthDialogComponent, {
      width: '400px'
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  onSearch(term: string) {
    this.router.navigate(['/home'], { queryParams: { search: term } });
  }
}
