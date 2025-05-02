export async function POST(req) {
  try {
    const { prompt } = await req.json();
    console.log("Received Prompt:", prompt);

    const response = await fetch("https://api.imagepig.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.IMAGEPIG_API_KEY,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Capture API response error
      console.error("API Error:", errorText);
      return new Response(JSON.stringify({ error: `API Error: ${response.status} - ${errorText}` }), { status: 500 });
    }

    const json = await response.json();
    return new Response(JSON.stringify({ image: `data:image/jpeg;base64,${json.image_data}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
