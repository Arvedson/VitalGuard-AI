import { callGemini } from "@/lib/gemini";

export type HealthStatus = "GREEN" | "YELLOW" | "RED";
export type PatientSegment = "GENERAL" | "CHILD" | "ADULT" | "ELDERLY" | "CHRONIC_HYPERTENSION" | "CHRONIC_DIABETES" | "CHRONIC_OBESITY" | "PREGNANCY";

interface VitalsData {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  spo2?: number;
  glucose?: number;
  bmi?: number;
}

interface PatientProfileData {
  gender?: string | null;
  birthDate?: Date | string | null;
}

export function calculateHealthScore(
  vitals: VitalsData, 
  segment: PatientSegment = "GENERAL",
  profile?: PatientProfileData
) {
  let score = 100;
  let status: HealthStatus = "GREEN";
  const issues: string[] = [];

  // Calculate age if birthDate is provided
  let age = 0;
  if (profile?.birthDate) {
    const bd = new Date(profile.birthDate);
    const ageDifMs = Date.now() - bd.getTime();
    const ageDate = new Date(ageDifMs);
    age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // 1. Blood Pressure Logic
  if (vitals.systolicBP) {
    if (vitals.systolicBP > 180 || vitals.systolicBP < 80) {
      score -= 40;
      issues.push("Critical Blood Pressure");
      status = "RED";
    } else if (vitals.systolicBP > 140 || vitals.systolicBP < 90) {
      score -= 15;
      issues.push("Abnormal Blood Pressure");
      if (status === "GREEN") status = "YELLOW";
    }
  }

  // 2. Heart Rate Logic
  if (vitals.heartRate) {
    if (vitals.heartRate > 120 || vitals.heartRate < 40) {
      score -= 20;
      issues.push("Irregular Heart Rate");
      if (status !== "RED") status = "RED";
    } else if (vitals.heartRate > 100 || vitals.heartRate < 50) {
      score -= 10;
      if (status === "GREEN") status = "YELLOW";
    }
  }

  // 3. SpO2 Logic
  if (vitals.spo2) {
    if (vitals.spo2 < 90) {
      score -= 30;
      issues.push("Low Oxygen Saturation");
      status = "RED";
    } else if (vitals.spo2 < 95) {
      score -= 10;
      if (status === "GREEN") status = "YELLOW";
    }
  }

  // 4. Glucose Logic (Metabolic)
  if (vitals.glucose) {
    if (vitals.glucose > 200 || vitals.glucose < 60) {
      score -= 25;
      issues.push("Abnormal Glucose Levels");
      if (status !== "RED") status = "RED";
    } else if (vitals.glucose > 140) {
      score -= 10;
      if (status === "GREEN") status = "YELLOW";
    }
  }

  // Segment Specific Adjustments
  if (segment === "ELDERLY" || age > 65) {
    // More lenient on heart rate, stricter on BP
    if (vitals.systolicBP && vitals.systolicBP > 150) {
      score -= 5;
    }
  }

  // Gender specific tweaks (example: women have slightly different cardiovascular baselines theoretically, or specific flags)
  if (profile?.gender === "FEMALE" && vitals.heartRate && vitals.heartRate > 100) {
    issues.push("Elevated Heart Rate (Female Baseline)");
  }

  return {
    score: Math.max(0, score),
    status,
    issues,
    timestamp: new Date()
  };
}

export function getTemplateAIAdvice(score: number, status: HealthStatus, segment: PatientSegment, profile?: PatientProfileData) {
  const advices = [];
  
  // Calculate age for AI context
  let ageContext = "";
  if (profile?.birthDate) {
    const bd = new Date(profile.birthDate);
    const ageDifMs = Date.now() - bd.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    ageContext = ` for a ${age}-year-old ${profile.gender?.toLowerCase() || 'patient'}`;
  }
  
  if (status === "RED") {
    advices.push({
      id: "1",
      type: "insight" as const,
      content: `Immediate medical attention required. Your recent vitals are outside safe ranges${ageContext}.`
    });
    advices.push({
      id: "2",
      type: "prediction" as const,
      content: "High risk of adverse event if current trends continue.",
      trend: "up" as const
    });
    advices.push({
      id: "3",
      type: "prevention" as const,
      content: "Consult your doctor immediately. Do not attempt self-medication."
    });
  } else if (status === "YELLOW") {
    advices.push({
      id: "1",
      type: "insight" as const,
      content: `Your vitals show minor anomalies${ageContext}. Monitor closely over the next 24 hours.`
    });
    advices.push({
      id: "2",
      type: "prediction" as const,
      content: "Potential for escalation if triggers (stress, diet) are not managed.",
      trend: "stable" as const
    });
    advices.push({
      id: "3",
      type: "prevention" as const,
      content: "Maintain hydration and rest. Avoid high sodium intake."
    });
  } else {
    advices.push({
      id: "1",
      type: "insight" as const,
      content: `Your status is optimal${ageContext}. Continue your current health regimen.`
    });
    advices.push({
      id: "2",
      type: "prediction" as const,
      content: "Sustained stability expected with consistent maintenance.",
      trend: "stable" as const
    });
    advices.push({
      id: "3",
      type: "prevention" as const,
      content: "Regular exercise and balanced nutrition will help maintain this score."
    });
  }

  return advices;
}

export async function getRealAIAdvice(
  vitals: VitalsData,
  score: number,
  status: HealthStatus,
  segment: PatientSegment,
  profile?: PatientProfileData
) {
  let ageContext = "";
  if (profile?.birthDate) {
    const bd = new Date(profile.birthDate);
    const ageDifMs = Date.now() - bd.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    ageContext = `This is a ${age}-year-old ${profile.gender?.toLowerCase() || 'patient'}.`;
  }

  const prompt = `
You are an AI Health Assistant reviewing user vitals. 
CRITICAL RULES:
- IMPORTANT: You MUST generate your entire response (the content fields) in Spanish.
- You are an AI, NOT a doctor. You must not diagnose, prescribe, or provide definitive medical conclusions. 
- Maintain a supportive, personalized tone, speaking directly to the user in Spanish (e.g., "Tus métricas muestran...").
- Keep it extremely brief and easy to read.
- End your "prevention" advice by deferring to a real healthcare professional when appropriate.

Context:
User Segment: ${segment}
Health Score: ${score}/100
Status: ${status}
${ageContext}

Vitals:
Systolic BP: ${vitals.systolicBP || 'N/A'} mmHg
Diastolic BP: ${vitals.diastolicBP || 'N/A'} mmHg
Heart Rate: ${vitals.heartRate || 'N/A'} bpm
Respiratory Rate: ${vitals.respiratoryRate || 'N/A'} bpm
Temperature: ${vitals.temperature || 'N/A'} °C
SpO2: ${vitals.spo2 || 'N/A'} %
Glucose: ${vitals.glucose || 'N/A'} mg/dL

Based on these vitals, provide exactly 3 brief, user-friendly pieces of advice (insight, prediction, and prevention) IN SPANISH.
IMPORTANT: Return ONLY a valid JSON array of objects. Do not use markdown blocks like \`\`\`json. No other text.
Format precisely as:
[
  { "id": "1", "type": "insight", "content": "Un insight personalizado interpretando sus signos vitales de forma sencilla." },
  { "id": "2", "type": "prediction", "content": "Una predicción corta y no alarmista.", "trend": "up|down|stable" },
  { "id": "3", "type": "prevention", "content": "Un tip de bienestar accionable, incluyendo el recordatorio de consultar a su médico." }
]
  `.trim();

  try {
    const result = await callGemini(prompt);
    if (!result) throw new Error("No response from Gemini");

    let cleanResult = result.trim();
    if (cleanResult.startsWith("\`\`\`json")) cleanResult = cleanResult.replace(/\`\`\`json/g, "");
    if (cleanResult.startsWith("\`\`\`")) cleanResult = cleanResult.replace(/\`\`\`/g, "");
    cleanResult = cleanResult.trim();

    const parsed = JSON.parse(cleanResult);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error("Error parsing Gemini advice in health score:", error);
  }

  // Fallback to template if Gemini fails
  return getTemplateAIAdvice(score, status, segment, profile);
}
