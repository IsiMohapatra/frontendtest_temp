import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await the params since it's a Promise in newer Next.js versions
    const resolvedParams = await params;
    
    // Join all path segments
    const fullPath = resolvedParams.path.join('/');
    
    // Handle both absolute and relative paths
    let imagePath;
    if (fullPath.startsWith('home/') || fullPath.startsWith('/home/')) {
      // Unix absolute path
      imagePath = `/${fullPath}`;
    } else if (fullPath.includes(':')) {
      // Windows absolute path (C:/ etc.)
      imagePath = fullPath.replace(/\//g, '\\');
    } else {
      // Relative path - you can set a default base directory
      imagePath = path.join(process.cwd(), 'public', 'images', fullPath);
    }
    
    console.log('Attempting to read image from:', imagePath);
    const imageBuffer = await readFile(imagePath);
    
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'image/png';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
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