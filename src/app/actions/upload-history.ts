"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { callGeminiWithFile } from "@/lib/gemini";

const PARSE_PROMPT = `
You are an expert medical data extraction assistant.
You have been provided with an image or PDF of a historical medical record.
Your task is to extract any relevant vital signs from the document and IDENTIFY the exact date this data was recorded.
If the document fails to state an exact date or year, you MUST set the "date" field to exactly null. Do NOT guess a default epoch date like 1970.
Return the extracted information strictly in valid JSON format. DO NOT use markdown code blocks like \`\`\`json. Just output the raw JSON string.

Schema expected:
{
  "records": [
    {
      "date": "YYYY-MM-DDTHH:mm:ss.000Z" | null, // Required. ISO 8601 format. If date is completely unknown, return null.
      "systolicBP": number | null,
      "diastolicBP": number | null,
      "heartRate": number | null,
      "respiratoryRate": number | null,
      "temperature": number | null,
      "spo2": number | null,
      "glucose": number | null,
      "weight": number | null,
      "height": number | null,
      "bmi": number | null
    }
  ]
}

Only include records that are explicitly identifiable in the document.
`;

export async function uploadHistoryAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const patientId = (session.user as any).patientId;
    if (!patientId) {
      return { error: "Patient profile not found." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided." };
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    
    const mimeType = file.type;

    // Call Gemini with the file
    const rawResponse = await callGeminiWithFile(PARSE_PROMPT, mimeType, base64Data);
    if (!rawResponse) {
      return { error: "Failed to extract data from document." };
    }

    // Clean JSON response
    const cleanedJson = rawResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", cleanedJson);
      return { error: "AI returned invalid format." };
    }

    if (!parsedData || !parsedData.records || !Array.isArray(parsedData.records)) {
      return { error: "No valid medical records found in the document." };
    }

    // Check if any record is missing a valid date
    let requiresDate = false;
    for (const record of parsedData.records) {
      if (!record.date || record.date.includes("unknown") || isNaN(new Date(record.date).getTime())) {
        requiresDate = true;
        break;
      }
      
      // Secondary check for hallucinated dates like 1970
      const parsedDate = new Date(record.date);
      if (parsedDate.getFullYear() < 1980) {
        requiresDate = true;
        break;
      }
    }

    if (requiresDate || parsedData.records.length === 0) {
      // If no valid dates found, return the parsed data back to the client so the user can input the date
      return { requiresDate: true, records: parsedData.records };
    }

    return await saveExtractedRecordsAction(parsedData.records);

  } catch (error) {
    console.error("uploadHistoryAction error:", error);
    return { error: "Internal server error." };
  }
}

export async function saveExtractedRecordsAction(records: any[], manualDate?: Date) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const patientId = (session.user as any).patientId;
    if (!patientId) {
      return { error: "Patient profile not found." };
    }

    let recordsCreated = 0;
    const status = "GREEN";

    // Insert records into the database
    for (const record of records) {
      let recordDate = manualDate;
      
      // If we didn't provide a manual date, try to use the record's included date
      if (!recordDate) {
        if (!record.date) continue;
        recordDate = new Date(record.date);
        if (isNaN(recordDate.getTime())) continue;
      }

      // Check if there's sufficient data to create a vital sign log
      const hasVitals = 
        record.systolicBP || record.diastolicBP || record.heartRate || 
        record.respiratoryRate || record.temperature || record.spo2 || 
        record.glucose || record.weight || record.height;

      if (!hasVitals) continue;

      await prisma.vitalSign.create({
        data: {
          patientId,
          timestamp: recordDate,
          systolicBP: record.systolicBP || null,
          diastolicBP: record.diastolicBP || null,
          heartRate: record.heartRate || null,
          respiratoryRate: record.respiratoryRate || null,
          temperature: record.temperature || null,
          spo2: record.spo2 || null,
          glucose: record.glucose || null,
          weight: record.weight || null,
          height: record.height || null,
          bmi: record.bmi || null,
          status,
        }
      });
      recordsCreated++;
    }

    if (recordsCreated === 0) {
      return { error: "No usable vital signs with dates were extracted." };
    }

    return { success: true, count: recordsCreated, records };

  } catch (error) {
    console.error("saveExtractedRecordsAction error:", error);
    return { error: "Internal server error." };
  }
}

