import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="ftr">
      <div class="ftr__inner">
        <!-- columns -->
        <div class="ftr__grid">
          <!-- brand -->
          <div class="ftr__col">
            <a routerLink="/app/dashboard" class="ftr__brand">
              <span class="ftr__brand-mark">◆</span>
              <span class="ftr__brand-name">EarnLens</span>
            </a>
            <p class="ftr__tagline">
              Premium personal income analytics — track, categorize and analyze every dollar you earn.
            </p>
          </div>

          <!-- product -->
          <div class="ftr__col">
            <h4 class="ftr__heading">Product</h4>
            <ul class="ftr__list">
              <li><a routerLink="/app/dashboard" class="ftr__link">Dashboard</a></li>
              <li><a routerLink="/app/analytics" class="ftr__link">Analytics</a></li>
              <li><a routerLink="/app/reports" class="ftr__link">Reports</a></li>
              <li><a routerLink="/app/income" class="ftr__link">Income</a></li>
              <li><a routerLink="/app/income/new" class="ftr__link">Add Income</a></li>
            </ul>
          </div>

          <!-- organize -->
          <div class="ftr__col">
            <h4 class="ftr__heading">Organize</h4>
            <ul class="ftr__list">
              <li><a routerLink="/app/categories" class="ftr__link">Categories</a></li>
              <li><a routerLink="/app/sources" class="ftr__link">Sources</a></li>
              <li><a routerLink="/app/tags" class="ftr__link">Tags</a></li>
            </ul>
          </div>

          <!-- account -->
          <div class="ftr__col">
            <h4 class="ftr__heading">Account</h4>
            <ul class="ftr__list">
              <li><a routerLink="/app/profile" class="ftr__link">Profile</a></li>
              <li><a routerLink="/app/settings" class="ftr__link">Settings</a></li>
              <li><a routerLink="/app/activity" class="ftr__link">Activity</a></li>
            </ul>
          </div>

          <!-- company -->
          <div class="ftr__col">
            <h4 class="ftr__heading">Company</h4>
            <ul class="ftr__list">
              <li><a routerLink="/app/about" class="ftr__link">About</a></li>
              <li><a routerLink="/app/contact" class="ftr__link">Contact</a></li>
            </ul>
          </div>
        </div>

        <!-- bottom bar -->
        <div class="ftr__bottom">
          <p class="ftr__copy">&copy; {{ year }} IWX &middot; EarnLens. All rights reserved.</p>
          <p class="ftr__made">Made with focus &amp; precision.</p>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
