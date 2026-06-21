import { Component, input, output } from '@angular/core';
import { AVATAR_OPTIONS, AvatarOption } from './avatar.config';

@Component({
  selector: 'app-avatar-picker',
  standalone: true,
  templateUrl: './avatar-picker.component.html',
  styleUrl: './avatar-picker.component.css',
})
export class AvatarPickerComponent {
  /** Currently selected avatar URL (highlights the matching tile). */
  readonly selected = input<string | null>(null);

  /** Emits the full URL of the avatar the user clicked. */
  readonly pick = output<string>();

  readonly avatars = AVATAR_OPTIONS;

  isActive(avatar: AvatarOption): boolean {
    return this.selected() === avatar.url;
  }

  select(avatar: AvatarOption): void {
    this.pick.emit(avatar.url);
  }
}
