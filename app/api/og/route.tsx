import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const floor = searchParams.get('floor') || '1';
  const score = searchParams.get('score') || '0';
  const monsters = searchParams.get('monsters') || '0';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          color: '#e0e0e0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 'bold', color: '#FCD34D', marginBottom: 20 }}>
          一筆書きダンジョン
        </div>
        <div style={{ fontSize: 36, marginBottom: 16 }}>
          B{floor}F 到達
        </div>
        <div style={{ fontSize: 28, display: 'flex', gap: 40 }}>
          <span>Score: {score}pt</span>
          <span>討伐: {monsters}体</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
