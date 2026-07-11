export type DensityScoringInput = { source: HTMLCanvasElement; crop?: { x:number; y:number; width:number; height:number } };
export type DensityScoringResult = { rawDensityRatio:number; brightness:number; blur:number; contrast:number; confidence:number; algorithmVersion:string };
export interface DensityScorer { score(input:DensityScoringInput):Promise<DensityScoringResult>; }
