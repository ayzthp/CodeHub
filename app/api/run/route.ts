import { NextRequest, NextResponse } from 'next/server';

interface Judge0Response {
  token: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  status?: {
    id: number;
    description: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { source_code, language_id, stdin } = await request.json();

    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code,
        language_id,
        stdin: stdin || ''
      })
    });

    const data: Judge0Response = await response.json();
    const token = data.token;

    // Poll for results
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });
      
      result = await resultResponse.json();
      
      if (result.status && result.status.id > 2) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      output: result.stdout || '',
      error: result.stderr || result.compile_output || result.message || '',
      status: result.status?.description || 'Unknown'
    });

  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute code' },
      { status: 500 }
    );
  }
} 