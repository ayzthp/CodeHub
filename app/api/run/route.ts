import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  const { code, languageId, stdin } = await req.json();

  try {
    const { data } = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString('base64'),
      },
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json"
        }
      }
    );

    // Decode the response if it's base64 encoded
    if (data.stdout) {
      data.stdout = Buffer.from(data.stdout, 'base64').toString();
    }
    if (data.stderr) {
      data.stderr = Buffer.from(data.stderr, 'base64').toString();
    }
    if (data.compile_output) {
      data.compile_output = Buffer.from(data.compile_output, 'base64').toString();
    }

    return NextResponse.json(data);
  } catch (e: unknown) {
    // Forward Judge0 error message if available
    const error = e as { response?: { data?: { message?: string } } };
    const errorMsg = error.response?.data?.message || "Execution failed";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 