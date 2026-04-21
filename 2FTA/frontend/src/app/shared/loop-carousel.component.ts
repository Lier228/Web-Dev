import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, TemplateRef } from '@angular/core';

interface RenderedSlide {
  key: string;
  sourceIndex: number;
  value: unknown;
}

@Component({
  selector: 'app-loop-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loop-carousel" [attr.aria-label]="ariaLabel">
      <button class="loop-arrow" type="button" (click)="moveBackward()" [disabled]="!canLoop()">
        <span>&lsaquo;</span>
      </button>

      <div class="loop-window">
        <div
          class="loop-track"
          [style.gap.px]="gap"
          [style.transform]="trackTransform()"
          [style.transition]="trackTransition()"
          (transitionend)="handleTransitionEnd()"
        >
          <div
            class="loop-slide"
            *ngFor="let item of renderedSlides; trackBy: trackByKey"
            [style.minWidth.px]="itemWidth"
            [style.maxWidth.px]="itemWidth"
          >
            <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item.value, index: item.sourceIndex }"></ng-container>
          </div>
        </div>
      </div>

      <button class="loop-arrow" type="button" (click)="moveForward()" [disabled]="!canLoop()">
        <span>&rsaquo;</span>
      </button>
    </div>
  `,
  styles: [
    `
      .loop-carousel {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr) 44px;
        gap: 10px;
        align-items: center;
      }

      .loop-window {
        min-width: 0;
        overflow: hidden;
      }

      .loop-track {
        display: flex;
        align-items: stretch;
        will-change: transform;
      }

      .loop-slide {
        flex: 0 0 auto;
      }

      .loop-arrow {
        width: 44px;
        height: 44px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
        color: var(--text);
        cursor: pointer;
        font-size: 1.6rem;
        line-height: 1;
      }

      .loop-arrow:disabled {
        opacity: 0.35;
        cursor: default;
      }

      @media (max-width: 720px) {
        .loop-carousel {
          grid-template-columns: 38px minmax(0, 1fr) 38px;
          gap: 8px;
        }

        .loop-arrow {
          width: 38px;
          height: 38px;
          border-radius: 10px;
        }
      }
    `,
  ],
})
export class LoopCarouselComponent implements OnChanges, OnDestroy {
  @Input() items: readonly unknown[] = [];
  @Input() itemTemplate!: TemplateRef<unknown>;
  @Input() itemWidth = 120;
  @Input() gap = 10;
  @Input() ariaLabel = 'carousel';

  renderedSlides: RenderedSlide[] = [];
  private currentIndex = 0;
  private transitionsEnabled = false;
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.rebuildSlides();
    }
  }

  ngOnDestroy(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
  }

  trackByKey(_: number, slide: RenderedSlide): string {
    return slide.key;
  }

  canLoop(): boolean {
    return this.items.length > 1;
  }

  moveBackward(): void {
    if (!this.canLoop()) {
      return;
    }
    this.transitionsEnabled = true;
    this.currentIndex -= 1;
  }

  moveForward(): void {
    if (!this.canLoop()) {
      return;
    }
    this.transitionsEnabled = true;
    this.currentIndex += 1;
  }

  trackTransform(): string {
    return `translateX(-${this.currentIndex * this.slideSpan()}px)`;
  }

  trackTransition(): string {
    return this.transitionsEnabled ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
  }

  handleTransitionEnd(): void {
    const length = this.items.length;
    if (length <= 1) {
      return;
    }

    if (this.currentIndex < length) {
      this.transitionsEnabled = false;
      this.currentIndex += length;
      return;
    }

    if (this.currentIndex >= length * 2) {
      this.transitionsEnabled = false;
      this.currentIndex -= length;
    }
  }

  private rebuildSlides(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    const source = Array.from(this.items ?? []);
    if (!source.length) {
      this.renderedSlides = [];
      this.currentIndex = 0;
      this.transitionsEnabled = false;
      return;
    }

    this.renderedSlides = [...source, ...source, ...source].map((value, index) => ({
      key: `slide-${index}-${index % source.length}`,
      sourceIndex: index % source.length,
      value,
    }));
    this.currentIndex = source.length;
    this.transitionsEnabled = false;
    this.resetTimer = setTimeout(() => {
      this.transitionsEnabled = true;
    }, 0);
  }

  private slideSpan(): number {
    return this.itemWidth + this.gap;
  }
}
