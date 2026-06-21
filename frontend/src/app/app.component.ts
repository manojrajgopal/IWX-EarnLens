import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';
import { DialogHostComponent } from './shared/ui/dialog/components/dialog-host/dialog-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, DialogHostComponent],
  template: `
    <router-outlet />
    <app-toast-container />
    <app-dialog-host />
  `,
})
export class AppComponent implements OnInit {
  private readonly theme = inject(ThemeService);

  ngOnInit(): void {
    this.theme.init();
  }
}
