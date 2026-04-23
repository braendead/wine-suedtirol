import { Component, OnInit, AfterViewInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
                <span matListItemLine>
                  {{ kellerei.ContactInfos?.de?.City || kellerei.ContactInfos?.it?.City || '' }}
                </span>
              </a>
            }
          </mat-nav-list>
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
      height: calc(100vh - 64px);
    }
    .sidebar {
      width: 30%;
      min-width: 300px;
      overflow-y: auto;
      border-right: 1px solid #e0e0e0;
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
  `]
})
export default class HomeComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);
  private geoService = inject(GeolocationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  kellereien = signal<Kellerei[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');

  filteredKellereien = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.kellereien();

    if (!term) return all;

    return all.filter(k => {
      const titleDe = k.Detail?.de?.Title?.toLowerCase() || '';
      const titleIt = k.Detail?.it?.Title?.toLowerCase() || '';
      return titleDe.includes(term) || titleIt.includes(term);
    });
  });

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  constructor() {
    effect(() => {
      const k = this.filteredKellereien();
      if (!this.map) return;
      setTimeout(() => this.updateMapMarkers(k), 0);
    });
  }

  ngOnInit() {
    this.loadAllKellereien();

    this.route.queryParams.subscribe(params => {
      this.searchTerm.set(params['search'] || '');
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  loadAllKellereien() {
    this.isLoading.set(true);

    const pageSize = 100;
    let currentPage = 1;
    let all: Kellerei[] = [];

    const loadPage = () => {
      this.apiService.getKellereien(currentPage, pageSize).subscribe({
        next: (res) => {
          all = all.concat(res.Items || []);

          if (currentPage < res.TotalPages) {
            currentPage++;
            loadPage();
          } else {
            this.kellereien.set(all);
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
    };

    loadPage();
  }

  goToDetail(id: string) {
    this.router.navigate(['/kellerei', id]);
  }

  private initMap() {
    if (this.map) return;

    this.map = L.map('map').setView([46.4983, 11.3548], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    this.geoService.getCurrentPosition().subscribe({
      next: (pos) => {
        this.map?.setView([pos.coords.latitude, pos.coords.longitude], 12);

        L.marker([pos.coords.latitude, pos.coords.longitude])
          .addTo(this.map!)
          .bindPopup('Ihr Standort');
      }
    });
  }

  private updateMapMarkers(kellereien: Kellerei[]) {
    if (!this.map) return;

    this.markers.forEach(m => m.remove());
    this.markers = [];

    // 🍷 Wein-Marker
    const wineIcon = L.divIcon({
      html: `
        <div style="
          background-color: #7B1E1E;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          🍷
        </div>
      `,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    kellereien.forEach(k => {
      const gps = k.GpsInfo?.[0];
      if (!gps?.Latitude || !gps?.Longitude) return;

      const lat = gps.Latitude;
      const lng = gps.Longitude;

      const title =
        k.Detail?.de?.Title ||
        k.Detail?.it?.Title ||
        'Unbekannt';

      const city =
        k.ContactInfos?.de?.City ||
        k.ContactInfos?.it?.City ||
        '';

      const marker = L.marker([lat, lng], { icon: wineIcon })
        .addTo(this.map!)
        .bindPopup(`<b>${title}</b><br>${city}`)
        .on('click', () => this.goToDetail(k.Id));

      this.markers.push(marker);
    });

    if (this.markers.length > 0) {
      const bounds = L.latLngBounds(
        this.markers.map(m => m.getLatLng())
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}
