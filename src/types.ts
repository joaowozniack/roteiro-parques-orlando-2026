export type Priority = 'essential' | 'high' | 'optional'
export type StepStatus = 'pending' | 'completed' | 'skipped' | 'later' | 'unavailable'
export interface Region { id: string; name: string }
export interface QueueStrategy { label: string; detail: string }
export interface Attraction { id: string; name: string; region: Region; priority: Priority; queue: QueueStrategy; tips: string[]; conditional?: string }
export interface ItineraryStep extends Attraction {
  number: number; kind: 'arrival' | 'attraction' | 'pause'; category: string;
  plannedTime?: string | null; positioning?: string;
  completionGroup?: string; countsTowardProgress?: boolean;
  scheduleNote?: string; displayNumber?: string;
  canMarkUnavailable?: boolean; repeatNote?: string; repeatLabel?: string;
  detailNotice?: string; detailWarning?: string;
}
export type ExtraGoalStatus = 'pending' | 'completed' | 'not_done'
export interface ExtraGoal {
  id: string; title: string; description: string; region: Region;
  steps: string[]; possibilities: string[]; conditions: string[];
  possibilitiesTitle?: string; officialLabel?: string;
  destinationParkId?: string; destinationLabel?: string; officialUrl?: string;
}
export interface PreparationTask { id: string; name: string; description?: string }
export interface PreparationGroup { id: string; name: string; tasks: PreparationTask[] }
export type FoodType = 'restaurant' | 'snack' | 'drink' | 'sweet'
export interface FoodOption {
  id: string; name: string; type: FoodType; additionalTypes?: FoodType[]; typeLabel?: string; description: string; region: Region;
  recommendation: string; price: string; note?: string;
}
export interface Park {
  id: string; name: string; shortName: string; resort: string; date?: string;
  description: string; accent: string; steps: ItineraryStep[];
  arrival?: string; opening?: string; closing?: string;
  arrivalLabel?: string; transport?: string; queueTip?: string;
  groupSize?: number; progressNote?: string; extraGoals?: ExtraGoal[];
  officialUrl?: string; passLabel?: string; queueAdvice?: string;
  preparation?: PreparationGroup[]; dining?: FoodOption[];
  priceNotice?: string;
  strategy?: { title: string; paragraphs: string[]; reminder: string };
  extras: { name: string; description: string; region?: Region; priority?: Priority }[];
  unavailable: { name: string; reason: string }[];
}
export interface ParkProgress { order: string[]; statuses: Record<string, StepStatus>; priorities: Record<string, Priority> }
export type LinkedParkId = 'islands-of-adventure' | 'magic-kingdom' | 'universal-studios' | 'epic-universe'
export type ActivityCategory = 'travel' | 'stay' | 'shopping' | 'outing' | 'park' | 'food' | 'event'
export interface ActivityFields { name: string; description?: string; time?: string; location?: string; category: ActivityCategory; notes?: string }
export interface TripActivity extends ActivityFields { id: string; linkedParkId?: LinkedParkId; optional?: boolean }
export interface TripDay { id: string; date: string; title: string; region: string; category: ActivityCategory; notes?: string; activities: TripActivity[] }
export interface GuideState {
  version: 1;
  parks: Record<string, ParkProgress>;
  preparation: Record<string, Record<string, boolean>>;
  dining: Record<string, Record<string, boolean>>;
  customTasks: Record<string, PreparationTask[]>;
  globalChecklist: { checked: Record<string, boolean>; customTasks: PreparationTask[] };
  extraGoals: Record<string, Record<string, ExtraGoalStatus>>;
}
