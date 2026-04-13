import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
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
    SharedBackButtonComponent
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
            <td mat-cell *matCellDef="let row"> {{row.Year}} </td>
          </ng-container>

          <!-- Awardname Column -->
          <ng-container matColumnDef="Awardname">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Award </th>
            <td mat-cell *matCellDef="let row"> {{row.Awardname}} </td>
          </ng-container>

          <!-- Winnername Column -->
          <ng-container matColumnDef="Winnername">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Gewinner </th>
            <td mat-cell *matCellDef="let row"> {{row.Winnername}} </td>
          </ng-container>

          <!-- Wine Column -->
          <ng-container matColumnDef="Wine">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Wein </th>
            <td mat-cell *matCellDef="let row"> {{row.Wine}} </td>
          </ng-container>

          <!-- Category Column -->
          <ng-container matColumnDef="Category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Kategorie </th>
            <td mat-cell *matCellDef="let row"> {{row.Category}} </td>
          </ng-container>

          <!-- Image Column -->
          <ng-container matColumnDef="Image">
            <th mat-header-cell *matHeaderCellDef> Bild </th>
            <td mat-cell *matCellDef="let row">
              @if (row.ImageGallery?.length) {
                <img [src]="row.ImageGallery[0].ImageUrl" alt="Wine Image" class="thumbnail">
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="6">Keine Daten gefunden für "{{input.value}}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" aria-label="Select page of awards"></mat-paginator>
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
      z-index: 1;
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
    table {
      width: 100%;
    }
    @media (max-width: 768px) {
      /* Hide some columns on mobile */
      .mat-column-Category, .mat-column-Image {
        display: none;
      }
    }
  `]
})
export default class WineAwardsComponent implements OnInit {
  private apiService = inject(ApiService);

  displayedColumns: string[] = ['Year', 'Awardname', 'Winnername', 'Wine', 'Category', 'Image'];
  dataSource = new MatTableDataSource<WineAward>();
  isLoading = signal<boolean>(true);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    // We load a large chunk for client-side filtering/sorting demo
    this.apiService.getWineAwards(1, 200).subscribe({
      next: (res) => {
        this.dataSource.data = res.Items;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading.set(false);
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
