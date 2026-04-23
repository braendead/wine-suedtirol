import { Component, OnInit, inject, signal, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { WineAward } from '../../core/models/wine-award.model';
import { SharedBackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { LanguagePipe } from '../../shared/pipes/language.pipe';

@Component({
  selector: 'app-wine-awards',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    SharedBackButtonComponent,
    LanguagePipe
  ],
  template: `
    <div class="awards-container">
      <div class="header-section">
        <app-back-button></app-back-button>
        <h2>Südtirol Wine Awards</h2>
      </div>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Z.B. Chardonnay" #input>
      </mat-form-field>

      <div class="table-container mat-elevation-z8">
        @if (isLoading()) {
          <div class="loading-shade">
            <mat-spinner></mat-spinner>
          </div>
        }

        <table mat-table [dataSource]="dataSource" matSort>

          <!-- Year Column -->
          <ng-container matColumnDef="Year">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Jahr </th>
            <td mat-cell *matCellDef="let row"> {{row.Awardyear || row.Vintage || '-'}} </td>
          </ng-container>

          <!-- Awardname Column -->
          <ng-container matColumnDef="Awardname">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Award </th>
            <td mat-cell *matCellDef="let row">
              {{ row.Awards && row.Awards.length > 0 ? row.Awards.join(', ') : 'Kein Award Name' }}
            </td>
          </ng-container>

          <!-- Wine Column -->
          <ng-container matColumnDef="Wine">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Wein </th>
            <td mat-cell *matCellDef="let row"> {{row.Detail | language}} </td>
          </ng-container>

          <!-- Image Column -->
          <ng-container matColumnDef="Image">
            <th mat-header-cell *matHeaderCellDef> Bild </th>
            <td mat-cell *matCellDef="let row">
              @if (row.ImageGallery?.length) {
                <img [src]="row.ImageGallery[0].ImageUrl" alt="Wine Image" class="thumbnail">
              } @else {
                <span class="no-image">-</span>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="4">
              @if (isLoading()) {
                Lade Daten...
              } @else if (input.value) {
                Keine Daten gefunden für "{{input.value}}"
              } @else {
                Keine Wine Awards verfügbar.
              }
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" [pageSize]="10" aria-label="Select page of awards"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .awards-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .filter-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 1rem;
    }
    .table-container {
      position: relative;
      min-height: 200px;
      overflow: auto;
    }
    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .thumbnail {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }
    .no-image {
      color: #999;
    }
    table {
      width: 100%;
    }
    @media (max-width: 768px) {
      /* Hide some columns on mobile */
      .mat-column-Image {
        display: none;
      }
    }
  `]
})
export default class WineAwardsComponent implements OnInit {
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['Year', 'Awardname', 'Wine', 'Image'];
  dataSource = new MatTableDataSource<WineAward>();
  isLoading = signal<boolean>(true);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.apiService.getWineAwards(1, 200).subscribe({
      next: (res) => {
        console.log('Received wine awards:', res);

        // Ensure we handle missing records gracefully
        const safeItems = res.Items ? res.Items.filter(item => item !== null && item !== undefined) : [];
        this.dataSource.data = safeItems;

        // Custom filter predicate to search in nested objects
        this.dataSource.filterPredicate = (data: WineAward, filter: string) => {
          if (!data) return false;
          const dataStr = (
            (data.Awardyear?.toString() || '') +
            (data.Vintage?.toString() || '') +
            (data.Awards?.join(' ') || '') +
            (data.Detail?.de?.Title || '') +
            (data.Detail?.it?.Title || '')
          ).toLowerCase();
          return dataStr.indexOf(filter) != -1;
        };

        // Timeout to ensure view children are initialized when setting them
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading.set(false);
          this.cdr.detectChanges(); // Force change detection
        }, 0);
      },
      error: (err) => {
        console.error('Error loading wine awards', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
