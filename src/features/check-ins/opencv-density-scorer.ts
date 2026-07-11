"use client";
import type { CV } from "@techstark/opencv-js";
import type { DensityScorer,DensityScoringInput,DensityScoringResult } from "@/features/check-ins/density-scorer";

let runtimePromise:Promise<CV>|null=null;
async function getOpenCv():Promise<CV>{ if(!runtimePromise){ runtimePromise=import("@techstark/opencv-js").then((module)=>{ const candidate=(module as unknown as {default?:CV}).default ?? globalThis.cv; if(!candidate)throw new Error("OpenCV.js did not initialize."); return candidate; }); } return runtimePromise; }

export class OpenCvDensityScorer implements DensityScorer {
  async score(input:DensityScoringInput):Promise<DensityScoringResult>{ const cv=await getOpenCv(); const source=cv.imread(input.source); const gray=new cv.Mat(); const binary=new cv.Mat(); const laplacian=new cv.Mat(); try { cv.cvtColor(source,gray,cv.COLOR_RGBA2GRAY); const mean=cv.mean(gray)[0]/255; cv.Laplacian(gray,laplacian,cv.CV_8U); const blur=Math.min(1,cv.mean(laplacian)[0]/24); cv.threshold(gray,binary,0,255,cv.THRESH_BINARY_INV+cv.THRESH_OTSU); const rawDensityRatio=cv.countNonZero(binary)/(binary.rows*binary.cols); const contrast=Math.min(1,Math.abs(mean-0.5)*1.4+0.26); const confidence=Number(Math.max(0,Math.min(1,blur*0.5+(1-Math.abs(mean-0.58))*0.3+contrast*0.2)).toFixed(2)); return {rawDensityRatio:Number(rawDensityRatio.toFixed(4)),brightness:Number(mean.toFixed(3)),blur:Number(blur.toFixed(3)),contrast:Number(contrast.toFixed(3)),confidence,algorithmVersion:"opencv-visible-hair-v1"}; } finally { source.delete(); gray.delete(); binary.delete(); laplacian.delete(); } }
}
