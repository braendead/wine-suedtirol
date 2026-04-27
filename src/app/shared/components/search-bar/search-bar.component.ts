import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatAutocompleteModule],
  template: `
    <div class="search-container">
      <mat-icon class="search-icon">search</mat-icon>

      <input
        class="search-input"
        placeholder="Nach Kellerei suchen..."
        [(ngModel)]="searchTerm"
        (ngModelChange)="onTyping()"
        (keyup.enter)="onSearch()"
        [matAutocomplete]="auto"
      >

      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event)">
        @for (option of filteredOptions; track option) {
          <mat-option [value]="option">
            {{ option }}
          </mat-option>
        }
      </mat-autocomplete>

      @if (searchTerm) {
        <mat-icon class="clear-icon" (click)="clearSearch()">close</mat-icon>
      }
    </div>
  `,
  styles: [`
    .search-container {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50px;
      padding: 4px 16px;
      width: 100%;
      max-width: 400px;
      height: 40px;
      box-sizing: border-box;
      transition: all 0.3s ease;
    }

    .search-container:focus-within {
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .search-container:focus-within .search-icon,
    .search-container:focus-within .search-input {
      color: #9e1b1d;
    }

    .search-container:focus-within .search-input::placeholder {
      color: #888;
    }

    .search-icon {
      color: white;
      font-size: 20px;
      height: 20px;
      width: 20px;
      margin-right: 8px;
      transition: color 0.3s ease;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      color: white;
      font-size: 15px;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }

    .clear-icon {
      color: #888;
      font-size: 18px;
      height: 18px;
      width: 18px;
      cursor: pointer;
      margin-left: 8px;
      transition: color 0.2s ease;
    }

    .clear-icon:hover {
      color: #333;
    }
  `]
})
export class SharedSearchBarComponent {
  @Input() allOptions: string[] = [];
  @Output() search = new EventEmitter<string>();

  searchTerm = '';
  filteredOptions: string[] = [];

  onTyping() {
    this.filterData();
  }

  filterData() {
    if (!this.searchTerm) {
      this.filteredOptions = [];
      return;
    }

    const lowerTerm = this.searchTerm.toLowerCase();
    this.filteredOptions = this.allOptions.filter(option =>
      option.toLowerCase().includes(lowerTerm)
    );
  }

  onSearch() {
    this.search.emit(this.searchTerm);
  }

  onOptionSelected(event: any) {
    this.searchTerm = event.option.value;
    this.search.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredOptions = [];
    this.search.emit(this.searchTerm);
  }
}
