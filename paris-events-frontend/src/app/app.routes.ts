import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/prediction-form/prediction-form.component').then(m => m.PredictionFormComponent)
  },
  {
    path: 'schema',
    loadComponent: () => import('./features/schema-inspector/schema-inspector.component').then(m => m.SchemaInspectorComponent)
  }
];
