import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-button (click)="goBack()">
      <mat-icon>arrow_back</mat-icon>
      Zurück
    </button>
  `
})
export class SharedBackButtonComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
