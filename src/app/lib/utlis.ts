// lib/utils-minimal.ts - COMPLETE UTILITIES
import { NextResponse } from 'next/server';

// PURPOSE: Standardized API responses
export class ApiUtils {
  static success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json({ 
      success: true, 
      data 
    }, { status });
  }

  static error(message: string, status: number = 400): NextResponse {
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status });
  }

  static notFound(): NextResponse {
    return this.error('Resource not found', 404);
  }

  static conflict(message: string = 'Resource already exists'): NextResponse {
    return this.error(message, 409);
  }

  static serverError(): NextResponse {
    return this.error('Internal server error', 500);
  }
}

// PURPOSE: Generate random short codes
export function generateRandomCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// PURPOSE: Generate full short URL from short code
export function getShortUrl(shortCode: string): string {
  // Use environment variable in production, fallback for development
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${baseUrl}/${shortCode}`;
}

// PURPOSE: Simple copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

// PURPOSE: Truncate long URLs for display
export function truncateUrl(url: string, maxLength: number = 50): string {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search;
    
    // If hostname itself is too long
    if (hostname.length + 10 > maxLength) {
      return hostname.substring(0, maxLength - 3) + '...';
    }
    
    const availableLength = maxLength - hostname.length - 3; // -3 for "..."
    const truncatedPath = path.length > availableLength 
      ? path.substring(0, availableLength) + '...' 
      : path;
    
    return hostname + truncatedPath;
  } catch {
    // If URL parsing fails, use simple truncation
    return url.substring(0, maxLength - 3) + '...';
  }
}

// PURPOSE: Format dates in user-friendly way
export function formatDate(date: Date | string | null): string {
  if (!date) return 'Never';
  
  const targetDate = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  // If older than a month, show the date
  return targetDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// PURPOSE: Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}