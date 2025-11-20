// app/create/page.tsx - CREATE LINK PAGE
'use client';

import { useState } from 'react';
import { getShortUrl } from '../lib/utlis';
import Link from 'next/link';

// Types for our API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Link {
  id: number;
  short_code: string;
  long_url: string;
  click_count: number;
  last_clicked: string | null;
  created_at: string;
}

export default function CreateLinkPage() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customCode, setCustomCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      console.log('🔄 Sending API request...');
      
      // API call to create short link
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: longUrl,
          customCode: customCode || undefined,
        }),
      });

      // Parse the response
      const result: ApiResponse<Link> = await response.json();
      
      console.log('📨 API Response:', { status: response.status, result });

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success || !result.data) {
        throw new Error('Invalid response from server');
      }

      // Success! Show the short URL
      const shortCode = result.data.short_code;
      const generatedShortUrl = getShortUrl(shortCode);
      
      setShortUrl(generatedShortUrl);
      console.log('✅ Short URL created:', generatedShortUrl);
      
      // Reset form
      setLongUrl('');
      setCustomCode('');
      
    } catch (err: any) {
      console.error('❌ API Error:', err);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create short link';
      
      if (err.message.includes('Custom code already exists')) {
        errorMessage = 'That custom code is already taken. Please try another one.';
      } else if (err.message.includes('Invalid URL format')) {
        errorMessage = 'Please enter a valid URL starting with http:// or https://';
      } else if (err.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = err.message || 'Something went wrong. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert('✅ Copied to clipboard!');
    } catch (err) {
      console.error('❌ Failed to copy:', err);
      alert('❌ Failed to copy to clipboard');
    }
  };

  const testShortUrl = () => {
    if (shortUrl) {
      window.open(shortUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Short Link</h1>
          <p className="text-gray-600">Shorten your URLs instantly with custom codes</p>
        </div>

        {/* BetaForm Content */}
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Long URL Input */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Long URL to shorten:
              </label>
              <input
                id="url"
                type="url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://example.com/very-long-url-path"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                disabled={loading}
              />
            </div>

            {/* Custom Code (Optional) */}
            <div>
              <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">
                Custom code (optional):
              </label>
              <input
                id="customCode"
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                placeholder="my-link"
                pattern="[A-Za-z0-9]{6,8}"
                title="6-8 letters or numbers"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for auto-generated code. 6-8 characters, letters and numbers only.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !longUrl}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Shortening...
                </>
              ) : (
                'Shorten URL'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm font-medium">Error</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {shortUrl && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 text-sm font-medium">Success!</p>
              </div>
              
              <p className="text-green-600 text-sm mb-3">Your short URL is ready:</p>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-green-300 rounded-md text-sm bg-white text-gray-900 font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  Copy
                </button>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={testShortUrl}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Test Redirect
                </button>
                <button
                  onClick={() => setShortUrl('')}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}