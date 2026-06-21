import { Component, OnInit, input, output, signal } from '@angular/core';

/**
 * Full-screen cinematic transition played after a successful
 * login / registration, just before navigating to the dashboard.
 * Stages: warp-in → logo bloom → progress ring → greeting → wipe out.
 * Emits `done` when the sequence finishes so the host can navigate.
 */
@Component({
  selector: 'app-launch-transition',
  standalone: true,
  template: `
    <div class="lt" [attr.data-stage]="stage()">
      <div class="lt__warp"></div>
      <div class="lt__rays"></div>

      <div class="lt__core">
        <div class="lt__ring">
          <svg viewBox="0 0 120 120" class="lt__ring-svg">
            <circle class="lt__ring-track" cx="60" cy="60" r="54" />
            <circle class="lt__ring-progress" cx="60" cy="60" r="54" />
          </svg>
          <span class="lt__mark">◆</span>
        </div>

        <div class="lt__text">
          <span class="lt__hello">{{ greeting() }}</span>
          <span class="lt__name">{{ name() }}</span>
          <span class="lt__sub">{{ message() }}</span>
        </div>
      </div>

      <div class="lt__wipe"></div>
    </div>
  `,
  styleUrl: './launch-transition.component.css',
})
export class LaunchTransitionComponent implements OnInit {
  readonly name = input('');
  readonly greeting = input('Welcome back,');
  readonly message = input('Preparing your workspace…');
  readonly done = output<void>();

  /** 0 = enter, 1 = build, 2 = reveal/wipe */
  readonly stage = signal(0);

  ngOnInit(): void {
    // Sequence the cinematic stages.
    setTimeout(() => this.stage.set(1), 60);
    setTimeout(() => this.stage.set(2), 1700);
    setTimeout(() => this.done.emit(), 2400);
  }
}
