import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CombinedPrediction, ApiSchema, EventRequest } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getSchema(): Observable<ApiSchema> {
    return this.http.get<ApiSchema>(`${this.apiUrl}/schema`);
  }

  predictBoth(event: EventRequest): Observable<CombinedPrediction> {
    return this.http.post<CombinedPrediction>(`${this.apiUrl}/predict/both`, event);
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
