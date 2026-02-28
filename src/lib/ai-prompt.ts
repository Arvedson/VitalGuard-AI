/**
 * AI Health Insight Prompt Builder
 *
 * Two separate prompts:
 * 1. buildPatientPrompt()  — Consumer-friendly wellness analysis (no medical jargon, legally safe)
 * 2. buildDoctorPrompt()   — Clinical assessment in medical language for the physician
 */

export interface InsightInput {
  patient: {
    name: string;
    age: number;
    gender: string;
    segment: string;
    heredity?: string | null;
    habits?: string | null;
    environment?: string | null;
  };
  latestVitals?: {
    systolicBP?: number | null;
    diastolicBP?: number | null;
    heartRate?: number | null;
    respiratoryRate?: number | null;
    temperature?: number | null;
    spo2?: number | null;
    glucose?: number | null;
    weight?: number | null;
    height?: number | null;
    bmi?: number | null;
  } | null;
  recentSymptoms?: {
    location: string;
    intensity: number;
    description?: string | null;
  }[];
  currentHealthScore?: {
    score: number;
    status: string;
  } | null;
  previousDiagnosis?: {
    healthSummary: string;
    predictions: any;
    alertLevel: string;
    timestamp: Date;
  } | null;
}

export interface InsightOutput {
  healthSummary: string;
  predictions: { title: string; detail: string; trend: "improving" | "stable" | "worsening" }[];
  habitImprovements: { category: string; suggestion: string; priority: "low" | "medium" | "high" }[];
  alertLevel: "LOW" | "MODERATE" | "HIGH";
  doctorNote: string;
}

export interface ClinicalOutput {
  clinicalSummary: string;
  differentialNotes: { consideration: string; rationale: string; priority: "low" | "moderate" | "high" }[];
  clinicalFlags: { metric: string; value: string; interpretation: string; action: string }[];
}

// ─────────────────────────────────────────────────────────────────────
// PATIENT PROMPT — Wellness language, no jargon, legally safe
// ─────────────────────────────────────────────────────────────────────
function buildVitalsBlock(v: InsightInput["latestVitals"]): string {
  if (!v) return "NO VITALS RECORDED YET.";
  return `LATEST VITAL SIGNS:
- Blood Pressure: ${v.systolicBP ?? "N/A"}/${v.diastolicBP ?? "N/A"} mmHg
- Heart Rate: ${v.heartRate ?? "N/A"} bpm
- Respiratory Rate: ${v.respiratoryRate ?? "N/A"} breaths/min
- Body Temperature: ${v.temperature ?? "N/A"} °C
- SpO2: ${v.spo2 ?? "N/A"}%
- Fasting Glucose: ${v.glucose ?? "N/A"} mg/dL
- Weight: ${v.weight ?? "N/A"} kg  |  Height: ${v.height ?? "N/A"} cm  |  BMI: ${v.bmi ?? "N/A"}`;
}

function buildSymptomsBlock(symptoms: InsightInput["recentSymptoms"]): string {
  if (!symptoms || symptoms.length === 0) return "NO SYMPTOMS REPORTED.";
  return `RECENT SYMPTOMS (last 5):\n${symptoms.map((s, i) => `${i + 1}. Location: ${s.location} | Intensity: ${s.intensity}/10${s.description ? ` | Notes: ${s.description}` : ""}`).join("\n")}`;
}

function buildPreviousBlock(prev: InsightInput["previousDiagnosis"]): string {
  if (!prev) return "FIRST ANALYSIS — no prior data available.";
  return `PREVIOUS ANALYSIS (${new Date(prev.timestamp).toLocaleDateString()}):
- Summary: ${prev.healthSummary}
- Alert Level was: ${prev.alertLevel}
- Previous Predictions: ${JSON.stringify(prev.predictions)}
Compare current state vs this previous analysis and identify changes in trends.`;
}

export function buildPatientPrompt(input: InsightInput): string {
  const { patient, latestVitals, recentSymptoms, currentHealthScore, previousDiagnosis } = input;

  return `You are a wellness analysis AI assistant on a health monitoring platform called VitalGuard AI.
You generate health INSIGHTS and lifestyle recommendations for patients to read.

ABSOLUTE RULES — FOLLOW EXACTLY:
- You are NOT a doctor. NEVER prescribe, recommend medications, or suggest diagnoses.
- Use warm, accessible language. No medical jargon.
- NEVER use words: "diagnosis", "prescribe", "disease", "pathology", "disorder", "treatment".
- Use instead: "wellness analysis", "health insight", "pattern", "trend", "we recommend talking to your doctor".
- If any vital signs are critically abnormal, set alertLevel to "HIGH" and recommend consulting a doctor.
- Suggestions must be general wellness only: exercise, sleep, hydration, stress reduction, nutrition.
- LANGUAGE RULE: You MUST GENERATE YOUR ENTIRE RESPONSE IN SPANISH (Español). Do NOT use English in the JSON output. Use Spanish for all generated text, titles, suggestions, and tips.

PATIENT PROFILE:
- Age: ${patient.age} years | Gender: ${patient.gender} | Segment: ${patient.segment}
${patient.heredity ? `- Family Background: ${patient.heredity}` : ""}
${patient.habits ? `- Current Habits: ${patient.habits}` : ""}
${patient.environment ? `- Living Environment: ${patient.environment}` : ""}

${buildVitalsBlock(latestVitals)}
${currentHealthScore ? `\nCURRENT WELLNESS SCORE: ${currentHealthScore.score.toFixed(1)}/100 (${currentHealthScore.status})` : ""}
${buildSymptomsBlock(recentSymptoms)}
${buildPreviousBlock(previousDiagnosis)}

Respond ONLY with a valid JSON object, no markdown fences:
{
  "healthSummary": "2-3 warm sentences summarizing the patient's current wellness.",
  "predictions": [
    { "title": "Short title", "detail": "1-2 accessible sentences about this trend", "trend": "improving|stable|worsening" }
  ],
  "habitImprovements": [
    { "category": "Category", "suggestion": "Specific, actionable general wellness tip", "priority": "low|medium|high" }
  ],
  "alertLevel": "LOW|MODERATE|HIGH",
  "doctorNote": "One-line summary of key clinical data points worth mentioning to the doctor."
}

Produce 2-4 predictions and 2-4 habit improvements.`;
}

// ─────────────────────────────────────────────────────────────────────
// DOCTOR PROMPT — Full clinical language for the physician
// ─────────────────────────────────────────────────────────────────────
export function buildDoctorPrompt(input: InsightInput): string {
  const { patient, latestVitals, recentSymptoms, currentHealthScore, previousDiagnosis } = input;
  const v = latestVitals;

  return `You are an AI clinical decision support assistant for VitalGuard AI, a physician-facing health monitoring platform.
You are generating a clinical summary for a licensed physician. You may use full medical terminology.

PATIENT DATA:
- Age: ${patient.age} | Sex: ${patient.gender} | Risk Segment: ${patient.segment}
${patient.heredity ? `- Family Hx: ${patient.heredity}` : ""}
${patient.habits ? `- Social/Habit Hx: ${patient.habits}` : ""}
${patient.environment ? `- Environmental exposure: ${patient.environment}` : ""}

${buildVitalsBlock(latestVitals)}
${currentHealthScore ? `\nALGORITHMIC HEALTH SCORE: ${currentHealthScore.score.toFixed(1)}/100 (${currentHealthScore.status})` : ""}
${buildSymptomsBlock(recentSymptoms)}
${buildPreviousBlock(previousDiagnosis)}

TASK: Generate a physician-grade clinical assessment. You may:
- Use ICD-10 category references (do NOT assign a diagnosis, only suggest considerations)
- Reference clinical guidelines (JNC8, AHA/ACC, ADA, WHO, etc.)
- Flag specific vital sign deviations with clinical cut-offs (e.g., MAP, pulse pressure, BMI class)
- Suggest what additional workup may be warranted (labs, imaging) — framed as suggestions to the physician
- Note drug-class interactions if patient mentions medications in habits/history
- Use appropriate medical terminology (hypertension stage, tachycardia, hypoxemia, hyperglycemia, etc.)

DO NOT actually diagnose. Use language like "findings consistent with...", "warrants consideration of...", "may suggest...", "recommend physician evaluation of..."

LANGUAGE RULE: You MUST GENERATE YOUR ENTIRE RESPONSE IN SPANISH (Español). Do NOT use English in the JSON output. Use Spanish for all generated text, summaries, rationales, interpretations and actions.

Respond ONLY with valid JSON, no markdown:
{
  "clinicalSummary": "2-4 sentence clinical assessment using medical terminology. Reference specific values and their clinical significance.",
  "differentialNotes": [
    { "consideration": "Clinical consideration (e.g., Stage 1 Hypertension per JNC8)", "rationale": "Supporting data from vitals/symptoms", "priority": "low|moderate|high" }
  ],
  "clinicalFlags": [
    { "metric": "Metric name (e.g., Systolic BP)", "value": "Recorded value with unit", "interpretation": "Clinical interpretation (e.g., Stage 2 Hypertension threshold exceeded)", "action": "Suggested physician action (e.g., Consider ABPM, lifestyle modification counseling, pharmacotherapy evaluation)" }
  ]
}

Generate 2-4 differentialNotes and flag all clinically significant metrics in clinicalFlags.`;
}

// ─────────────────────────────────────────────────────────────────────
// RULE-BASED FALLBACK — Used when Gemini is unavailable
// ─────────────────────────────────────────────────────────────────────
export function generateSimulatedInsight(input: InsightInput): InsightOutput {
  const { latestVitals, currentHealthScore, recentSymptoms, previousDiagnosis } = input;
  const v = latestVitals;

  let alertLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
  const predictions: InsightOutput["predictions"] = [];
  const habitImprovements: InsightOutput["habitImprovements"] = [];

  if (v) {
    if (v.systolicBP && v.systolicBP > 140) {
      alertLevel = "HIGH";
      predictions.push({ title: "Presión Arterial Elevada", detail: `Su lectura de ${v.systolicBP}/${v.diastolicBP} mmHg está por encima del rango saludable. Monitoree de cerca.`, trend: "worsening" });
      habitImprovements.push({ category: "Nutrición", suggestion: "Reduzca el consumo de sodio y aumente los alimentos ricos en potasio (plátanos, verduras de hoja verde, legumbres).", priority: "high" });
    } else if (v.systolicBP && v.systolicBP > 120) {
      if (alertLevel === "LOW") alertLevel = "MODERATE";
      predictions.push({ title: "Presión Arterial Ligeramente Elevada", detail: `Su PA de ${v.systolicBP}/${v.diastolicBP} mmHg está en el rango elevado. Se recomienda monitoreo regular.`, trend: "stable" });
    } else if (v.systolicBP) {
      predictions.push({ title: "Presión Arterial Normal", detail: `Su PA de ${v.systolicBP}/${v.diastolicBP} mmHg está dentro del rango saludable. ¡Siga así!`, trend: "improving" });
    }
    if (v.heartRate && (v.heartRate > 100 || v.heartRate < 50)) {
      if (alertLevel === "LOW") alertLevel = "MODERATE";
      predictions.push({ title: "Frecuencia Cardíaca Fuera del Rango Normal", detail: `Una frecuencia cardíaca en reposo de ${v.heartRate} lpm está fuera de los 60-100 lpm. Considere técnicas de manejo del estrés y relajación.`, trend: "worsening" });
    }
    if (v.spo2 && v.spo2 < 95) {
      alertLevel = "HIGH";
      predictions.push({ title: "Baja Saturación de Oxígeno", detail: `SpO2 de ${v.spo2}% está por debajo del 95%. Por favor, contacte a su proveedor de atención médica de inmediato.`, trend: "worsening" });
    }
    if (v.glucose && v.glucose > 126) {
      alertLevel = "HIGH";
      predictions.push({ title: "Glucosa en Ayunas Elevada", detail: `Una lectura de glucosa de ${v.glucose} mg/dL está por encima de lo normal. Por favor, hable con su proveedor de atención médica.`, trend: "worsening" });
    }
    if (v.bmi && v.bmi > 30) {
      habitImprovements.push({ category: "Actividad Física", suggestion: "Apunte a 150 min/semana de actividad aeróbica moderada. Comience con caminatas diarias de 20 minutos.", priority: "high" });
    } else if (v.bmi && v.bmi > 25) {
      habitImprovements.push({ category: "Actividad Física", suggestion: "Incluya 30 minutos de movimiento ligero diario — caminar, andar en bicicleta o nadar.", priority: "medium" });
    }
  }

  if (recentSymptoms && recentSymptoms.length > 0) {
    const highIntensity = recentSymptoms.filter(s => s.intensity >= 7);
    if (highIntensity.length > 0) {
      if (alertLevel === "LOW") alertLevel = "MODERATE";
      predictions.push({ title: "Síntomas de Alta Intensidad", detail: `Se reportaron ${highIntensity.length} síntoma(s) con intensidad 7+. Si persisten, programe una consulta con su médico.`, trend: "worsening" });
    }
  }

  if (habitImprovements.length < 2) {
    habitImprovements.push({ category: "Hidratación", suggestion: "Apunte a 2 litros de agua diarios. Una hidratación adecuada apoya la salud cardiovascular y cognitiva.", priority: "low" });
    habitImprovements.push({ category: "Sueño", suggestion: "Mantenga un horario de sueño constante de 7–9 horas. El sueño de calidad es fundamental para el bienestar.", priority: "medium" });
  }
  if (predictions.length === 0) {
    predictions.push({ title: "Bienestar General Estable", detail: "Sus indicadores actuales parecen estables. Continúe con el monitoreo regular.", trend: "stable" });
  }

  const scoreText = currentHealthScore ? `Su puntaje de bienestar es ${currentHealthScore.score.toFixed(0)}/100 (${currentHealthScore.status}). ` : "";
  const comparisonText = previousDiagnosis ? ` Comparado con su último análisis, su estado ${alertLevel === "HIGH" ? "requiere atención" : alertLevel === "MODERATE" ? "muestra áreas a monitorear" : "es estable"}.` : "";
  const healthSummary = `${scoreText}Basado en sus datos más recientes, su perfil de bienestar muestra ${alertLevel === "HIGH" ? "algunas áreas que necesitan atención profesional" : alertLevel === "MODERATE" ? "áreas para mejorar" : "una trayectoria positiva"}.${comparisonText}`;
  const doctorNote = v ? `PA ${v.systolicBP ?? "N/A"}/${v.diastolicBP ?? "N/A"}, FC ${v.heartRate ?? "N/A"}, SpO2 ${v.spo2 ?? "N/A"}%, Glucosa ${v.glucose ?? "N/A"} mg/dL, IMC ${v.bmi ?? "N/A"}. Alerta: ${alertLevel}.` : "No hay signos vitales registrados.";

  return { healthSummary, predictions, habitImprovements, alertLevel, doctorNote };
}

export function generateSimulatedClinical(input: InsightInput): ClinicalOutput {
  const v = input.latestVitals;
  const differentialNotes: ClinicalOutput["differentialNotes"] = [];
  const clinicalFlags: ClinicalOutput["clinicalFlags"] = [];

  if (v) {
    if (v.systolicBP && v.systolicBP > 140) {
      differentialNotes.push({ consideration: "Hipertensión Etapa 2 (criterios JNC8 / ACC/AHA 2017)", rationale: `La PA sistólica de ${v.systolicBP} mmHg supera el umbral de 140 mmHg. En conjunto con el segmento de riesgo del paciente, justifica evaluación farmacoterapéutica.`, priority: "high" });
      clinicalFlags.push({ metric: "PA Sistólica", value: `${v.systolicBP} mmHg`, interpretation: "Hipertensión Etapa 2 — supera el umbral JNC8 (≥140 mmHg)", action: "Considerar MAPA, evaluación de farmacoterapia (IECA/ARA II/BCC/tiazida según perfil de riesgo), restricción de sodio en la dieta (<2.3 g/día)." });
    } else if (v.systolicBP && v.systolicBP > 130) {
      differentialNotes.push({ consideration: "Hipertensión Etapa 1 / PA Elevada (ACC/AHA 2017)", rationale: `La PA sistólica de ${v.systolicBP} mmHg es consistente con hipertensión Etapa 1. Indicación de modificación del estilo de vida; puede considerarse farmacoterapia según el riesgo ASCVD.`, priority: "moderate" });
    }
    if (v.heartRate && v.heartRate > 100) {
      differentialNotes.push({ consideration: "Taquicardia Sinusal — descartar causas secundarias", rationale: `FC ${v.heartRate} lpm en reposo. El diagnóstico diferencial incluye ansiedad, anemia, tirotoxicosis, infección, deshidratación o efecto de medicamentos.`, priority: "moderate" });
      clinicalFlags.push({ metric: "Frecuencia Cardíaca", value: `${v.heartRate} lpm`, interpretation: "Taquicardia en reposo (>100 lpm)", action: "Descartar causas secundarias. Considerar TSH, CSC, panel metabólico. ECG de 12 derivaciones si persiste." });
    }
    if (v.spo2 && v.spo2 < 95) {
      differentialNotes.push({ consideration: "Hipoxemia — evaluación urgente requerida", rationale: `SpO2 ${v.spo2}% está por debajo del umbral de 95%. Justifica evaluación clínica inmediata por compromiso respiratorio o etiología cardíaca.`, priority: "high" });
      clinicalFlags.push({ metric: "SpO2", value: `${v.spo2}%`, interpretation: "Hipoxemia — por debajo del umbral del 95%", action: "Urgente: GSA, Rx de tórax, confirmación con oximetría de pulso. Descartar TEP, neumonía, insuficiencia cardíaca, exacerbación de EPOC." });
    }
    if (v.glucose && v.glucose > 126) {
      differentialNotes.push({ consideration: "Hiperglucemia / Posible Diabetes Mellitus (criterios ADA)", rationale: `La glucosa en ayunas de ${v.glucose} mg/dL supera el umbral diagnóstico de la ADA (≥126 mg/dL). Pruebas confirmatorias indicadas.`, priority: "high" });
      clinicalFlags.push({ metric: "Glucosa en Ayunas", value: `${v.glucose} mg/dL`, interpretation: "Supera el umbral diagnóstico de DM2 de la ADA (≥126 mg/dL)", action: "Solicitar HbA1c, repetir GPA, PTOG si está indicado. Evaluar síndrome metabólico. Derivación para educación sobre diabetes." });
    }
    if (v.bmi && v.bmi >= 30) {
      differentialNotes.push({ consideration: `Obesidad Clase ${v.bmi >= 40 ? "III" : v.bmi >= 35 ? "II" : "I"} (clasificación OMS)`, rationale: `El IMC ${v.bmi} cumple los criterios de obesidad. Asociado con un mayor riesgo cardiometabólico, riesgo de AOS y carga musculoesquelética.`, priority: "moderate" });
      clinicalFlags.push({ metric: "IMC", value: `${v.bmi} kg/m²`, interpretation: `Clase de Obesidad OMS ${v.bmi >= 40 ? "III (≥40)" : v.bmi >= 35 ? "II (35–39.9)" : "I (30–34.9)"}`, action: "Prueba de detección de AOS (Epworth/STOP-BANG), perfil lipídico, glucosa en ayunas, PFH. Derivación a programa estructurado de control de peso." });
    }
    if (v.respiratoryRate && (v.respiratoryRate > 20 || v.respiratoryRate < 12)) {
      clinicalFlags.push({ metric: "Frecuencia Respiratoria", value: `${v.respiratoryRate} resp/min`, interpretation: v.respiratoryRate > 20 ? "Taquipnea (>20 resp/min)" : "Brapipnea (<12 resp/min)", action: "Correlacionar con SpO2, hallazgos auscultatorios. Considerar Rx de tórax si la taquipnea no tiene explicación." });
    }
  }

  if (differentialNotes.length === 0) {
    differentialNotes.push({ consideration: "No se identificaron preocupaciones clínicas agudas a partir de los datos disponibles", rationale: "Signos vitales dentro de los límites normales. Se recomienda continuar con el monitoreo de rutina.", priority: "low" });
  }

  const clinicalSummary = v
    ? `El paciente presenta el siguiente perfil de parámetros vitales: PA ${v.systolicBP ?? "NR"}/${v.diastolicBP ?? "NR"} mmHg, FC ${v.heartRate ?? "NR"} lpm, SpO2 ${v.spo2 ?? "NR"}%, FR ${v.respiratoryRate ?? "NR"}/min, Temp ${v.temperature ?? "NR"}°C, Glucosa en Ayunas ${v.glucose ?? "NR"} mg/dL, IMC ${v.bmi ?? "NR"} kg/m². ${clinicalFlags.length > 0 ? `${clinicalFlags.length} parámetro(s) marcado(s) para atención clínica. ` : "Todos los parámetros están dentro de los rangos de referencia. "}${input.recentSymptoms && input.recentSymptoms.length > 0 ? `El paciente reporta ${input.recentSymptoms.length} síntoma(s); de alta intensidad (≥7/10): ${input.recentSymptoms.filter(s => s.intensity >= 7).length}. ` : ""}Se recomienda la revisión médica de las métricas marcadas y su correlación con el historial clínico.`
    : "No hay datos de signos vitales disponibles. Se recomiendan mediciones base antes de la evaluación clínica.";

  return { clinicalSummary, differentialNotes, clinicalFlags };
}
