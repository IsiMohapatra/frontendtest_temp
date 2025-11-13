import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    
    // Only allow access to images in the public folder
    const imagePath = path.join(
      process.cwd(), 
      'public', 
      'diagnostic-images', 
      ...resolvedParams.path
    );
    
    // Security check: ensure path is within public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!imagePath.startsWith(publicDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    console.log('Reading image from:', imagePath);
    const imageBuffer = await readFile(imagePath);
    
    const ext = path.extname(resolvedParams.path[resolvedParams.path.length - 1]).toLowerCase();
    let contentType = 'image/png';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Image not found:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
}