export type Priority = 'essential' | 'high' | 'optional'
export type StepStatus = 'pending' | 'completed' | 'skipped' | 'later'
export interface Region { id: string; name: string }
export interface QueueStrategy { label: string; detail: string }
export interface Attraction { id: string; name: string; region: Region; priority: Priority; queue: QueueStrategy; tips: string[]; conditional?: string }
export interface ItineraryStep extends Attraction { number: number; kind: 'arrival' | 'attraction'; category: string }
export interface Park {
  id: string; name: string; shortName: string; resort: string; date?: string;
  description: string; accent: string; steps: ItineraryStep[];
  arrival?: string; opening?: string; closing?: string;
  officialUrl?: string; passLabel?: string; queueAdvice?: string;
  extras: { name: string; description: string }[];
  unavailable: { name: string; reason: string }[];
}
export interface ParkProgress { order: string[]; statuses: Record<string, StepStatus>; priorities: Record<string, Priority> }
export interface GuideState { version: 1; parks: Record<string, ParkProgress> }
