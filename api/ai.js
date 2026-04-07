export default async function handler(req, res) {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Parse body safely
    let body = req.body;

    if (!body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { recipe } = body;

    if (!recipe) {
      return res.status(400).json({ error: "Recipe is required" });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You return ONLY valid JSON."
          },
          {
            role: "user",
            content: `Give ingredients for ${recipe}. Return ONLY JSON array like:
            [{"name":"Ingredient","quantity":1,"unit":"gram"}]`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // Extract AI content safely
    const content = data.choices?.[0]?.message?.content || "[]";

    let ingredients;
    try {
      ingredients = JSON.parse(content);
    } catch {
      ingredients = [];
    }

    return res.status(200).json({ ingredients });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
