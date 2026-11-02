import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'alert'
  | 'arrow-right'
  | 'check'
  | 'check-circle'
  | 'copy'
  | 'credit-card'
  | 'grid'
  | 'help'
  | 'info'
  | 'lock'
  | 'message'
  | 'pix'
  | 'printer'
  | 'refresh'
  | 'shield'
  | 'x';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('alert') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        }
        @case ('check') {
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.5 2.5 2.5L16 9.5" />
        }
        @case ('copy') {
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        }
        @case ('credit-card') {
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        }
        @case ('grid') {
          <rect x="4" y="4" width="7" height="7" rx="1" fill="currentColor" stroke="none" />
          <rect x="13" y="4" width="7" height="7" rx="1" fill="currentColor" stroke="none" />
          <rect x="4" y="13" width="7" height="7" rx="1" fill="currentColor" stroke="none" />
          <rect x="13" y="13" width="7" height="7" rx="1" fill="currentColor" stroke="none" />
        }
        @case ('help') {
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.3-2.4 3.8" />
          <path d="M12 17h.01" />
        }
        @case ('info') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        }
        @case ('lock') {
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        }
        @case ('message') {
          <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 20 12Z" />
        }
        @case ('pix') {
          <path d="m12 3 9 9-9 9-9-9Z" />
        }
        @case ('printer') {
          <path d="M7 9V3h10v6" />
          <rect x="3" y="9" width="18" height="8" rx="2" />
          <path d="M7 14h10v7H7z" />
        }
        @case ('refresh') {
          <path d="M20 11a8 8 0 0 0-14.6-4.5L4 8" />
          <path d="M4 3v5h5" />
          <path d="M4 13a8 8 0 0 0 14.6 4.5L20 16" />
          <path d="M20 21v-5h-5" />
        }
        @case ('shield') {
          <path d="M12 3 19 6v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6Z" />
          <path d="m9 12 2 2 4-4" />
        }
        @case ('x') {
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        }
      }
    </svg>
  `,
  host: { class: 'inline-flex shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
