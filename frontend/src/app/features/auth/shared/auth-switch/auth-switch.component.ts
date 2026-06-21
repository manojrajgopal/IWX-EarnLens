import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Footer prompt that switches between login and register. */
@Component({
  selector: 'app-auth-switch',
  standalone: true,
  imports: [RouterLink],
  template: `
    <p class="as">
      {{ prompt() }}
      <a class="as__link" [routerLink]="link()">{{ action() }}</a>
    </p>
  `,
  styles: [
    `
      .as {
        text-align: center;
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin-top: 1.5rem;
        opacity: 0;
        animation: as-rise 0.6s ease 0.4s forwards;
      }
      .as__link {
        color: var(--accent);
        font-weight: 600;
        text-decoration: none;
        position: relative;
      }
      .as__link::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 0;
        height: 1.5px;
        background: var(--accent);
        transition: width 0.25s ease;
      }
      .as__link:hover::after {
        width: 100%;
      }
      @keyframes as-rise {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class AuthSwitchComponent {
  readonly prompt = input('');
  readonly action = input('');
  readonly link = input('/login');
}
