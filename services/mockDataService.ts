
import { Machine, MachineType, MachineStatus, SensorData, PredictionResult, CostImpact } from '../types';

const MACHINE_TYPES: MachineType[] = ['CNC Mill', 'Industrial Pump', 'Turbine Generator', 'Conveyor Motor'];

const generateInitialHistory = (type: MachineType, seedStatus: MachineStatus = 'healthy'): SensorData[] => {
  const history: SensorData[] = [];
  const baseTemp = type === 'CNC Mill' ? 65 : type === 'Turbine Generator' ? 85 : 55;
  
  const tempOffset = seedStatus === 'critical' ? 20 : seedStatus === 'warning' ? 10 : 0;
  const vibrationOffset = seedStatus === 'critical' ? 0.6 : seedStatus === 'warning' ? 0.3 : 0;

  for (let i = 20; i >= 0; i--) {
    const time = new Date(Date.now() - i * 60000).toISOString();
    history.push({
      temperature: baseTemp + tempOffset + Math.random() * 10 - 5,
      vibration: 0.1 + vibrationOffset + Math.random() * 0.4,
      pressure: 90 + Math.random() * 30,
      rpm: 1500 + Math.random() * 200,
      operatingHours: 1200 - i,
      timestamp: time
    });
  }
  return history;
};

export const predictFailure = (data: SensorData, type: MachineType): PredictionResult => {
  let score = 0;
  const factors: string[] = [];

  if (data.temperature > 85) {
    score += 35;
    factors.push('High Temperature Threshold Exceeded');
  }
  if (data.vibration > 0.8) {
    score += 40;
    factors.push('Excessive Vibration Detected');
  }
  if (data.pressure > 140) {
    score += 25;
    factors.push('Abnormal Pressure Variance');
  }
  if (data.rpm < 1200) {
    score += 15;
    factors.push('RPM Underperformance');
  }

  const probability = Math.min(score, 99);
  let riskLevel: MachineStatus = 'healthy';
  if (probability > 75) riskLevel = 'critical';
  else if (probability > 30) riskLevel = 'warning';

  let remainingUsefulLife = Math.max(0, Math.floor((100 - probability) * 5));
  if (riskLevel === 'critical') remainingUsefulLife = Math.max(1, Math.floor((100 - probability) * 0.5));
  
  const scheduleOffsetHours = Math.max(1, Math.floor(remainingUsefulLife * 0.7));
  const suggestedSchedule = new Date(Date.now() + scheduleOffsetHours * 3600000).toISOString();

  // Cost Impact Analysis Logic
  const baseValue = type === 'Turbine Generator' ? 500000 : type === 'CNC Mill' ? 150000 : 80000;
  const breakdownCost = Math.floor(baseValue * (probability / 100) * 2.5);
  const preventiveCost = Math.floor(baseValue * 0.15);
  const potentialSavings = Math.max(0, breakdownCost - preventiveCost);

  const costImpact: CostImpact = {
    breakdownCost,
    preventiveCost,
    potentialSavings
  };

  return { 
    probability, 
    riskLevel, 
    contributingFactors: factors,
    remainingUsefulLife,
    suggestedSchedule,
    costImpact
  };
};

const rawInitialData = [
  { id: 'MCH-001', name: 'Precision Mill X1', type: 'CNC Mill', location: 'Floor A', status: 'healthy' },
  { id: 'MCH-002', name: 'Pressure Pump P2', type: 'Industrial Pump', location: 'Line 2', status: 'warning' },
  { id: 'MCH-003', name: 'Gen Turbine T4', type: 'Turbine Generator', location: 'Sector 4', status: 'critical' },
  { id: 'MCH-004', name: 'Belt Motor B12', type: 'Conveyor Motor', location: 'Yard B', status: 'healthy' },
  { id: 'MCH-005', name: 'Lathe Pro Z5', type: 'CNC Mill', location: 'Floor A', status: 'warning' },
  { id: 'MCH-006', name: 'Coolant Pump CP1', type: 'Industrial Pump', location: 'East Wing', status: 'healthy' },
  { id: 'MCH-007', name: 'Aux Turbine T7', type: 'Turbine Generator', location: 'Backup St.', status: 'healthy' },
  { id: 'MCH-008', name: 'Sorter Motor S1', type: 'Conveyor Motor', location: 'Sorting 1', status: 'warning' },
  { id: 'MCH-009', name: 'Master Mill M1', type: 'CNC Mill', location: 'Floor B', status: 'critical' },
  { id: 'MCH-010', name: 'Supply Pump SP9', type: 'Industrial Pump', location: 'Cooling Twr', status: 'healthy' },
  { id: 'MCH-011', name: 'Sorter Motor S2', type: 'Conveyor Motor', location: 'Sorting 2', status: 'healthy' },
  { id: 'MCH-012', name: 'Precision Lathe L1', type: 'CNC Mill', location: 'Lab X', status: 'healthy' },
  { id: 'MCH-013', name: 'Grid Gen G2', type: 'Turbine Generator', location: 'Power Grid', status: 'warning' },
  { id: 'MCH-014', name: 'Flow Pump FP4', type: 'Industrial Pump', location: 'Dynamics Lab', status: 'healthy' },
  { id: 'MCH-015', name: 'Loader Belt LB1', type: 'Conveyor Motor', location: 'Loading Bay', status: 'warning' },
  { id: 'MCH-016', name: 'Tooling Mill TM6', type: 'CNC Mill', location: 'Tool Room', status: 'healthy' },
  { id: 'MCH-017', name: 'Waste Pump WP2', type: 'Industrial Pump', location: 'Water Trt.', status: 'warning' },
  { id: 'MCH-018', name: 'Main Substation T1', type: 'Turbine Generator', location: 'Main Sub.', status: 'healthy' },
  { id: 'MCH-019', name: 'Packager Belt PB3', type: 'Conveyor Motor', location: 'Packaging 1', status: 'healthy' },
  { id: 'MCH-020', name: 'Heavy Mill HM1', type: 'CNC Mill', location: 'Heavy Floor', status: 'warning' },
  { id: 'MCH-021', name: 'Hydraulic Pump HP7', type: 'Industrial Pump', location: 'Hydra St.', status: 'healthy' },
  { id: 'MCH-022', name: 'Warehouse Belt WB1', type: 'Conveyor Motor', location: 'Whouse A', status: 'healthy' },
  { id: 'MCH-023', name: 'Steam Turbine ST5', type: 'Turbine Generator', location: 'Steam Plant', status: 'warning' },
  { id: 'MCH-024', name: 'Proto Mill PM9', type: 'CNC Mill', location: 'Proto Wing', status: 'healthy' },
  { id: 'MCH-025', name: 'Fuel Pump FP1', type: 'Industrial Pump', location: 'Fuel Inj.', status: 'critical' }
];

export const INITIAL_MACHINES: Machine[] = rawInitialData.map(m => {
  const mType = m.type as MachineType;
  const mStatus = m.status as MachineStatus;
  const history = generateInitialHistory(mType, mStatus);
  const sensorData = history[20];
  const pred = predictFailure(sensorData, mType);

  return {
    id: m.id,
    name: m.name,
    type: mType,
    location: m.location,
    status: pred.riskLevel,
    failureProbability: pred.probability,
    remainingUsefulLife: pred.remainingUsefulLife,
    suggestedSchedule: pred.suggestedSchedule,
    costImpact: pred.costImpact,
    sensorData,
    history,
    logs: []
  };
});

export const getNextDataPoint = (current: SensorData, type: MachineType): SensorData => {
  return {
    temperature: Math.max(20, current.temperature + (Math.random() * 4 - 1.8)),
    vibration: Math.max(0.01, current.vibration + (Math.random() * 0.1 - 0.045)),
    pressure: Math.max(10, current.pressure + (Math.random() * 5 - 2.5)),
    rpm: current.rpm + (Math.random() * 20 - 10),
    operatingHours: current.operatingHours + 0.01,
    timestamp: new Date().toISOString()
  };
};
