import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Order {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  target: string;
  vehicleId?: string;
  createdAt: string;
  eta?: string;
  durationMinutes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = this.isProduction() ? '/mini-fleet-manager/assets/orders.json' : 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  private isProduction(): boolean {
    return window.location.hostname.includes('github.io');
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl)
      .pipe(
        catchError(() => {
          return throwError(() => new Error('Fehler beim Laden der Orders'));
        })
      );
  }
}
