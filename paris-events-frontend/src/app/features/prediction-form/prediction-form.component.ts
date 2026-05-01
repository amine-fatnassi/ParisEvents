import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PredictionService } from '../../core/services/prediction.service';
import { CombinedPrediction, ApiSchema, EventRequest } from '../../core/models/event.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ResultsCardComponent } from '../results-card/results-card.component';

@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ResultsCardComponent],
  template: `
    <div class="max-w-5xl mx-auto py-8 lg:py-12">
      <!-- Header -->
      <div class="text-center mb-16 animate-in fade-in zoom-in duration-1000">
        <h2 class="text-5xl lg:text-7xl font-black mb-6 tracking-tighter">
          Decode <span class="text-paris-blue">Paris</span> <br class="hidden lg:block">
          <span class="text-gold">Events</span>
        </h2>
        <p class="text-white/40 max-w-xl mx-auto text-lg">
          Powered by Random Forest & Logistic Regression. Predict audience segments and pricing instantly.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <!-- Form Column -->
        <div class="lg:col-span-5 glass p-8">
          <h3 class="text-xs font-bold uppercase tracking-widest text-white/30 mb-8">Event Data Input</h3>
          
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase text-white/40 px-1">Title</label>
              <input type="text" formControlName="title" placeholder="e.g. Nuit Blanche 2026" class="input-field">
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase text-white/40 px-1">Tags (semicolon separated)</label>
              <input type="text" formControlName="tags" placeholder="e.g. Concert;Loisirs;Gratuit" class="input-field">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase text-white/40 px-1">Booking</label>
                <select formControlName="booking" class="input-field appearance-none">
                  <option value="non">None</option>
                  <option value="conseillée">Recommended</option>
                  <option value="obligatoire">Required</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase text-white/40 px-1">Zipcode</label>
                <input type="text" formControlName="zipcode" placeholder="75001" class="input-field">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase text-white/40 px-1">Day</label>
                <select formControlName="sess_day" class="input-field appearance-none">
                  <option *ngFor="let d of days" [value]="d">{{ d }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase text-white/40 px-1">Hour (0-23)</label>
                <input type="number" formControlName="sess_hour" class="input-field">
              </div>
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; padding:1rem; background:rgba(255,255,255,0.04); border-radius:0.625rem; border:1px solid rgba(255,255,255,0.08);">
               <span style="font-size:0.8rem; font-weight:500; color:rgba(255,255,255,0.6);">Paris Location</span>
               <label style="position:relative; display:inline-block; width:2.75rem; height:1.5rem; cursor:pointer;">
                 <input type="checkbox" formControlName="is_paris" style="opacity:0; width:0; height:0; position:absolute;">
                 <span style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.1); border-radius:9999px; transition:0.3s;" [style.background]="form.get('is_paris')?.value ? '#003189' : 'rgba(255,255,255,0.1)'">
                   <span style="position:absolute; height:1.1rem; width:1.1rem; left:0.2rem; bottom:0.2rem; background:white; border-radius:50%; transition:0.3s;" [style.transform]="form.get('is_paris')?.value ? 'translateX(1.25rem)' : 'none'"></span>
                 </span>
               </label>
            </div>

            <button type="submit" 
                    [disabled]="form.invalid || loading()" 
                    class="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading()) {
                <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Processing...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Run Prediction
              }
            </button>
          </form>

          <button (click)="loadExample()" type="button" class="mt-4 w-full text-[10px] uppercase font-bold text-white/20 hover:text-gold transition-colors tracking-widest">
            Load Mock Dataset Row
          </button>
        </div>

        <!-- Result Column -->
        <div class="lg:col-span-7">
          @if (loading()) {
            <div class="h-full flex items-center justify-center">
              <app-loading-spinner></app-loading-spinner>
            </div>
          } @else if (result()) {
            <app-results-card [data]="result()!"></app-results-card>
          } @else {
            <div class="h-full min-h-[400px] glass border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center">
              <div class="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <svg class="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h4 class="text-white/40 font-bold uppercase tracking-widest text-xs mb-2">Awaiting Data</h4>
              <p class="text-white/20 text-sm max-w-[240px]">Fill the form and trigger the inference engine to see predictions.</p>
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class PredictionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);

  form!: FormGroup;
  loading = signal(false);
  result = signal<CombinedPrediction | null>(null);

  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      tags: ['Concert;Musique', Validators.required],
      booking: ['non', Validators.required],
      is_indoor: [1],
      pets_allowed: [0],
      lat: [48.8566],
      lon: [2.3522],
      is_paris: [true],
      zipcode: ['75011', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      sess_day: ['Saturday', Validators.required],
      sess_hour: [20, [Validators.required, Validators.min(0), Validators.max(23)]],
      session_duration: [2.0, Validators.required]
    });
  }

  loadExample() {
    this.form.patchValue({
      title: 'Festival Jazz à La Villette',
      tags: 'Concert;Musique;Festival',
      booking: 'obligatoire',
      zipcode: '75019',
      sess_day: 'Sunday',
      sess_hour: 16,
      session_duration: 3.5,
      is_paris: true
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.result.set(null);
    
    const val = this.form.value;
    const req: EventRequest = {
      ...val,
      is_indoor: val.is_indoor ? 1 : 0,
      pets_allowed: val.pets_allowed ? 1 : 0
    };

    this.predictionService.predictBoth(req).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        alert('Prediction failed. Is the backend API running?');
      }
    });
  }
}
