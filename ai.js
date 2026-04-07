export default async function handler(req, res) {
  try {
    const { recipe } = req.body;

    if (!recipe) {
      return res.status(400).json({ error: "Recipe is required" });
    }

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

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}