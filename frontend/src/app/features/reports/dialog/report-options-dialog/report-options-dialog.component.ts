import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PDF_THEMES,
  THEME_ORDER,
  REPORT_SECTIONS,
  defaultReportOptions,
  ReportOptions,
  ReportSectionId,
  ReportThemeId,
  ReportPageSize,
  ReportDensity,
} from '../../pdf';

export interface ReportDialogResult {
  options: ReportOptions;
  action: 'download' | 'preview';
}

/**
 * ─────────────────────────────────────────────────────────────
 *  Report options dialog — the cinematic preference console
 * ─────────────────────────────────────────────────────────────
 *  Collects every preference that drives the PDF: identity, date
 *  range, theme, paper, sections, ledger depth and cover note.
 */
@Component({
  selector: 'app-report-options-dialog',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-options-dialog.component.html',
  styleUrl: './report-options-dialog.component.css',
})
export class ReportOptionsDialogComponent {
  /** Controls visibility. */
  readonly open = input(false);
  /** Pre-fill values when the dialog opens. */
  readonly initial = input<Partial<ReportOptions>>({});

  readonly confirm = output<ReportDialogResult>();
  readonly cancel = output<void>();

  readonly themes = THEME_ORDER.map((id) => PDF_THEMES[id]);
  readonly sectionCatalog = REPORT_SECTIONS;

  readonly form = signal<ReportOptions>(defaultReportOptions());

  readonly activeTheme = computed(() => PDF_THEMES[this.form().themeId]);
  readonly enabledCount = computed(
    () => Object.values(this.form().sections).filter(Boolean).length,
  );

  constructor() {
    // Reset the working copy each time the dialog is (re)opened.
    let wasOpen = false;
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !wasOpen) {
        this.form.set(defaultReportOptions(this.initial()));
      }
      wasOpen = isOpen;
    });
  }

  patch(partial: Partial<ReportOptions>): void {
    this.form.update((f) => ({ ...f, ...partial }));
  }

  selectTheme(id: ReportThemeId): void {
    this.patch({ themeId: id });
  }

  setPageSize(size: ReportPageSize): void {
    this.patch({ pageSize: size });
  }

  setDensity(density: ReportDensity): void {
    this.patch({ density });
  }

  toggleSection(id: ReportSectionId): void {
    const meta = this.sectionCatalog.find((s) => s.id === id);
    if (meta?.locked) return;
    this.form.update((f) => ({
      ...f,
      sections: { ...f.sections, [id]: !f.sections[id] },
    }));
  }

  isSectionOn(id: ReportSectionId): boolean {
    return this.form().sections[id];
  }

  toggleLogo(): void {
    this.patch({ includeLogo: !this.form().includeLogo });
  }

  toggleCoverNote(): void {
    this.patch({ includeCoverNote: !this.form().includeCoverNote });
  }

  onLedgerLimit(value: string): void {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    this.patch({ ledgerLimit: n });
  }

  swatches(theme: (typeof PDF_THEMES)[ReportThemeId]): string[] {
    return [theme.palette.coverFrom, theme.palette.accent, theme.palette.accent2, theme.palette.coverGlow];
  }

  emit(action: 'download' | 'preview'): void {
    this.confirm.emit({ options: this.form(), action });
  }

  dismiss(): void {
    this.cancel.emit();
  }
}
