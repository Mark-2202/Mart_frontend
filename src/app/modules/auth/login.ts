import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: false
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = false;
  errorMessage = '';
  isPasswordVisible = signal(false);

  ngOnInit(): void {
    // If we are on the client side and the user is already logged in, redirect them immediately
    if (!isPlatformServer(this.platformId) && this.auth.isLoggedIn()) {
      const user = this.auth.currentUser();
      if (user) {
        if (user.role === 'cashier') {
          this.router.navigate(['/pos']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible.update(visible => !visible);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.toastr.success(`Welcome back, ${user.name}!`, 'Login Successful');
        if (user.role === 'cashier') {
          this.router.navigate(['/pos']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Invalid email or password.';
        this.toastr.error(this.errorMessage, 'Login Failed');
      },
    });
  }
}
