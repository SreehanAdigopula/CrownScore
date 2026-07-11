import "server-only";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getAdminApp(){ if(getApps().length)return getApps()[0]; const projectId=process.env.FIREBASE_PROJECT_ID; const clientEmail=process.env.FIREBASE_CLIENT_EMAIL; const privateKey=process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n"); return initializeApp({ credential: projectId&&clientEmail&&privateKey?cert({projectId,clientEmail,privateKey}):applicationDefault(), projectId, storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }); }
export function getAdminServices(){ const app=getAdminApp(); return { auth:getAuth(app), db:getFirestore(app), storage:getStorage(app) }; }
export async function verifyBearerToken(request:Request){ const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,""); if(!token)throw new Error("Missing bearer token"); return getAdminServices().auth.verifyIdToken(token,true); }
