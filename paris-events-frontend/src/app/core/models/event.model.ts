export interface EventRequest {
  title: string;
  tags: string;
  booking: string;
  is_indoor: number;
  pets_allowed: number;
  lat: number;
  lon: number;
  is_paris: boolean;
  zipcode: string;
  sess_day: string;
  sess_hour: number;
  session_duration: number;
}

export interface PricePrediction {
  prediction: 'free' | 'paid';
  confidence: number;
  model: string;
  version: string;
  latency_ms: number;
}

export interface AudiencePrediction {
  prediction: string;
  confidence: number;
  probabilities: { [key: string]: number };
  model: string;
  version: string;
  latency_ms: number;
}

export interface CombinedPrediction {
  price: {
    prediction: 'free' | 'paid';
    confidence: number;
    model: string;
  };
  audience: {
    prediction: string;
    confidence: number;
    probabilities: { [key: string]: number };
    model: string;
  };
  version: string;
  latency_ms: number;
}

export interface SchemaField {
  type: string;
  description: string;
}

export interface ApiSchema {
  required_fields: { [key: string]: SchemaField };
  example: any;
  notes: { [key: string]: string };
}
