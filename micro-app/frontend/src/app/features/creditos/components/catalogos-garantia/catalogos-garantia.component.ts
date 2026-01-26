import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { GarantiaService } from '../../services/garantia.service';
import {
  TipoGarantiaCatalogo,
  TipoInmuebleCatalogo,
  TipoDocumentoCatalogo,
} from '@core/models/garantia.model';
import { CatalogoGarantiaDialogComponent, CatalogoType } from './catalogo-garantia-dialog.component';

@Component({
  selector: 'app-catalogos-garantia',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Catálogos de Garantías</h1>
      </div>

      <mat-tab-group animationDuration="200ms" (selectedTabChange)="onTabChange($event)">
        <!-- Tab Tipos de Garantía -->
        <mat-tab label="Tipos de Garantía">
          <ng-template matTabContent>
            <div class="tab-content">
              <div class="tab-header">
                <h2>Tipos de Garantía</h2>
                <button mat-fab color="primary" (click)="openDialog('tipo-garantia')" matTooltip="Nuevo tipo">
                  <mat-icon>add</mat-icon>
                </button>
              </div>

              @if (isLoadingTiposGarantia()) {
                <div class="loading">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
              } @else {
                <mat-card>
                  <mat-card-content>
                    <div class="table-container">
                      <table mat-table [dataSource]="tiposGarantia()" class="full-width">
                        <ng-container matColumnDef="codigo">
                          <th mat-header-cell *matHeaderCellDef>Código</th>
                          <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
                        </ng-container>

                        <ng-container matColumnDef="nombre">
                          <th mat-header-cell *matHeaderCellDef>Nombre</th>
                          <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                        </ng-container>

                        <ng-container matColumnDef="descripcion">
                          <th mat-header-cell *matHeaderCellDef class="hide-mobile">Descripción</th>
                          <td mat-cell *matCellDef="let item" class="hide-mobile">{{ item.descripcion || '-' }}</td>
                        </ng-container>

                        <ng-container matColumnDef="activo">
                          <th mat-header-cell *matHeaderCellDef>Estado</th>
                          <td mat-cell *matCellDef="let item">
                            <mat-chip-set>
                              <mat-chip [class.activo]="item.activo" [class.inactivo]="!item.activo">
                                {{ item.activo ? 'Activo' : 'Inactivo' }}
                              </mat-chip>
                            </mat-chip-set>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="acciones">
                          <th mat-header-cell *matHeaderCellDef>Acciones</th>
                          <td mat-cell *matCellDef="let item">
                            <button mat-icon-button color="primary" (click)="openDialog('tipo-garantia', item)" matTooltip="Editar">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="confirmDelete('tipo-garantia', item)" matTooltip="Eliminar">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                      </table>
                    </div>

                    @if (tiposGarantia().length === 0) {
                      <div class="empty">
                        <mat-icon>security</mat-icon>
                        <p>No hay tipos de garantía registrados</p>
                        <button mat-raised-button color="primary" (click)="openDialog('tipo-garantia')">
                          Agregar tipo de garantía
                        </button>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </ng-template>
        </mat-tab>

        <!-- Tab Tipos de Inmueble -->
        <mat-tab label="Tipos de Inmueble">
          <ng-template matTabContent>
            <div class="tab-content">
              <div class="tab-header">
                <h2>Tipos de Inmueble</h2>
                <button mat-fab color="primary" (click)="openDialog('tipo-inmueble')" matTooltip="Nuevo tipo">
                  <mat-icon>add</mat-icon>
                </button>
              </div>

              @if (isLoadingTiposInmueble()) {
                <div class="loading">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
              } @else {
                <mat-card>
                  <mat-card-content>
                    <div class="table-container">
                      <table mat-table [dataSource]="tiposInmueble()" class="full-width">
                        <ng-container matColumnDef="codigo">
                          <th mat-header-cell *matHeaderCellDef>Código</th>
                          <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
                        </ng-container>

                        <ng-container matColumnDef="nombre">
                          <th mat-header-cell *matHeaderCellDef>Nombre</th>
                          <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                        </ng-container>

                        <ng-container matColumnDef="descripcion">
                          <th mat-header-cell *matHeaderCellDef class="hide-mobile">Descripción</th>
                          <td mat-cell *matCellDef="let item" class="hide-mobile">{{ item.descripcion || '-' }}</td>
                        </ng-container>

                        <ng-container matColumnDef="activo">
                          <th mat-header-cell *matHeaderCellDef>Estado</th>
                          <td mat-cell *matCellDef="let item">
                            <mat-chip-set>
                              <mat-chip [class.activo]="item.activo" [class.inactivo]="!item.activo">
                                {{ item.activo ? 'Activo' : 'Inactivo' }}
                              </mat-chip>
                            </mat-chip-set>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="acciones">
                          <th mat-header-cell *matHeaderCellDef>Acciones</th>
                          <td mat-cell *matCellDef="let item">
                            <button mat-icon-button color="primary" (click)="openDialog('tipo-inmueble', item)" matTooltip="Editar">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="confirmDelete('tipo-inmueble', item)" matTooltip="Eliminar">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                      </table>
                    </div>

                    @if (tiposInmueble().length === 0) {
                      <div class="empty">
                        <mat-icon>home</mat-icon>
                        <p>No hay tipos de inmueble registrados</p>
                        <button mat-raised-button color="primary" (click)="openDialog('tipo-inmueble')">
                          Agregar tipo de inmueble
                        </button>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </ng-template>
        </mat-tab>

        <!-- Tab Tipos de Documento -->
        <mat-tab label="Tipos de Documento">
          <ng-template matTabContent>
            <div class="tab-content">
              <div class="tab-header">
                <h2>Tipos de Documento</h2>
                <button mat-fab color="primary" (click)="openDialog('tipo-documento')" matTooltip="Nuevo tipo">
                  <mat-icon>add</mat-icon>
                </button>
              </div>

              @if (isLoadingTiposDocumento()) {
                <div class="loading">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
              } @else {
                <mat-card>
                  <mat-card-content>
                    <div class="table-container">
                      <table mat-table [dataSource]="tiposDocumento()" class="full-width">
                        <ng-container matColumnDef="codigo">
                          <th mat-header-cell *matHeaderCellDef>Código</th>
                          <td mat-cell *matCellDef="let item">{{ item.codigo }}</td>
                        </ng-container>

                        <ng-container matColumnDef="nombre">
                          <th mat-header-cell *matHeaderCellDef>Nombre</th>
                          <td mat-cell *matCellDef="let item">{{ item.nombre }}</td>
                        </ng-container>

                        <ng-container matColumnDef="descripcion">
                          <th mat-header-cell *matHeaderCellDef class="hide-mobile">Descripción</th>
                          <td mat-cell *matCellDef="let item" class="hide-mobile">{{ item.descripcion || '-' }}</td>
                        </ng-container>

                        <ng-container matColumnDef="activo">
                          <th mat-header-cell *matHeaderCellDef>Estado</th>
                          <td mat-cell *matCellDef="let item">
                            <mat-chip-set>
                              <mat-chip [class.activo]="item.activo" [class.inactivo]="!item.activo">
                                {{ item.activo ? 'Activo' : 'Inactivo' }}
                              </mat-chip>
                            </mat-chip-set>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="acciones">
                          <th mat-header-cell *matHeaderCellDef>Acciones</th>
                          <td mat-cell *matCellDef="let item">
                            <button mat-icon-button color="primary" (click)="openDialog('tipo-documento', item)" matTooltip="Editar">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="confirmDelete('tipo-documento', item)" matTooltip="Eliminar">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                      </table>
                    </div>

                    @if (tiposDocumento().length === 0) {
                      <div class="empty">
                        <mat-icon>description</mat-icon>
                        <p>No hay tipos de documento registrados</p>
                        <button mat-raised-button color="primary" (click)="openDialog('tipo-documento')">
                          Agregar tipo de documento
                        </button>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 16px;
        max-width: 100%;
        overflow-x: hidden;
      }
      .header {
        margin-bottom: 16px;
      }
      .header h1 {
        margin: 0;
      }
      .tab-content {
        padding-top: 16px;
      }
      .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tab-header h2 {
        margin: 0;
        font-size: 1.25rem;
      }
      .loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
      .table-container {
        width: 100%;
        overflow-x: auto;
      }
      .full-width {
        width: 100%;
        min-width: 400px;
      }
      .empty {
        text-align: center;
        padding: 48px 16px;
      }
      .empty mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
      }
      .empty p {
        color: #666;
        margin: 16px 0;
      }
      mat-chip.activo {
        background-color: #4caf50 !important;
        color: white !important;
      }
      mat-chip.inactivo {
        background-color: #9e9e9e !important;
        color: white !important;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .hide-mobile {
          display: none !important;
        }
        .tab-header h2 {
          font-size: 1rem;
        }
        .container {
          padding: 8px;
        }
        .tab-content {
          padding-top: 8px;
        }
      }
    `,
  ],
})
export class CatalogosGarantiaComponent implements OnInit {
  private service = inject(GarantiaService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tiposGarantia = signal<TipoGarantiaCatalogo[]>([]);
  tiposInmueble = signal<TipoInmuebleCatalogo[]>([]);
  tiposDocumento = signal<TipoDocumentoCatalogo[]>([]);

  isLoadingTiposGarantia = signal(true);
  isLoadingTiposInmueble = signal(true);
  isLoadingTiposDocumento = signal(true);

  displayedColumns = ['codigo', 'nombre', 'descripcion', 'activo', 'acciones'];

  private currentTab = 0;

  ngOnInit(): void {
    this.loadTiposGarantia();
  }

  onTabChange(event: any): void {
    this.currentTab = event.index;
    switch (event.index) {
      case 0:
        if (this.tiposGarantia().length === 0) {
          this.loadTiposGarantia();
        }
        break;
      case 1:
        if (this.tiposInmueble().length === 0) {
          this.loadTiposInmueble();
        }
        break;
      case 2:
        if (this.tiposDocumento().length === 0) {
          this.loadTiposDocumento();
        }
        break;
    }
  }

  loadTiposGarantia(): void {
    this.isLoadingTiposGarantia.set(true);
    this.service.getTiposGarantia().subscribe({
      next: (data) => {
        this.tiposGarantia.set(data);
        this.isLoadingTiposGarantia.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar tipos de garantía', 'Cerrar', { duration: 3000 });
        this.isLoadingTiposGarantia.set(false);
      },
    });
  }

  loadTiposInmueble(): void {
    this.isLoadingTiposInmueble.set(true);
    this.service.getTiposInmueble().subscribe({
      next: (data) => {
        this.tiposInmueble.set(data);
        this.isLoadingTiposInmueble.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar tipos de inmueble', 'Cerrar', { duration: 3000 });
        this.isLoadingTiposInmueble.set(false);
      },
    });
  }

  loadTiposDocumento(): void {
    this.isLoadingTiposDocumento.set(true);
    this.service.getTiposDocumento().subscribe({
      next: (data) => {
        this.tiposDocumento.set(data);
        this.isLoadingTiposDocumento.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar tipos de documento', 'Cerrar', { duration: 3000 });
        this.isLoadingTiposDocumento.set(false);
      },
    });
  }

  openDialog(type: CatalogoType, item?: any): void {
    const dialogRef = this.dialog.open(CatalogoGarantiaDialogComponent, {
      width: '450px',
      maxWidth: '95vw',
      data: { type, item },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (type) {
          case 'tipo-garantia':
            this.loadTiposGarantia();
            break;
          case 'tipo-inmueble':
            this.loadTiposInmueble();
            break;
          case 'tipo-documento':
            this.loadTiposDocumento();
            break;
        }
      }
    });
  }

  confirmDelete(type: CatalogoType, item: any): void {
    const typeLabel = this.getTypeLabel(type);
    if (confirm(`¿Está seguro de eliminar el ${typeLabel} "${item.nombre}"?`)) {
      let deleteObservable;
      switch (type) {
        case 'tipo-garantia':
          deleteObservable = this.service.deleteTipoGarantia(item.id);
          break;
        case 'tipo-inmueble':
          deleteObservable = this.service.deleteTipoInmueble(item.id);
          break;
        case 'tipo-documento':
          deleteObservable = this.service.deleteTipoDocumento(item.id);
          break;
      }

      deleteObservable.subscribe({
        next: () => {
          this.snackBar.open(`${typeLabel} eliminado exitosamente`, 'Cerrar', { duration: 3000 });
          switch (type) {
            case 'tipo-garantia':
              this.loadTiposGarantia();
              break;
            case 'tipo-inmueble':
              this.loadTiposInmueble();
              break;
            case 'tipo-documento':
              this.loadTiposDocumento();
              break;
          }
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || `Error al eliminar el ${typeLabel}`,
            'Cerrar',
            { duration: 3000 }
          );
        },
      });
    }
  }

  private getTypeLabel(type: CatalogoType): string {
    switch (type) {
      case 'tipo-garantia':
        return 'tipo de garantía';
      case 'tipo-inmueble':
        return 'tipo de inmueble';
      case 'tipo-documento':
        return 'tipo de documento';
    }
  }
}
