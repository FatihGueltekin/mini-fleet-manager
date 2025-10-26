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
  private apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

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
