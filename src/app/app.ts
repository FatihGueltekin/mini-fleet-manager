import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrdersTableComponent } from './components/orders-table/orders-table';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OrdersTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('mini-fleet-manager');
}
