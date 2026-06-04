export interface EmergencyInfo {
  police: string;
  ambulance: string;
  fire: string;
  note?: string;
}

export const EMERGENCY_NUMBERS: Record<string, EmergencyInfo> = {
  "United States": { police: "911", ambulance: "911", fire: "911" },
  "United Kingdom": { police: "999", ambulance: "999", fire: "999", note: "111 for non-emergencies" },
  "India": { police: "100", ambulance: "102", fire: "101", note: "112 is the single emergency number" },
  "Australia": { police: "000", ambulance: "000", fire: "000" },
  "Canada": { police: "911", ambulance: "911", fire: "911" },
  "Germany": { police: "110", ambulance: "112", fire: "112" },
  "France": { police: "17", ambulance: "15", fire: "18", note: "112 is the European emergency number" },
  "Japan": { police: "110", ambulance: "119", fire: "119" },
  "Brazil": { police: "190", ambulance: "192", fire: "193" },
  "Default": { police: "112", ambulance: "112", fire: "112", note: "International standard" }
};

export function getEmergencyInfo(country: string = "Default"): EmergencyInfo {
  return EMERGENCY_NUMBERS[country] || EMERGENCY_NUMBERS["Default"];
}
