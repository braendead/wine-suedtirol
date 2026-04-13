import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Willkommen</h2>
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab label="Anmelden">
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>E-Mail</mat-label>
              <input matInput formControlName="email" type="email" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Passwort</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">
              Anmelden
            </button>
          </form>
        </mat-tab>

        <mat-tab label="Registrieren">
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>Benutzername</mat-label>
              <input matInput formControlName="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>E-Mail</mat-label>
              <input matInput formControlName="email" type="email" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Passwort</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid">
              Registrieren
            </button>
          </form>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
  `,
  styles: [`
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
    }
  `]
})
export class AuthDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<AuthDialogComponent>);

  hidePassword = true;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password);
      this.dialogRef.close();
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService.login(email, password);
      this.dialogRef.close();
    }
  }
}
