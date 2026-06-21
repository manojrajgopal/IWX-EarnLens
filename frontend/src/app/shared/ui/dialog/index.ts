/**
 * ─────────────────────────────────────────────────────────────
 *  Cinematic Dialog system — public API
 * ─────────────────────────────────────────────────────────────
 *  import { DialogService } from '@app/shared/ui/dialog';
 *  Mount <app-dialog-host /> once at the app root.
 */

// Service
export { DialogService } from './services/dialog.service';

// Host (mount once at root)
export { DialogHostComponent } from './components/dialog-host/dialog-host.component';

// Building-block components (optional direct use)
export { DialogPanelComponent } from './components/dialog-panel/dialog-panel.component';
export { DialogIconComponent } from './components/dialog-icon/dialog-icon.component';
export { DialogActionsComponent } from './components/dialog-actions/dialog-actions.component';

// Config
export { DIALOG_THEME, primaryToneFor } from './config/dialog-theme.config';
export type { DialogTheme } from './config/dialog-theme.config';

// Tokens
export { DIALOG_ANIM } from './tokens/dialog-animation.tokens';

// Models
export type {
  DialogVariant,
  DialogButtonStyle,
  DialogButtonTone,
  DialogButton,
  DialogConfig,
  DialogInstance,
  ConfirmOptions,
  AlertOptions,
} from './models/dialog.model';
