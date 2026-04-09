import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserItem, PaginatedUsers } from '../../../core/services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export default class UserManagementComponent implements OnInit {
  users = signal<PaginatedUsers | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  currentPage = signal(1);
  searchQuery = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getUsers(this.currentPage(), 10, this.searchQuery()).subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách người dùng');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page < 1 || (this.users() && page > this.users()!.totalPages)) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  toggleLockStatus(user: UserItem): void {
    if (user.status === 'ACTIVE') {
      if (confirm(`Bạn có chắc muốn khóa tài khoản ${user.email}?`)) {
        this.adminService.lockUser(user.id).subscribe({
          next: () => this.loadUsers(),
          error: () => alert('Lỗi khi khóa tài khoản')
        });
      }
    } else {
      if (confirm(`Bạn có chắc muốn mở khóa tài khoản ${user.email}?`)) {
        this.adminService.unlockUser(user.id).subscribe({
          next: () => this.loadUsers(),
          error: () => alert('Lỗi khi mở khóa tài khoản')
        });
      }
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
