// Interfaces
export interface HealthProfile {
  name: string;
  age: number;
  gender: string;
  clinicalHistory: string;
}

export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface HealthMetrics {
  heartRate: number;
  sleep: number; // in hours, e.g., 7.75
  steps: number;
  heartRateHistory: number[];
  sleepHistory: number[];
  stepsHistory: number[];
}

export interface AIHealthResult {
  score: number;
  status: string;
  analysis: string;
  recommendations: string[];
}

// Default values are empty/blank as requested
const DEFAULT_PROFILE: HealthProfile = {
  name: "",
  age: 0,
  gender: "",
  clinicalHistory: ""
};

const DEFAULT_APPOINTMENTS: Appointment[] = [];

const DEFAULT_MEDICATIONS: Medication[] = [];

const DEFAULT_METRICS: HealthMetrics = {
  heartRate: 72,
  sleep: 7.0,
  steps: 5000,
  heartRateHistory: [72, 72, 72, 72, 72, 72, 72, 72, 72],
  sleepHistory: [7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0],
  stepsHistory: [5000, 5000, 5000, 5000, 5000, 5000]
};

// In-Memory store for mock local data (no database)
let currentProfile: HealthProfile = { ...DEFAULT_PROFILE };
let currentAppointments: Appointment[] = [...DEFAULT_APPOINTMENTS];
let currentMedications: Medication[] = [...DEFAULT_MEDICATIONS];
let currentMetrics: HealthMetrics = { ...DEFAULT_METRICS };

// Profile APIs
export const getProfile = async (): Promise<HealthProfile> => {
  return currentProfile;
};

export const saveProfile = async (profile: HealthProfile): Promise<void> => {
  currentProfile = { ...profile };
};

// Appointments APIs (kept for typing, but functionally cleared)
export const getAppointments = async (): Promise<Appointment[]> => {
  return currentAppointments;
};

export const addAppointment = async (appt: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const newAppt: Appointment = {
    ...appt,
    id: Math.random().toString(36).substring(2, 9)
  };
  currentAppointments.push(newAppt);
  return newAppt;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  currentAppointments = currentAppointments.filter(a => a.id !== id);
};

// Medications APIs (kept for typing, but functionally cleared)
export const getMedications = async (): Promise<Medication[]> => {
  return currentMedications;
};

export const addMedication = async (med: Omit<Medication, 'id'>): Promise<Medication> => {
  const newMed: Medication = {
    ...med,
    id: Math.random().toString(36).substring(2, 9)
  };
  currentMedications.push(newMed);
  return newMed;
};

export const deleteMedication = async (id: string): Promise<void> => {
  currentMedications = currentMedications.filter(m => m.id !== id);
};

// Metrics APIs
export const getMetrics = async (): Promise<HealthMetrics> => {
  return currentMetrics;
};

export const saveMetrics = async (metrics: HealthMetrics): Promise<void> => {
  currentMetrics = { ...metrics };
};

