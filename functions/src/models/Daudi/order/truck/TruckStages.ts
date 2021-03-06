export enum TruckStages {
  'Created',
  'Processing',
  'Queued',
  'Loaded',
}

export const TruckStageIds = Object.keys(TruckStages).filter(key => isNaN(Number(TruckStages[key])));
export const TruckStageNames = Object.keys(TruckStages).filter(key => !isNaN(Number(TruckStages[key])));
