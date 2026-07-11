"use client";
import { useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase/client";
export function GuestSession(){ useEffect(()=>{ const client=getFirebaseClient(); if(!client){ if(!localStorage.getItem("folliq-guest-id"))localStorage.setItem("folliq-guest-id",crypto.randomUUID()); return; } return onAuthStateChanged(client.auth,(user)=>{ if(!user)void signInAnonymously(client.auth); }); },[]); return null; }
