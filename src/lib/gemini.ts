export async function callGemini(prompt: string, maxRetries = 2) {
    const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const modelId = MODEL.startsWith('models/') ? MODEL : `models/${MODEL}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${API_KEY}`;
    
    const body = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
        }
    };

    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();

            if (!res.ok) {
                console.error(`Gemini API Error (Attempt ${attempt + 1}):`, json);
                throw new Error(json.error?.message || "Unknown Gemini API error");
            }

            if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0].text) {
                return json.candidates[0].content.parts[0].text;
            } else {
                return JSON.stringify(json);
            }
        } catch (e: any) {
            lastError = e;
            console.error("callGemini error on attempt", attempt + 1, e.message);
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // exponential backoff
            }
        }
    }
    throw lastError;
}

export async function callGeminiChat(systemInstruction: string, messages: any[]) {
    const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const modelId = MODEL.startsWith('models/') ? MODEL : `models/${MODEL}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${API_KEY}`;
    
    const body = {
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        contents: messages,
        generationConfig: {
            temperature: 0.7
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const json = await res.json();

    if (!res.ok) {
        console.error("Gemini API Error:", json);
        throw new Error(json.error?.message || "Unknown Gemini API error");
    }

    if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0].text) {
        return json.candidates[0].content.parts[0].text;
    } else {
        return "通信エラーが発生したようだ！もう一度頼む！";
    }
}

export async function callGeminiImage(prompt: string, mimeType: string, base64Data: string) {
    const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const modelId = MODEL.startsWith('models/') ? MODEL : `models/${MODEL}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${API_KEY}`;
    
    const body = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const json = await res.json();

    if (!res.ok) {
        console.error("Gemini API Error:", json);
        throw new Error(json.error?.message || "Unknown Gemini API error");
    }

    let text = null;
    if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0].text) {
        text = json.candidates[0].content.parts[0].text;
    } else {
        text = JSON.stringify(json);
    }

    return text;
}
