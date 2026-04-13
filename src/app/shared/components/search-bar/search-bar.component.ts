import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
      <input matInput placeholder="Suchen..." [(ngModel)]="searchTerm" (keyup.enter)="onSearch()">
      <button mat-icon-button matSuffix (click)="onSearch()">
        <mat-icon>search</mat-icon>
      </button>
    </mat-form-field>
  `,
  styles: [`
    .search-field {
      width: 100%;
      max-width: 400px;
    }
  `]
})
export class SharedSearchBarComponent {
  searchTerm = '';
  @Output() search = new EventEmitter<string>();

  onSearch() {
    this.search.emit(this.searchTerm);
  }
}
