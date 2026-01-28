
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Machine, SensorData, MaintenanceRecommendation } from "../types";

// Always initialize GoogleGenAI with process.env.API_KEY as per library requirements
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getMaintenanceAnalysis = async (machine: Machine): Promise<MaintenanceRecommendation> => {
  const ai = getAIClient();
  const prompt = `Analyze this industrial machine data and provide maintenance recommendations.
  Machine: ${machine.name} (${machine.type})
  Failure Risk: ${machine.failureProbability}%
  Recent Sensors:
  - Temperature: ${machine.sensorData.temperature.toFixed(1)}°C
  - Vibration: ${machine.sensorData.vibration.toFixed(2)} mm/s
  - Pressure: ${machine.sensorData.pressure.toFixed(1)} PSI
  - RPM: ${machine.sensorData.rpm.toFixed(0)}
  
  Provide a JSON response with: summary, rootCause, urgency (low/medium/high/immediate), steps (array), partsNeeded (array).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            rootCause: { type: Type.STRING },
            urgency: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            partsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "rootCause", "urgency", "steps", "partsNeeded"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data as MaintenanceRecommendation;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "AI analysis unavailable. Manual inspection recommended.",
      rootCause: "Data threshold exceedance detected.",
      urgency: machine.failureProbability > 80 ? 'immediate' : 'medium',
      steps: ["Perform physical check", "Review sensor logs", "Notify supervisor"],
      partsNeeded: ["None identified"]
    };
  }
};

export const generateFleetReport = async (machines: Machine[]): Promise<string> => {
  const ai = getAIClient();
  const dataSummary = machines.map(m => `- ${m.name}: Status ${m.status}, Risk ${m.failureProbability}%, RUL ${m.remainingUsefulLife}h`).join('\n');
  const prompt = `Generate a comprehensive industrial fleet maintenance report based on this data:
  ${dataSummary}
  
  Include a high-level executive summary, identification of top critical risks, and a recommended schedule for the upcoming week. Use professional engineering terminology.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text || "Failed to generate report.";
};

export const askMachineChat = async (query: string, machine: Machine): Promise<string> => {
  const ai = getAIClient();
  const context = `Context: Machine ${machine.name} (${machine.type}). Prob: ${machine.failureProbability}%. Temp: ${machine.sensorData.temperature}°C. Vibration: ${machine.sensorData.vibration}mm/s. RUL: ${machine.remainingUsefulLife}h.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${context}\nUser Question: ${query}\nAssistant Answer:`,
    config: {
      systemInstruction: "You are an expert industrial maintenance AI assistant. Provide concise, accurate, and safety-conscious answers."
    }
  });
  return response.text || "I am unable to process that request at the moment.";
};

export const askFleetAssistant = async (query: string, machines: Machine[]): Promise<string> => {
  const ai = getAIClient();
  const fleetSummary = machines.map(m => 
    `${m.name} (${m.type}): Risk ${m.failureProbability}%, RUL ${m.remainingUsefulLife}h, Status ${m.status}, Location ${m.location}, Potential Savings ₹${m.costImpact.potentialSavings}`
  ).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fleet Status Data:\n${fleetSummary}\n\nUser Question: ${query}\nAssistant Answer:`,
    config: {
      systemInstruction: "You are a Fleet Intelligence Assistant for a manufacturing plant. Use the provided fleet data to answer questions about which machines need attention, economic impact, and general health. Be concise, professional, and insightful."
    }
  });
  return response.text || "I don't have enough data to answer that right now.";
};

export const getDeepDiagnostic = async (machine: Machine): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Perform a deep diagnostic thinking analysis on why machine ${machine.name} (${machine.type}) is showing a ${machine.failureProbability}% failure probability. Consider physics of the machine, environmental factors, and historical sensor drift.
  
  Recent Stats: Temp ${machine.sensorData.temperature.toFixed(1)}C, Vibration ${machine.sensorData.vibration.toFixed(2)}mm/s.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "No diagnostic results.";
  } catch (error) {
    return "Deep diagnostic error: " + (error as Error).message;
  }
};
