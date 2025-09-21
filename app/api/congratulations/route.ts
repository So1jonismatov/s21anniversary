import { NextResponse } from 'next/server';
import { addCongratulation, getCongratulations } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { name, message } = await request.json();
    
    // Validate input
    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required' },
        { status: 400 }
      );
    }
    
    if (name.length > 50 || message.length > 500) {
      return NextResponse.json(
        { error: 'Name or message too long' },
        { status: 400 }
      );
    }
    
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }
    
    // Add to database
    const newCongratulation = await addCongratulation(name, message);
    
    if (!newCongratulation) {
      return NextResponse.json(
        { error: 'Failed to save congratulation' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newCongratulation);
  } catch (error) {
    console.error('Error in POST /api/congratulations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("GET /api/congratulations called");
  try {
    const congratulations = await getCongratulations();
    return NextResponse.json(congratulations);
  } catch (error) {
    console.error('Error in GET /api/congratulations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
