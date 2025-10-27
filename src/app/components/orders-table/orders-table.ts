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

export class OrdersTableComponent implements OnInit, AfterViewInit {
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

  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchControl.setValue(params['search'], { emitEvent: false });
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.applyFilter(value || '');
      this.updateUrl();
    });

    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.dataSource.data = orders;
        this.loading.set(false);

        const searchParam = this.route.snapshot.queryParams['search'];
        if (searchParam) {
          this.dataSource.filter = searchParam.trim().toLowerCase();
        }

        setTimeout(() => {
          this.assignPaginatorAndSort();

          const pageIndex = this.route.snapshot.queryParams['page'];
          const pageSize = this.route.snapshot.queryParams['pageSize'];

          if (this.paginator && pageIndex !== undefined) {
            this.paginator.pageIndex = parseInt(pageIndex, 10);
          }
          if (this.paginator && pageSize !== undefined) {
            this.paginator.pageSize = parseInt(pageSize, 10);
          }

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
    if (this.dataSource.data.length > 0) {
      this.assignPaginatorAndSort();
    }
  }

  private assignPaginatorAndSort(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;

      this.paginator.page.subscribe((event: PageEvent) => {
        this.updateUrl();
      });
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;

      this.sort.sortChange.subscribe((sort: Sort) => {
        this.updateUrl();
      });
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private updateUrl(): void {
    const queryParams: any = {};

    const searchValue = this.searchControl.value?.trim();
    if (searchValue) {
      queryParams.search = searchValue;
    }

    if (this.paginator) {
      if (this.paginator.pageIndex !== 0) {
        queryParams.page = this.paginator.pageIndex;
      }
      if (this.paginator.pageSize !== 25) {
        queryParams.pageSize = this.paginator.pageSize;
      }
    }

    if (this.sort && this.sort.active && this.sort.direction) {
      queryParams.sortActive = this.sort.active;
      queryParams.sortDirection = this.sort.direction;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  toggleColumn(columnId: string): void {
    const column = this.allColumns.find(col => col.id === columnId);
    if (column) {
      column.visible = !column.visible;
      this.displayedColumns = this.allColumns
        .filter(col => col.visible)
        .map(col => col.id);
    }
  }

  getDuration(order: Order): number | null {
    if (order.durationMinutes) {
      return order.durationMinutes;
    }
  
    if (order.eta && order.createdAt) {
      return (new Date(order.eta).getTime() - new Date(order.createdAt).getTime()) / 60000;
    }
  
    return null;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'queued': return 'status-queued';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  selectOrder(order: Order): void {
    if (this.selectedOrder() === order) {
      this.selectedOrder.set(null);
    } else {
      this.selectedOrder.set(order);
    }
  }

  closeDetails(): void {
    this.selectedOrder.set(null);
  }
}
