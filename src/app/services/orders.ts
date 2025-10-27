import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject } from 'rxjs';

export interface Order {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  target: string;
  vehicleId?: string;
  createdAt: string;
  eta?: string;  // Optional, weil completed/failed Orders kein eta haben
  durationMinutes?: number;  // Optional, nur bei completed/failed Orders
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  // Verwendet /mini-fleet-manager/assets/orders.json für Production, localhost:3000 für Development
  private apiUrl = this.isProduction() ? '/mini-fleet-manager/assets/orders.json' : 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  /**
   * Prüft ob die App in Production läuft (GitHub Pages)
   */
  private isProduction(): boolean {
    return window.location.hostname.includes('github.io');
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Fehler beim Laden der Orders', err);
          return throwError(() => new Error('Fehler beim Laden der Orders'));
        })
      );
  }
}
