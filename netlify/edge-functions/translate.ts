import type { Config, Context } from "@netlify/edge-functions";

export default async (req: Request, context: Context) => {
  const requestKey = req.headers.get("api_key");
  if (requestKey !== Netlify.env.get('api_key')) {
    return new Response("Unauthorized", { status: 401 });
  }
  console.log("requestKey: ", requestKey);
  const body = await req.json();
  console.log("requestBody: ", JSON.stringify(body))
  const question = body.question;
  console.log("user input: ", body.question);
  const sys_prompt = "Translate the user input. If it's Chinese, then translate to English, if it's English, then translate to Chinese. Only output the tranlated result, no the other info";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Netlify.env.get('OPENROUTER_API_KEY')}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "meta-llama/llama-3-70b-instruct:nitro",
      "messages": [
        { "role": "system", "content": sys_prompt },
        { "role": "user", "content": question },
      ],
    })
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  const responseData = await response.json();
  console.log('Response:', responseData);
  // Process the response data as needed
  return new Response(JSON.stringify(responseData)); 
};

export const config: Config = {
  path: "/translate",
};
