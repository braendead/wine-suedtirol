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
    // Mock login state from localStorage
    const savedUser = localStorage.getItem('wine_user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(email: string, password?: string) {
    // Mock login
    const user = { username: email.split('@')[0], email };
    this.currentUser.set(user);
    localStorage.setItem('wine_user', JSON.stringify(user));
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('wine_user');
  }
}
