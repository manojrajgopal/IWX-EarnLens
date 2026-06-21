import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="shell">
      <app-header />
      <main class="main-scroll">
        <div class="page-content">
          <router-outlet />
        </div>
        <app-footer />
      </main>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
        background: var(--bg-page);
      }
      .main-scroll {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      .page-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 90rem;
        margin: 0 auto;
        padding: 2rem 1.5rem;
      }
      @media (min-width: 640px) {
        .page-content {
          padding: 2rem 2rem;
        }
      }
    `,
  ],
})
export class AppShellComponent {}
