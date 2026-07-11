import type { CheckInAnalysis, CoachOutput, DashboardData } from "@/server/domain/types";
export interface CheckInRepository { list(userId:string):Promise<DashboardData["history"]>; get(userId:string,checkInId:string):Promise<CheckInAnalysis|null>; saveAnalysis(userId:string,analysis:CheckInAnalysis,coach:CoachOutput):Promise<void>; delete(userId:string,checkInId:string):Promise<void>; }
export interface AuditEventRepository { record(userId:string,event:{type:string;at:string;metadata?:Record<string,string|number|boolean>}):Promise<void>; }
