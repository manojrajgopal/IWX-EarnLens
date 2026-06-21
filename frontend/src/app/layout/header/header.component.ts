import { Component } from '@angular/core';
import { BrandComponent } from './components/brand/brand.component';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';
import { NavComponent } from './components/nav/nav.component';
import { SearchComponent } from './components/search/search.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';

/**
 * Application header — composes self-contained sub-components.
 * Layout: brand (left) · nav (centered) · search + user + mobile (right).
 * All navigation data lives in ./data/nav.data.ts.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    BrandComponent,
    NavComponent,
    SearchComponent,
    UserMenuComponent,
    MobileMenuComponent,
  ],
  template: `
    <header class="hdr">
      <div class="hdr__inner">
        <div class="hdr__left">
          <app-brand />
        </div>

        <div class="hdr__center">
          <app-nav />
        </div>

        <div class="hdr__right">
          <app-search />
          <app-user-menu />
          <app-mobile-menu />
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .hdr {
        position: sticky;
        top: 0;
        z-index: 100;
        background: color-mix(in srgb, var(--bg-surface) 88%, transparent);
        backdrop-filter: saturate(160%) blur(10px);
        border-bottom: 1px solid var(--border-color);
      }
      .hdr__inner {
        display: flex;
        align-items: center;
        gap: 1rem;
        height: 64px;
        padding: 0 1.5rem;
      }
      @media (min-width: 640px) {
        .hdr__inner {
          padding: 0 2.5rem;
        }
      }
      @media (min-width: 1280px) {
        .hdr__inner {
          padding: 0 4rem;
        }
      }
      @media (min-width: 1536px) {
        .hdr__inner {
          padding: 0 5vw;
        }
      }
      .hdr__left {
        flex: 1;
        display: flex;
        justify-content: flex-start;
      }
      .hdr__center {
        flex: 0 0 auto;
        display: flex;
        justify-content: center;
      }
      .hdr__right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
      }
    `,
  ],
})
export class HeaderComponent {}
