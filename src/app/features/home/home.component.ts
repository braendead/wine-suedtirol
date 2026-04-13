import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../../core/services/api.service';
import { GeolocationService } from '../../core/services/geolocation.service';
import { Kellerei } from '../../core/models/kellerei.model';
import { LanguagePipe } from '../../shared/pipes/language.pipe';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    LanguagePipe
  ],
  template: `
    <div class="home-container">
      <div class="sidebar">
        @if (isLoading()) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <mat-nav-list>
            @for (kellerei of filteredKellereien(); track kellerei.Id) {
              <a mat-list-item (click)="goToDetail(kellerei.Id)">
                <span matListItemTitle>{{ kellerei.Detail | language }}</span>
                <span matListItemLine>{{ kellerei.ContactInfos?.de?.City || kellerei.ContactInfos?.it?.City || '' }}</span>
              </a>
            }
            @if (filteredKellereien().length === 0) {
              <p class="no-results">Keine Kellereien gefunden.</p>
            }
          </mat-nav-list>
          
          @if (!searchTerm()) {
            <mat-paginator
              [length]="totalResults()"
              [pageSize]="pageSize()"
              [pageIndex]="currentPage() - 1"
              (page)="onPageChange($event)"
              aria-label="Select page">
            </mat-paginator>
          }
        }
      </div>
      <div class="map-container">
        <div id="map" class="map"></div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      height: calc(100vh - 64px); /* Subtract toolbar height */
    }
    .sidebar {
      width: 30%;
      min-width: 300px;
      overflow-y: auto;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
    }
    .map-container {
      flex: 1;
      height: 100%;
    }
    .map {
      width: 100%;
      height: 100%;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .no-results {
      padding: 1rem;
      text-align: center;
      color: #666;
    }
    @media (max-width: 768px) {
      .home-container {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        height: 40%;
      }
      .map-container {
        height: 60%;
      }
    }
  `]
})
export default class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  private geoService = inject(GeolocationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  kellereien = signal<Kellerei[]>([]);
  filteredKellereien = signal<Kellerei[]>([]);
  isLoading = signal<boolean>(false);
  
  totalResults = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  searchTerm = signal<string>('');

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  constructor() {
    effect(() => {
      const term = this.searchTerm().toLowerCase();
      if (term) {
        // In a real app, we might need to search across all pages via API
        // For now, we filter the current page
        this.filteredKellereien.set(
          this.kellereien().filter(k => {
            const titleDe = k.Detail?.de?.Title?.toLowerCase() || '';
            const titleIt = k.Detail?.it?.Title?.toLowerCase() || '';
            return titleDe.includes(term) || titleIt.includes(term);
          })
        );
      } else {
        this.filteredKellereien.set(this.kellereien());
      }
      this.updateMapMarkers();
    });
  }

  ngOnInit() {
    this.initMap();
    
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm.set(params['search']);
      } else {
        this.searchTerm.set('');
      }
    });

    this.loadKellereien();
  }

  loadKellereien() {
    this.isLoading.set(true);
    this.apiService.getKellereien(this.currentPage(), this.pageSize()).subscribe({
      next: (res) => {
        this.kellereien.set(res.Items);
        this.totalResults.set(res.TotalResults);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading kellereien', err);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadKellereien();
  }

  goToDetail(id: string) {
    this.router.navigate(['/kellerei', id]);
  }

  private initMap() {
    this.map = L.map('map').setView([46.4983, 11.3548], 10); // Default to Bolzano

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.geoService.getCurrentPosition().subscribe({
      next: (pos) => {
        if (this.map) {
          this.map.setView([pos.coords.latitude, pos.coords.longitude], 12);
          L.marker([pos.coords.latitude, pos.coords.longitude])
            .addTo(this.map)
            .bindPopup('Ihr Standort');
        }
      },
      error: () => {
        // Fallback already set
      }
    });
  }

  private updateMapMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const wineIcon = L.divIcon({
      html: '<div style="background-color: #8B1A1A; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍷</div>',
      className: 'custom-wine-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.filteredKellereien().forEach(k => {
      if (k.GpsInfo && k.GpsInfo.length > 0) {
        const lat = k.GpsInfo[0].Latitude;
        const lng = k.GpsInfo[0].Longitude;
        
        const title = k.Detail?.de?.Title || k.Detail?.it?.Title || 'Unbekannt';
        const city = k.ContactInfos?.de?.City || k.ContactInfos?.it?.City || '';

        const marker = L.marker([lat, lng], { icon: wineIcon })
          .addTo(this.map!)
          .bindPopup(`<b>${title}</b><br>${city}`)
          .on('click', () => this.goToDetail(k.Id));
        
        this.markers.push(marker);
      }
    });
  }
}
