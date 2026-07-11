import { NextResponse } from "next/server"; import { z } from "zod"; import { createDemoDashboard } from "@/server/demo/demo-data";
const schema=z.object({scenario:z.enum(["healthy","shedding","adherence","safety"]).default("healthy")});
export async function POST(request:Request){ if(process.env.DEMO_MODE==="false")return NextResponse.json({success:false,error:{code:"DEMO_DISABLED",message:"Demo mode is disabled."}},{status:403}); const input=schema.parse(await request.json()); return NextResponse.json({success:true,data:createDemoDashboard(input.scenario)}); }
