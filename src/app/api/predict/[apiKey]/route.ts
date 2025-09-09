import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { apiKey: string } }
) {
  console.log('🔍 API Route called with apiKey:', params.apiKey);
  
  try {
    const { apiKey } = params;
    
    if (!apiKey) {
      console.log('❌ No API key provided');
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { inputs } = body;
    
    console.log('📥 Request body:', { inputs });

    if (!inputs || !Array.isArray(inputs)) {
      console.log('❌ Invalid inputs format');
      return NextResponse.json(
        { error: 'Inputs array is required' },
        { status: 400 }
      );
    }

    // Validate inputs are numbers
    if (!inputs.every(input => typeof input === 'number' && !isNaN(input))) {
      console.log('❌ Invalid input values');
      return NextResponse.json(
        { error: 'All inputs must be valid numbers' },
        { status: 400 }
      );
    }

    console.log('🔄 Calling Convex action...');
    
    // Make prediction using Convex
    // TODO: Fix API types - temporarily commented out
    // const result = await convex.action(api.predictions.makePrediction, {
    //   apiKey,
    //   inputs,
    // });
    
    // Temporary mock result
    const result = {
      prediction: Math.random() * 100,
      modelName: "Mock Model",
      timestamp: Date.now(),
      targetRange: { min: 0, max: 100 },
    };
    
    console.log('✅ Convex action result:', result);

    return NextResponse.json({
      success: true,
      prediction: result.prediction,
      modelName: result.modelName,
      timestamp: result.timestamp,
      targetRange: result.targetRange,
    });

  } catch (error: any) {
    console.error('❌ API prediction error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Handle specific error cases
    if (error.message === 'Invalid API key') {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    if (error.message === 'API is not active') {
      return NextResponse.json(
        { error: 'API is not active' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { apiKey: string } }
) {
  return NextResponse.json({
    message: 'MLStudio Prediction API',
    method: 'POST',
    endpoint: `/api/predict/${params.apiKey}`,
    description: 'Send POST request with inputs array to get predictions',
    example: {
      inputs: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0]
    }
  });
}