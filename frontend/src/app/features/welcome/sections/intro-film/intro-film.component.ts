import { Component, OnDestroy, computed, signal } from '@angular/core';
import { FILM_SCENES } from '../../data/film-scenes.data';

/* ────────────────────────────────────────────────────────────
   Intro film — a self-contained "short movie" that walks a new
   user through EarnLens. No external asset required: it plays a
   sequence of animated, cinematic scenes with a progress reel,
   play/pause and replay. Works fully offline.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-intro-film',
  standalone: true,
  templateUrl: './intro-film.component.html',
  styleUrl: './intro-film.component.css',
})
export class IntroFilmComponent implements OnDestroy {
  readonly scenes = FILM_SCENES;
  readonly sceneCount = FILM_SCENES.length;

  /** -1 means the film has not started (poster showing). */
  readonly current = signal(-1);
  readonly playing = signal(false);
  readonly finished = signal(false);

  readonly activeScene = computed(() => {
    const i = this.current();
    return i >= 0 && i < this.sceneCount ? this.scenes[i] : null;
  });
  readonly progress = computed(() => {
    const i = this.current();
    if (i < 0) return 0;
    return ((i + 1) / this.sceneCount) * 100;
  });

  private timer?: ReturnType<typeof setTimeout>;
  private readonly sceneMs = 3200;

  play(): void {
    if (this.playing()) return;
    this.finished.set(false);
    if (this.current() < 0 || this.current() >= this.sceneCount) {
      this.current.set(0);
    }
    this.playing.set(true);
    this.schedule();
  }

  pause(): void {
    this.playing.set(false);
    this.clearTimer();
  }

  toggle(): void {
    this.playing() ? this.pause() : this.play();
  }

  replay(): void {
    this.clearTimer();
    this.finished.set(false);
    this.current.set(0);
    this.playing.set(true);
    this.schedule();
  }

  jumpTo(index: number): void {
    this.clearTimer();
    this.finished.set(false);
    this.current.set(index);
    if (this.playing()) {
      this.schedule();
    }
  }

  private schedule(): void {
    this.clearTimer();
    this.timer = setTimeout(() => {
      const next = this.current() + 1;
      if (next >= this.sceneCount) {
        this.playing.set(false);
        this.finished.set(true);
        return;
      }
      this.current.set(next);
      this.schedule();
    }, this.sceneMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}
