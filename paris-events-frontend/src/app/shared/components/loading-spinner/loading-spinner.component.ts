import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-12">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-paris-blue/20 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-t-paris-blue border-r-gold rounded-full animate-spin"></div>
      </div>
      <p class="text-white/50 text-sm font-medium animate-pulse">Analyzing cultural signals...</p>
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {}
