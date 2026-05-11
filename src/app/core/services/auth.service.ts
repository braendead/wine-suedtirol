import { Injectable, signal } from '@angular/core';

export interface User {
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('wine_user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(email: string, password?: string) {
    const user = { username: email.split('@')[0], email };
    this.currentUser.set(user);
    localStorage.setItem('wine_user', JSON.stringify(user));
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('wine_user');
  }

  updateUsername(newUsername: string) {
    const current = this.currentUser();
    if (current) {
      const updatedUser = { ...current, username: newUsername };
      this.currentUser.set(updatedUser);
      // Korrigiert: Nutzt jetzt denselben Key wie der Login
      localStorage.setItem('wine_user', JSON.stringify(updatedUser));
    }
  }
}
