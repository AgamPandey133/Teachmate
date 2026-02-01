export const chatWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // 1. Fetch list of models
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsResponse.json();

    if (!modelsResponse.ok) {
        throw new Error(modelsData.error?.message || "Failed to list models");
    }

    // 2. Find a suitable model
    const availableModel = modelsData.models?.find(m => 
        m.supportedGenerationMethods?.includes("generateContent") &&
        (m.name.includes("gemini") || m.name.includes("chat")) // Prefer gemini models
    );

    if (!availableModel) {
        throw new Error("No suitable model found for this API Key");
    }

    console.log("Using Model:", availableModel.name);

    // 3. Generate Content
    const url = `https://generativelanguage.googleapis.com/v1beta/${availableModel.name}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    const data = await response.json();

    if (!response.ok) {
         throw new Error(data.error?.message || "Failed to fetch from Gemini API");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("No text returned from Gemini");
    }

    res.status(200).json({ text });
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ message: "AI Error: " + (error.message || "Internal Server Error") });
  }
};
