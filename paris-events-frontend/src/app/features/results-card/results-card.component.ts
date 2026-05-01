import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CombinedPrediction } from '../../core/models/event.model';
import { ConfidenceBarComponent } from '../../shared/components/confidence-bar/confidence-bar.component';

@Component({
  selector: 'app-results-card',
  standalone: true,
  imports: [CommonModule, ConfidenceBarComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Price Prediction -->
      <div class="glass p-8 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-paris-blue/10 rounded-full blur-2xl group-hover:bg-paris-blue/20 transition-all"></div>
        
        <h3 class="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">Price Classification</h3>
        
        <div class="flex items-center justify-between mb-8">
          <div [class]="'text-5xl font-black tracking-tighter ' + (data.price.prediction === 'free' ? 'text-green-400' : 'text-red-400')">
            {{ data.price.prediction | uppercase }}
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-white/60 mb-1">{{ data.price.model }}</span>
            <span class="text-[10px] text-white/30 font-mono">v{{ data.version }}</span>
          </div>
        </div>

        <app-confidence-bar 
          label="Model Confidence" 
          [value]="data.price.confidence"
          [color]="data.price.prediction === 'free' ? '#4ade80' : '#f87171'">
        </app-confidence-bar>
        
        <p class="mt-6 text-sm text-white/50 italic">
          Predicted with a latency of {{ data.latency_ms | number:'1.1-1' }}ms
        </p>
      </div>

      <!-- Audience Prediction -->
      <div class="glass p-8 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all"></div>
        
        <h3 class="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">Target Audience</h3>
        
        <div class="flex items-center gap-4 mb-8">
          <div class="text-4xl">{{ getIcon(data.audience.prediction) }}</div>
          <div>
            <div class="text-3xl font-black tracking-tight text-white">{{ data.audience.prediction }}</div>
            <div class="text-[10px] text-white/30 uppercase font-bold tracking-widest">{{ data.audience.model }}</div>
          </div>
        </div>

        <!-- Probability Breakdown -->
        <div class="space-y-4">
          <div class="h-3 w-full bg-white/5 rounded-full flex overflow-hidden">
            @for (item of probabilityList; track item.label) {
              <div class="h-full transition-all duration-1000 ease-out"
                   [style.width.%]="item.value * 100"
                   [style.background-color]="item.color"
                   [title]="item.label + ': ' + (item.value | percent)">
              </div>
            }
          </div>

          <div class="grid grid-cols-1 gap-2">
            @for (item of probabilityList; track item.label) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" [style.background-color]="item.color"></div>
                  <span class="text-xs font-medium text-white/60">{{ item.label }}</span>
                </div>
                <span class="text-xs font-bold text-white/80">{{ item.value | percent:'1.1-1' }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ResultsCardComponent {
  @Input({ required: true }) data!: CombinedPrediction;

  probabilityList: { label: string, value: number, color: string }[] = [];

  ngOnChanges() {
    if (this.data) {
      const colors = ['#003189', '#FFD700', '#457B9D', '#1D3557', '#E63946'];
      this.probabilityList = Object.entries(this.data.audience.probabilities)
        .map(([label, value], i) => ({
          label,
          value,
          color: colors[i % colors.length]
        }))
        .sort((a, b) => b.value - a.value);
    }
  }

  getIcon(segment: string): string {
    const lower = segment.toLowerCase();
    if (lower.includes('kids') || lower.includes('family')) return '👨‍👩‍👧';
    if (lower.includes('adult')) return '👤';
    if (lower.includes('teen') || lower.includes('ado')) return '🧑';
    if (lower.includes('senior') || lower.includes('retraité')) return '👴';
    return '🌍';
  }
}
