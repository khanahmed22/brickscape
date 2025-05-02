import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  const { text } = await req.json();
  console.log('Received text:', text);
  console.log(text)

  const result = await streamText({
    model: google('gemini-1.5-flash-latest'),
    prompt: `Please rephrase the following text in a different way, maintaining the original meaning: "${text}"`,
  });

  console.log('Stream result:', result);

  const response = result.toDataStreamResponse();
  console.log('Response:', response);

  return response;
}