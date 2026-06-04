import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ai, triageModel } from "./server/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/triage", async (req, res) => {
    try {
      const { symptoms, clinicalHistory } = req.body;

      if (!ai) {
        // --- SMART CLINICAL RULE-BASED TRIAGE SIMULATOR ---
        const symLow = (symptoms || "").toLowerCase();
        let urgency = "SELF-CARE";
        let reason = "mild, common symptoms reported.";
        let careDetails = "Supportive care at home, rest, and adequate hydration.";
        
        // Scan for Emergency indicators
        const emergencyKeywords = [
          "chest pain", "heart attack", "shortness of breath", "breathing difficulty", 
          "difficulty breathing", "stroke", "unconscious", "unconsciousness", 
          "heavy bleeding", "fracture", "seizure", "paralysis", "poison", 
          "face drooping", "arm weakness", "severe burn", "choking", "suicidal"
        ];
        // Scan for Urgent indicators
        const urgentKeywords = [
          "sprain", "broken bone", "high fever", "migraine", "severe headache", 
          "stomach pain", "abdominal pain", "vomiting", "dehydration", 
          "asthma", "ear pain", "deep cut", "abscess", "unable to keep fluids down"
        ];
        // Scan for Routine indicators
        const routineKeywords = [
          "checkup", "refill", "vaccine", "prescription", "physical", 
          "mole check", "blood test", "mild itch", "scheduled check", "stitch removal"
        ];

        let matchedSymptomTerm = "";
        
        if (emergencyKeywords.some(kw => { if (symLow.includes(kw)) { matchedSymptomTerm = kw; return true; } return false; })) {
          urgency = "EMERGENCY";
          reason = `acute warning indicator detected: "${matchedSymptomTerm}".`;
          careDetails = "CALL EMERGENCY SERVICES (e.g., 911) IMMEDIATELY. Do NOT wait. Prompt medical observation is vital.";
        } else if (urgentKeywords.some(kw => { if (symLow.includes(kw)) { matchedSymptomTerm = kw; return true; } return false; })) {
          urgency = "URGENT";
          reason = `moderate acute indicator observed: "${matchedSymptomTerm}".`;
          careDetails = "Visit an Urgent Care Clinic or consult your healthcare provider within the next 12-24 hours.";
        } else if (routineKeywords.some(kw => { if (symLow.includes(kw)) { matchedSymptomTerm = kw; return true; } return false; })) {
          urgency = "ROUTINE";
          reason = `non-acute care indicators: "${matchedSymptomTerm}".`;
          careDetails = "Schedule a standard appointment with your primary care provider or specialist.";
        } else {
          // Check for common self-care
          const selfCareKeywords = ["cough", "cold", "runny nose", "sore throat", "muscle ache", "fatigue", "minor cut", "bruise", "sunburn", "indigestion"];
          const selfMatched = selfCareKeywords.find(kw => symLow.includes(kw));
          if (selfMatched) {
            matchedSymptomTerm = selfMatched;
          }
          urgency = "SELF-CARE";
          reason = matchedSymptomTerm ? `common self-limiting indicator observed: "${matchedSymptomTerm}".` : "symptoms are consistent with self-limiting conditions.";
          careDetails = "Prioritize resting, robust fluid intake, and over-the-counter supportive relief. Monitor temperature periodically.";
        }

        const clinicalHistoryValue = clinicalHistory || "None declared";
        
        const assessmentMarkdown = `# SymptomNav™ Clinical Triage Assessment
*Clinical Diagnostic Sandbox Mode (Operating without API key)*

This triage report is compiled using clinical routing protocols for **${urgency}** priority level based on the presented profile.

### 📊 Presenting Cases & Profile
- **Reported Symptoms**: *"${symptoms}"*
- **Clinical History Checked**: *"${clinicalHistoryValue}"*
- **Primary Clinical Focus**: Identified indications matching standard clinical pathways (${reason})

---

### 🏥 Direct Care Instructions
1. **Immediate Care Directive**: **${careDetails}**
2. **Monitoring Log**: Verify temperature, heart rate, or pain progression every 4 hours. Keep a written record of time and symptom changes.
3. **Red Flag Warning Signs**: If symptoms worsen rapidly, or if new symptoms such as chest pressure, confusion, severe localized pain, or high fever occur, seek urgent medical evaluation.

---

### ⚠️ Med-Legal Disclaimer
*SymptomNav AI is a medical information assistant and does not formulate final medical diagnoses or prescribing treatments. This assessment is built based on general triage guidelines. Please seek direct clinical supervision for all health concerns.*`;

        return res.json({
          urgency,
          assessment: assessmentMarkdown
        });
      }

      const systemInstruction = `
        You are an expert medical triage assistant. Your goal is to assess symptoms provided by the user and categorize the urgency of their situation.
        
        CONTEXT: The user has provided their current symptoms and their clinical history (medical background, allergies, past conditions). Use BOTH to provide a specialized assessment.
        
        CRITICAL: 
        1. Always include a clear disclaimer that you are an AI and not a doctor.
        2. Categorize the situation into one of: EMERGENCY, URGENT, SELF-CARE, or ROUTINE.
        3. Provide clear next steps.
        4. If it's an EMERGENCY, advise calling emergency services immediately.
        5. Format your response in Markdown.
        6. Return a JSON object with two fields: "assessment" (the markdown text) and "urgency" (the category string).
      `;

      const prompt = `
        Symtoms: ${symptoms}
        Clinical History: ${clinicalHistory || "None provided"}
        
        Please provide a triage assessment considering the symptoms and historical context.
      `;

      const response = await ai.models.generateContent({
        model: triageModel,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              assessment: { type: "STRING" },
              urgency: { 
                type: "STRING",
                description: "One of: EMERGENCY, URGENT, SELF-CARE, ROUTINE"
              }
            },
            required: ["assessment", "urgency"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Triage error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, clinicalHistory, metrics } = req.body;
      
      if (!ai) {
        // --- INTELLECTUAL CLINICAL CHAT PATHWAY SIMULATOR ---
        const msgLow = (message || "").toLowerCase();
        let reply = "";

        const disclaimer = "\n\n*Notice: I am an AI assistant representing clinical knowledge in Sandbox Mode. In any acute or complex scenario, engage direct clinical observation.*";

        if (msgLow.includes("sleep")) {
          reply = `### 🌙 Sleep Quality & Circadian Guidelines

Sleep is a fundamental clinical parameter for neurological repair and metabolic function. Based on standard health guidelines:

- **Duration Guidelines**: Target **7 to 9 hours** of uninterrupted sleep.
- **Micro-Environment**: Keep sleep settings tranquil, dark, and cool (ideally 60–67°F or 15–19°C) to facilitate deep REM sleep cycles.
- **Blue Light Disconnection**: Disengage blue-spectrum screen displays at least **60 minutes** before bedtime to protect natural melatonin synthesis.
- **Consistency**: Maintain a sleep/wake schedule with less than 30 minutes of variability between weekdays and weekends.${disclaimer}`;
        } else if (msgLow.includes("heart") || msgLow.includes("bpm") || msgLow.includes("cardio") || msgLow.includes("pulse")) {
          reply = `### 🫀 Cardiac Vitality & Pulse Rate Check

Heart health and autonomic regulatory systems dictate general physical endurance:

- **Target Thresholds**: Standard adult resting heart rates reside between **60 and 100 BPM**. Standard active targets range from 110 to 150 BPM depending on age.
- **Heart Rate Variability**: Keep track of daily variations in recovery times using digital logs.
- **Preventative Metrics**: Engage in 150 minutes of moderate cardiovascular workout weekly.
- **Diagnostic Advice**: If you experience sudden, unaccounted heart rate spikes accompanied by lightheadedness or chest tight feeling, notify a clinician immediately.${disclaimer}`;
        } else if (msgLow.includes("step") || msgLow.includes("walk") || msgLow.includes("exercise") || msgLow.includes("activity")) {
          reply = `### 🏃 Active Mobility & Daily Kinesiology

Consistent physical movement lowers chronic blood pressure, reduces tissue inflammation, and balances systemic glycemic impact:

- **Step Baseline targets**: Targeting **7,500 to 10,000 steps** daily significantly improves cardiovascular integrity.
- **Aerobic Breaks**: For every 60 minutes of sedentary sitting, take a 5-minute movement or posture correction break.
- **Clinical Gains**: Routine low-intensity walking aids glycemic disposal post-meals. Try a light 15-minute stroll after dinner.${disclaimer}`;
        } else if (msgLow.includes("diet") || msgLow.includes("nutrition") || msgLow.includes("eat") || msgLow.includes("hydration") || msgLow.includes("water")) {
          reply = `### 🥗 Clinical Nutrition & Fluids Management

Appropriate macronutrient and hydration statuses regulate critical cellular and metabolic filtration channels:

- **Hydration Protocols**: Consume **2 to 3 liters** of pure hydration (water) daily to assist renal systems and support muscle volume.
- **Glycemic Control**: Prioritize complex high-fiber carbohydrates paired with adequate dietary proteins over processed sugar structures.
- **Trace Minerals**: Integrating foods high in potassium and magnesium supports natural vascular dilution and blood pressure tracking.${disclaimer}`;
        } else if (msgLow.includes("fever") || msgLow.includes("cold") || msgLow.includes("flu") || msgLow.includes("cough")) {
          reply = `### 🤒 Pediatric & Adult Viral Management

Common upper-respiratory infections are self-limiting and respond well to supportive care protocols:

- **Vigorous Bed Rest**: Maximize physiological energy reservation by securing 8-10 hours of bed rest.
- **Electrolyte Restoration**: Support fluid cells with warm teas, clear broths, or specific mineral/electrolyte tablets.
- **Airway Support**: Use steam vaporizers, warm baths, or herbal lozenges to soothe sinus passages.
- **When to Escalate**: Seek clinical consult if high fevers resist antipyretic medications for over 48 hours or present with stiff neck pain.${disclaimer}`;
        } else if (msgLow.includes("headache") || msgLow.includes("migraine")) {
          reply = `### 🧠 Acute Headache & Migraine Support

Headaches are frequent clinical indicators for minor distress but can occasionally alert us to chronic trends:

- **Primary Catalysts**: Evaluate dehydration status, posture tension, eye strain, or sudden caffeine withdrawal.
- **Sensory De-escalation**: Retreat to a high-contrast dark room with low noise. Cool damp compresses applied to the forehead or neck often calm inflamed blood pathways.
- **Clinical Indicators**: If accompanied by sensory aura (visual flashes, speech numbness) or represents a sudden, intense onset, consult professional care.${disclaimer}`;
        } else if (msgLow.includes("history") || msgLow.includes("profile") || msgLow.includes("condition")) {
          const profileStatus = clinicalHistory ? `"${clinicalHistory}"` : "Not explicitly declared yet";
          reply = `### 📋 User Profile & Clinical History Matching

I am analyzing your registered history data: **${profileStatus}**.

- **Comorbidity Evaluation**: I cross-reference clinical history matches with any symptoms you input to provide warnings of dangerous drug-to-history or symptom-to-history contraindications.
- **Best Practice**: To optimize your health outcomes, ensure your allergies, medication schedules, and clinical background conditions are updated in the Health Profile tab.${disclaimer}`;
        } else {
          reply = `### 💬 SymptomNav™ Clinical Sandbox Companion

Hello! I am operating in **Clinical Sandbox Mode**. I can assist you by explaining medical concepts, clinical telemetry trends, and wellness directives.

- **Sample Queries**: Try asking about **Sleep quality guidelines**, **Cardio pulse tracking**, **Mobility targets**, or **Flu recovery protocols**.
- **User Background Integration**: I can analyze registered history like *"${clinicalHistory || "None declared"}"* to tailor general preventative pointers.
- **Triage Guide**: If you are feeling unwell right now, use the **Symptom Triage & Assessment tool** on the dashboard to receive a formal priority evaluation.${disclaimer}`;
        }

        return res.json({ reply });
      }

      const systemInstruction = `
        You are SymptomNav AI, an intelligent, high-fidelity healthcare companion and clinical learning model.
        Your tone is premium, professional, empathetic, responsive, and clinical.
        
        USER CLINICAL PROFILE:
        - Clinical Background / History: ${clinicalHistory || "No specific background registered."}
        - Current Metrics Logged: ${metrics ? `Heart Rate: ${metrics.heartRate || 72} BPM, Sleep: ${metrics.sleep || 7.5} hrs, Steps: ${metrics.steps || 6000}` : "No telemetry registered."}
        
        ROLE INSTRUCTIONS:
        - Resolve the patient's queries, explain clinical terms, and guide them with wisdom regarding metrics or preventative care.
        - ALWAYS start or conclude with a humble, explicit, elegant notice: "I am an AI assistant representing clinical knowledge, but in any acute or complex scenario, engage direct clinical observation."
        - Keep formatting beautiful, utilizing precise bullet points and minimal paragraphs.
      `;

      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: triageModel,
        contents,
        config: {
          systemInstruction,
        }
      });

      res.json({ reply: response.text || "I was unable to formulate a response. Please rephrase." });
    } catch (error: any) {
      console.error("Chat companion error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/health-summary", async (req, res) => {
    try {
      const { metrics, clinicalHistory, medications, appointments } = req.body;

      if (!ai) {
        // --- DETAILED CLINICAL METRICS HEALTH INDEXER SIMULATOR ---
        // Compute logical scores
        const steps = metrics?.steps ? Number(metrics.steps) : 6800;
        const sleep = metrics?.sleep ? Number(metrics.sleep) : 7.7;
        const heartRate = metrics?.heartRate ? Number(metrics.heartRate) : 72;

        let score = 75; // Baseline
        
        // Steps Impact
        if (steps >= 10000) score += 15;
        else if (steps >= 8000) score += 10;
        else if (steps >= 5000) score += 5;
        else if (steps < 4000) score -= 15;

        // Sleep Impact
        if (sleep >= 7 && sleep <= 9) score += 10;
        else if (sleep >= 6 && sleep < 7) score += 2;
        else if (sleep < 5.5) score -= 15;

        // Heart Rate Impact
        if (heartRate >= 60 && heartRate <= 80) score += 5;
        else if (heartRate > 90 || heartRate < 55) score -= 10;

        // Cap score
        score = Math.max(1, Math.min(100, score));

        let status: "Excellent" | "Good" | "Fair" | "Needs Attention" = "Good";
        if (score >= 90) status = "Excellent";
        else if (score >= 75) status = "Good";
        else if (score >= 60) status = "Fair";
        else status = "Needs Attention";

        let analysisMarkdown = `### 📊 Diagnostic Performance Analysis
*SymptomNav™ Health Summary Engine (Sandbox Mode)*

We completed an evaluation of your daily logged biometrics, registered prescription schedules, and appointments.

#### 🏃 Physical Activity & Steps Audit
You registered a step count of **${steps.toLocaleString()} steps** today. 
${steps >= 8000 
  ? "Excellent active momentum. This range ensures strong metabolic disposal and active tissue oxygenation." 
  : "Your physical movement is slightly below optimal. Aim for moderate walking sessions after main meals to improve circulation."}

#### 😴 Somnological Rest and Recovery
Your reported sleep session is **${sleep} hours**. 
${sleep >= 7 && sleep <= 9 
  ? "This is in the targeted rest zone, facilitating proper glycogen replenishment and cognitive recovery." 
  : "Your rest is below the targeted 7-hour clinical threshold. Inadequate rest yields an increase in systemic cortisol."}

#### 🩺 Cardiovascular Vitality
Your recorded heart rate is **${heartRate} BPM**.
${heartRate >= 60 && heartRate <= 80 
  ? "This represents a stable autonomic balance and strong resting cardiac efficiency." 
  : "Your resting pulse shows deviation. Track this over a week to identify stress factors, caffeine, or absolute fatigue."}

#### 💊 Prescriptions & Care Integration
${medications && medications.length > 0 
  ? `We compiled and verified matching schedules for **${medications.length} medication(s)** (${medications.map((m: any) => m.name).join(', ')}). Monitor for any comorbidity overlaps with your profile.` 
  : "No recurring medications are active in your registry, minimizing systemic pharmacy interaction risks."}`;

        const recommendations = [
          steps < 8000 
            ? `Increase physical movement: Strive to add a simple 20-minute rhythmic walk to secure ${Math.max(8000, steps + 1500)} steps.` 
            : "Maintain your fantastic daily active steps. Great work on cardiorespiratory maintenance!",
          sleep < 7 
            ? "Prioritize sleep hygiene: Establish a digital curfew tonight and darken your sleep room to elevate deep cycles." 
            : "Optimize sleep cycles: Try tracking sleep onset consistency to keep circadian rhythm stable.",
          medications && medications.length > 0
            ? "Set direct alarms: Make sure to synchronize medication times and logs accurately to avoid scheduling overlaps."
            : "Preventative health focus: Hydrate daily with 2.5 of filtered water to support renal wellness."
        ];

        return res.json({
          score,
          status,
          analysis: analysisMarkdown,
          recommendations
        });
      }

      const prompt = `
        Analyze the following user health records and synthesize a professional health summary.
        
        1. Clinical Profiles: ${clinicalHistory || "No chronic conditions or allergies registered."}
        2. Registered Telemetry: 
           - Heart Rate: ${metrics?.heartRate || "72"} BPM
           - Sleep: ${metrics?.sleep || "7.7"} hours
           - Daily Steps: ${metrics?.steps || "6800"} steps
        3. Prescriptions / Medications: ${medications && medications.length > 0 ? medications.map((m: any) => `${m.name} (${m.dosage} - ${m.frequency})`).join(', ') : "None documented."}
        4. Structured Appointments: ${appointments && appointments.length > 0 ? appointments.map((a: any) => `${a.doctor} (${a.specialty}) on ${a.date} at ${a.time}`).join(', ') : "None scheduled."}
        
        Generate the analysis.
        Return a JSON object conforming exactly to:
        {
          "score": integer, // overall score from 1 to 100 based on metrics and clinical variables
          "status": "Excellent" | "Good" | "Fair" | "Needs Attention",
          "analysis": "Markdown formatted paragraphs providing insights, celebrating positive trends, and analyzing metrics",
          "recommendations": ["3 strategic actionable healthcare or wellness tips"]
        }
      `;

      const response = await ai.models.generateContent({
        model: triageModel,
        contents: prompt,
        config: {
          systemInstruction: "You are a senior clinical analytics compiler. Analyze metrics, profiles, and scheduled regimens to output detailed data summaries. Maintain absolute clinical precision and an elegant, constructive tone.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              score: { type: "INTEGER" },
              status: { type: "STRING" },
              analysis: { type: "STRING" },
              recommendations: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["score", "status", "analysis", "recommendations"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Health summary synthesis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
