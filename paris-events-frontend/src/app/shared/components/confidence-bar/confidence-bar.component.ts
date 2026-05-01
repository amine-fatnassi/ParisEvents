import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confidence-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div class="flex justify-between items-end mb-1.5">
        <span class="text-xs font-semibold text-white/50 uppercase tracking-wider">{{ label }}</span>
        <span class="text-sm font-bold" [style.color]="color">{{ animatedValue() | number:'1.1-1' }}%</span>
      </div>
      <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div class="h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]"
             [style.width.%]="animatedValue()"
             [style.background-color]="color">
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConfidenceBarComponent implements OnInit {
  @Input() label: string = 'Confidence';
  @Input() value: number = 0;
  @Input() color: string = '#003189';

  animatedValue = signal(0);

  ngOnInit() {
    // Animate from 0 to actual value on load
    setTimeout(() => {
      this.animatedValue.set(this.value * 100);
    }, 100);
  }
}
