
export type MachineStatus = 'healthy' | 'warning' | 'critical';
export type MachineType = 'CNC Mill' | 'Industrial Pump' | 'Turbine Generator' | 'Conveyor Motor';
export type UserRole = 'admin' | 'engineer';

export interface SensorData {
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  operatingHours: number;
  timestamp: string;
}

export interface MaintenanceLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  notes: string;
}

export interface CostImpact {
  breakdownCost: number;
  preventiveCost: number;
  potentialSavings: number;
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  location: string;
  status: MachineStatus;
  failureProbability: number;
  remainingUsefulLife: number; // in hours
  suggestedSchedule?: string; // ISO string
  costImpact: CostImpact;
  sensorData: SensorData;
  history: SensorData[];
  logs: MaintenanceLog[];
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  type: 'threshold_exceeded' | 'failure_predicted' | 'maintenance_due';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MaintenanceRecommendation {
  summary: string;
  rootCause: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  steps: string[];
  partsNeeded: string[];
  googleSearchSources?: { title: string; uri: string }[];
}

export interface PredictionResult {
  probability: number;
  riskLevel: MachineStatus;
  contributingFactors: string[];
  remainingUsefulLife: number;
  suggestedSchedule: string;
  costImpact: CostImpact;
}
