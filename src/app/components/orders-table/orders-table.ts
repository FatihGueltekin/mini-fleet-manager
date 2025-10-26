import { Component, OnInit, ViewChild, AfterViewInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrdersService, Order } from '../../services/orders';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-orders-table',
  templateUrl: './orders-table.html',
  styleUrls: ['./orders-table.css'],
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', opacity: '0' })),
      state('expanded', style({ height: '*', opacity: '1' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
  ]
})

/**
 * Komponente zur Anzeige und Verwaltung der Auftrags-Tabelle.
 * Bietet Sortierung, Filterung und Pagination mit URL-State Management.
 */
export class OrdersTableComponent implements OnInit, AfterViewInit {
  // Verfügbare Spalten mit Labels
  allColumns = [
    { id: 'id', label: 'ID', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'priority', label: 'Priorität', visible: true },
    { id: 'source', label: 'Quelle', visible: true },
    { id: 'target', label: 'Ziel', visible: true },
    { id: 'vehicleId', label: 'Fahrzeug', visible: true },
    { id: 'createdAt', label: 'Erstellt am', visible: true },
    { id: 'eta', label: 'ETA', visible: true },
    { id: 'duration', label: 'Dauer (min)', visible: true },
  ];

  displayedColumns: string[] = ['id', 'status', 'priority', 'source', 'target', 'vehicleId', 'createdAt', 'eta', 'duration'];

  dataSource = new MatTableDataSource<Order>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedOrder = signal<Order | null>(null);

  // Reactive Form Control für Filter
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // URL-Parameter auslesen und anwenden
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchControl.setValue(params['search'], { emitEvent: false });
      }
    });

    // Reactive Form: Filter mit Debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.applyFilter(value || '');
      this.updateUrl();
    });

    // Daten laden
    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.dataSource.data = orders;
        this.loading.set(false);

        // URL-Filter anwenden falls vorhanden
        const searchParam = this.route.snapshot.queryParams['search'];
        if (searchParam) {
          this.dataSource.filter = searchParam.trim().toLowerCase();
        }

        // WICHTIG: Paginator/Sort NACH dem Laden der Daten zuweisen
        setTimeout(() => {
          this.assignPaginatorAndSort();

          // URL-Parameter für Pagination wiederherstellen
          const pageIndex = this.route.snapshot.queryParams['page'];
          const pageSize = this.route.snapshot.queryParams['pageSize'];

          if (this.paginator && pageIndex !== undefined) {
            this.paginator.pageIndex = parseInt(pageIndex, 10);
          }
          if (this.paginator && pageSize !== undefined) {
            this.paginator.pageSize = parseInt(pageSize, 10);
          }

          // URL-Parameter für Sortierung wiederherstellen
          const sortActive = this.route.snapshot.queryParams['sortActive'];
          const sortDirection = this.route.snapshot.queryParams['sortDirection'];

          if (this.sort && sortActive && sortDirection) {
            this.sort.active = sortActive;
            this.sort.direction = sortDirection as 'asc' | 'desc';
            this.sort.sortChange.emit({ active: sortActive, direction: sortDirection as 'asc' | 'desc' });
          }
        }, 0);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    // Falls Daten bereits geladen sind, zuweisen
    if (this.dataSource.data.length > 0) {
      this.assignPaginatorAndSort();
    }
  }

  /**
   * Weist Paginator und Sort dem DataSource zu und fügt Event Listener hinzu.
   */
  private assignPaginatorAndSort(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;

      // Event Listener für Pagination Changes
      this.paginator.page.subscribe((event: PageEvent) => {
        this.updateUrl();
      });
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;

      // Event Listener für Sort Changes
      this.sort.sortChange.subscribe((sort: Sort) => {
        this.updateUrl();
      });
    }
  }

  /**
   * Filtert die Tabelle basierend auf der Benutzereingabe.
   * Durchsucht alle Spalten nach dem Suchbegriff.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Aktualisiert die URL mit aktuellen Filter/Pagination/Sort Parametern.
   */
  private updateUrl(): void {
    const queryParams: any = {};

    // Filter (nur hinzufügen wenn nicht leer)
    const searchValue = this.searchControl.value?.trim();
    if (searchValue) {
      queryParams.search = searchValue;
    }

    // Pagination (nur wenn nicht Standardwerte)
    if (this.paginator) {
      // Nur hinzufügen wenn nicht auf erster Seite
      if (this.paginator.pageIndex !== 0) {
        queryParams.page = this.paginator.pageIndex;
      }
      // Nur hinzufügen wenn nicht default pageSize (25)
      if (this.paginator.pageSize !== 25) {
        queryParams.pageSize = this.paginator.pageSize;
      }
    }

    // Sortierung (nur wenn aktiv)
    if (this.sort && this.sort.active && this.sort.direction) {
      queryParams.sortActive = this.sort.active;
      queryParams.sortDirection = this.sort.direction;
    }

    // WICHTIG: replaceUrl verwenden statt queryParamsHandling: 'merge'
    // Damit werden alte Parameter entfernt
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true  // Ersetzt URL statt neue History Entry
    });
  }

  /**
   * Togglet die Sichtbarkeit einer Spalte.
   */
  toggleColumn(columnId: string): void {
    const column = this.allColumns.find(col => col.id === columnId);
    if (column) {
      column.visible = !column.visible;
      // Array neu berechnen, damit Angular die Änderung erkennt
      this.displayedColumns = this.allColumns
        .filter(col => col.visible)
        .map(col => col.id);
    }
  }

  /**
   * Berechnet die Dauer eines Auftrags in Minuten.
   * Nutzt entweder das vorhandene durationMinutes-Feld (für abgeschlossene Aufträge)
   * oder berechnet die Differenz zwischen createdAt und eta (für laufende Aufträge).
   * @param order Der Auftrag
   * @returns Dauer in Minuten oder null falls nicht berechenbar
   */
  getDuration(order: Order): number | null {
    // Wenn durationMinutes vorhanden ist (completed/failed Orders), nutze das
    if (order.durationMinutes) {
      return order.durationMinutes;
    }
  
    // Sonst berechne aus eta und createdAt (für laufende Orders)
    if (order.eta && order.createdAt) {
      return (new Date(order.eta).getTime() - new Date(order.createdAt).getTime()) / 60000;
    }
  
    // Falls beides nicht vorhanden ist, return null
    return null;
  }

  /**
   * Gibt die CSS-Klasse für die Status-Badge-Farbe zurück.
   * @param status Der Status des Auftrags
   * @returns CSS-Klassename für die Farbgebung
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'queued': return 'status-queued';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  /**
   * Wählt einen Auftrag aus und zeigt die Detailansicht.
   * Wenn derselbe Auftrag nochmal geklickt wird, wird die Detailansicht geschlossen (Toggle).
   * @param order Der ausgewählte Auftrag
   */
  selectOrder(order: Order): void {
    // Toggle: Wenn derselbe Auftrag geklickt wird, schließe die Details
    if (this.selectedOrder() === order) {
      this.selectedOrder.set(null);
    } else {
      this.selectedOrder.set(order);
    }
  }

  /**
   * Schließt die Detailansicht.
   */
  closeDetails(): void {
    this.selectedOrder.set(null);
  }
}
