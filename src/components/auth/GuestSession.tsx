"use client";
import { useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase/client";
import { GUEST_ID_KEY } from "@/lib/crownscore-client";
export function GuestSession(){ useEffect(()=>{ const client=getFirebaseClient(); if(!client){ if(!localStorage.getItem(GUEST_ID_KEY))localStorage.setItem(GUEST_ID_KEY,crypto.randomUUID()); return; } return onAuthStateChanged(client.auth,(user)=>{ if(!user)void signInAnonymously(client.auth); }); },[]); return null; }
