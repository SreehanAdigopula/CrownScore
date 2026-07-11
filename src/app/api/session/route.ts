import { NextResponse } from "next/server";
export async function POST(request:Request){ const demoMode=process.env.DEMO_MODE!=="false"; if(demoMode)return NextResponse.json({success:true,data:{uid:"demo-guest",isAnonymous:true,provider:"LOCAL_DEMO"}}); const {verifyBearerToken}=await import("@/server/firebase/admin"); const decoded=await verifyBearerToken(request); return NextResponse.json({success:true,data:{uid:decoded.uid,isAnonymous:decoded.firebase.sign_in_provider==="anonymous",provider:"FIREBASE"}}); }
export const GET=POST;
