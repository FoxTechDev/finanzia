import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuariosService, UsuarioExtendido } from '../../services/usuarios.service';
import { UsuarioFormDialogComponent } from '../usuario-form-dialog/usuario-form-dialog.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Gestión de Usuarios</h1>
        <button mat-fab color="primary" (click)="openDialog()" [disabled]="isLoading()">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando usuarios...</p>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="dataSource" class="full-width">
              <!-- Columna Email -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let usuario">
                  <strong>{{ usuario.email }}</strong>
                </td>
              </ng-container>

              <!-- Columna Nombre Completo -->
              <ng-container matColumnDef="nombreCompleto">
                <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
                <td mat-cell *matCellDef="let usuario">
                  {{ getNombreCompleto(usuario) }}
                </td>
              </ng-container>

              <!-- Columna Rol -->
              <ng-container matColumnDef="rol">
                <th mat-header-cell *matHeaderCellDef>Rol</th>
                <td mat-cell *matCellDef="let usuario">
                  @if (usuario.rol) {
                    <mat-chip [highlighted]="true">
                      {{ usuario.rol.nombre }}
                    </mat-chip>
                  } @else {
                    <span class="text-muted">Sin rol</span>
                  }
                </td>
              </ng-container>

              <!-- Columna Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let usuario">
                  @if (usuario.isActive) {
                    <mat-chip color="accent" [highlighted]="true">
                      <mat-icon>check_circle</mat-icon>
                      Activo
                    </mat-chip>
                  } @else {
                    <mat-chip>
                      <mat-icon>cancel</mat-icon>
                      Inactivo
                    </mat-chip>
                  }
                </td>
              </ng-container>

              <!-- Columna Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let usuario">
                  <button
                    mat-icon-button
                    color="primary"
                    (click)="openDialog(usuario)"
                    matTooltip="Editar usuario"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="accent"
                    (click)="openResetPasswordDialog(usuario)"
                    matTooltip="Restablecer contraseña"
                  >
                    <mat-icon>lock_reset</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    [color]="usuario.isActive ? 'warn' : 'accent'"
                    (click)="toggleActive(usuario)"
                    [matTooltip]="usuario.isActive ? 'Desactivar usuario' : 'Activar usuario'"
                  >
                    <mat-icon>{{ usuario.isActive ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            @if (dataSource.data.length === 0) {
              <div class="empty">
                <mat-icon>people_outline</mat-icon>
                <p>No hay usuarios registrados</p>
                <button mat-raised-button color="primary" (click)="openDialog()">
                  Crear primer usuario
                </button>
              </div>
            } @else {
              <mat-paginator
                [pageSizeOptions]="[5, 10, 25, 50]"
                showFirstLastButtons
                aria-label="Seleccionar página de usuarios"
              ></mat-paginator>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
    }

    .loading p {
      color: #666;
      margin: 0;
    }

    .full-width {
      width: 100%;
    }

    .empty {
      text-align: center;
      padding: 64px 16px;
    }

    .empty mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty p {
      color: #666;
      margin: 16px 0 24px;
      font-size: 16px;
    }

    .text-muted {
      color: #999;
      font-style: italic;
    }

    mat-chip {
      font-weight: 500;
    }

    mat-chip mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 8px;
      }

      .header h1 {
        font-size: 22px;
      }

      ::ng-deep .mat-mdc-table {
        font-size: 12px;
      }
    }
  `],
})
export class UsuariosListComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = signal(true);
  displayedColumns = ['email', 'nombreCompleto', 'rol', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<UsuarioExtendido>([]);

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadData(): void {
    this.isLoading.set(true);
    this.usuariosService.getAll().subscribe({
      next: (usuarios) => {
        this.dataSource.data = usuarios;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  openDialog(usuario?: UsuarioExtendido): void {
    const dialogRef = this.dialog.open(UsuarioFormDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: usuario || null,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  openResetPasswordDialog(usuario: UsuarioExtendido): void {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: usuario,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Contraseña restablecida exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  toggleActive(usuario: UsuarioExtendido): void {
    const newState = !usuario.isActive;
    const action = newState ? 'activar' : 'desactivar';

    this.usuariosService.toggleActive(usuario.id, newState).subscribe({
      next: () => {
        this.snackBar.open(`Usuario ${action}do exitosamente`, 'Cerrar', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        console.error(`Error al ${action} usuario:`, error);
        this.snackBar.open(`Error al ${action} usuario`, 'Cerrar', { duration: 3000 });
      },
    });
  }

  getNombreCompleto(usuario: UsuarioExtendido): string {
    const firstName = usuario.firstName?.trim() || '';
    const lastName = usuario.lastName?.trim() || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    return firstName || lastName || 'Sin nombre';
  }
}
