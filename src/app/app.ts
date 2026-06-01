import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Navbar } from './shared/components/navbar/navbar';
import { Auth } from './core/services/auth';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Sidebar, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected isLoading = signal(false);
  private routerSub!: Subscription;
  private loadingTimer: any;

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Show loader immediately
        this.isLoading.set(true);
        // Clear any previous timer
        if (this.loadingTimer) clearTimeout(this.loadingTimer);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationError ||
        event instanceof NavigationCancel
      ) {
        // Keep loader visible for at least 2 seconds
        this.loadingTimer = setTimeout(() => {
          this.isLoading.set(false);
        }, 2000);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
  }
}
