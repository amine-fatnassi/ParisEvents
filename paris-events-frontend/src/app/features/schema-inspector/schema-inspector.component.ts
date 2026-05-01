import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService } from '../../core/services/prediction.service';
import { ApiSchema } from '../../core/models/event.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-schema-inspector',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto py-12 animate-in fade-in duration-1000">
      <div class="mb-12">
        <h2 class="text-4xl font-black mb-4 tracking-tight">API <span class="text-gold">Schema</span></h2>
        <p class="text-white/50">Explore the underlying data requirements for the Paris Events ML Models.</p>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (schema()) {
        <div class="space-y-8">
          <!-- Required Fields Table -->
          <div class="glass overflow-hidden">
            <div class="px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 class="font-bold uppercase tracking-widest text-xs text-gold">Input Specifications</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-white/5 text-white/40 font-bold">
                    <th class="px-6 py-4">Field Name</th>
                    <th class="px-6 py-4">Type</th>
                    <th class="px-6 py-4">Description</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  @for (field of fields(); track field.key) {
                    <tr class="hover:bg-white/[0.02] transition-colors">
                      <td class="px-6 py-4 font-mono text-paris-blue font-bold">{{ field.key }}</td>
                      <td class="px-6 py-4">
                        <span class="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase">{{ field.value.type }}</span>
                      </td>
                      <td class="px-6 py-4 text-white/60">{{ field.value.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Notes & Example -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass p-6">
              <h3 class="font-bold mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Developer Notes
              </h3>
              <ul class="space-y-3">
                @for (note of notes(); track note.key) {
                  <li class="text-sm flex gap-3">
                    <span class="text-paris-blue font-bold">→</span>
                    <span class="text-white/60"><span class="text-white font-medium">{{ note.key }}:</span> {{ note.value }}</span>
                  </li>
                }
              </ul>
            </div>

            <div class="glass p-6">
              <h3 class="font-bold mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-paris-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                JSON Example
              </h3>
              <pre class="text-[10px] font-mono p-4 bg-black/40 rounded-lg overflow-x-auto text-gold/80">{{ schema()?.example | json }}</pre>
            </div>
          </div>
        </div>
      } @else {
        <div class="glass p-12 text-center text-red-400">
          <p>Failed to load API schema. Is the backend running?</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class SchemaInspectorComponent implements OnInit {
  private predictionService = inject(PredictionService);

  schema = signal<ApiSchema | null>(null);
  loading = signal(true);
  
  fields = computed(() => {
    const s = this.schema();
    if (!s) return [];
    return Object.entries(s.required_fields).map(([key, value]) => ({ key, value }));
  });

  notes = computed(() => {
    const s = this.schema();
    if (!s) return [];
    return Object.entries(s.notes).map(([key, value]) => ({ key, value }));
  });

  ngOnInit() {
    this.predictionService.getSchema().subscribe({
      next: (res) => {
        this.schema.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
