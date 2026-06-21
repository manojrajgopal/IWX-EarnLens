import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <!-- desktop sidebar -->
      <div class="hidden lg:block shrink-0">
        <app-sidebar />
      </div>

      <!-- mobile drawer -->
      @if (drawerOpen()) {
        <div class="drawer-overlay lg:hidden" (click)="drawerOpen.set(false)"></div>
        <div class="drawer lg:hidden">
          <app-sidebar (navigate)="drawerOpen.set(false)" />
        </div>
      }

      <div class="flex-1 flex flex-col min-w-0">
        <app-topbar (toggleSidebar)="drawerOpen.set(true)" />
        <main class="main-scroll">
          <div class="mx-auto w-full max-w-7xl px-5 py-7 sm:px-7">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        height: 100vh;
        overflow: hidden;
        background: var(--bg-page);
      }
      .main-scroll {
        flex: 1;
        overflow-y: auto;
      }
      .drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 50;
      }
      .drawer {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 60;
        animation: slide-in 0.2s ease;
      }
      @keyframes slide-in {
        from {
          transform: translateX(-100%);
        }
      }
    `,
  ],
})
export class AppShellComponent {
  readonly drawerOpen = signal(false);
}
