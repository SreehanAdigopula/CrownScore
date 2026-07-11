import { NextResponse } from "next/server"; 
export async function POST(request:Request){ const requireFirebase=process.env.REQUIRE_FIREBASE_AUTH==="true"; if(!requireFirebase)return NextResponse.json({success:true,data:{uid:"local-guest",isAnonymous:true,provider:"LOCAL_GUEST"}}); const {verifyBearerToken}=await import("@/server/firebase/admin"); const decoded=await verifyBearerToken(request); return NextResponse.json({success:true,data:{uid:decoded.uid,isAnonymous:decoded.firebase.sign_in_provider==="anonymous",provider:"FIREBASE"}}); }
export const GET=POST;
