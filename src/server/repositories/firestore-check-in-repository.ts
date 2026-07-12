import "server-only";
import { getAdminServices } from "@/server/firebase/admin";
import type { CheckInRepository } from "@/server/repositories/contracts";
import type { CheckInAnalysis, CoachOutput, ProgressPoint } from "@/server/domain/types";

const LIST_LIMIT = 200;

function toProgressPoint(analysis: CheckInAnalysis): ProgressPoint {
  return {
    id: analysis.id,
    capturedAt: analysis.capturedAt,
    treatmentWeek: analysis.treatmentWeek,
    healthScore: analysis.healthScore,
    safetyStatus: analysis.safetyStatus,
    adherenceRate: analysis.adherenceRate,
  };
}

export class FirestoreCheckInRepository implements CheckInRepository {
  private collection(userId: string) {
    return getAdminServices().db.collection("users").doc(userId).collection("checkIns");
  }

  async list(userId: string): Promise<ProgressPoint[]> {
    const snap = await this.collection(userId).orderBy("capturedAt", "asc").limit(LIST_LIMIT).get();
    return snap.docs
      .map((doc) => {
        const analysis = doc.data().analysis as CheckInAnalysis | undefined;
        return analysis ? toProgressPoint(analysis) : null;
      })
      .filter((item): item is ProgressPoint => item != null);
  }

  async get(userId: string, checkInId: string) {
    const doc = await this.collection(userId).doc(checkInId).collection("analysis").doc("result").get();
    return doc.exists ? (doc.data() as CheckInAnalysis) : null;
  }

  async saveAnalysis(userId: string, analysis: CheckInAnalysis, coach: CoachOutput) {
    const ref = this.collection(userId).doc(analysis.id);
    const batch = getAdminServices().db.batch();
    /* Embed analysis on the parent doc so list() does not need per-doc subcollection reads.
       Full payload also lives under analysis/result for get(). Detections omitted from parent to keep list docs small. */
    const listAnalysis = { ...analysis, detections: [] as CheckInAnalysis["detections"] };
    batch.set(
      ref,
      {
        id: analysis.id,
        userId,
        capturedAt: analysis.capturedAt,
        analysisStatus: "COMPLETED",
        isDemoData: analysis.isDemoData,
        updatedAt: new Date().toISOString(),
        analysis: listAnalysis,
        coach,
      },
      { merge: true },
    );
    batch.set(ref.collection("analysis").doc("result"), analysis);
    batch.set(ref.collection("coachSummary").doc("result"), coach);
    await batch.commit();
  }

  async delete(userId: string, checkInId: string) {
    await this.collection(userId).doc(checkInId).delete();
  }
}
