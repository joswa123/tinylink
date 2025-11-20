// components/LinkTable.tsx - FIXED VERSION
'use client';

import { Link } from '../lib/DataBase';
import { getShortUrl, truncateUrl, formatDate, formatNumber, copyToClipboard } from '../lib/utlis';
import { useState } from 'react';

interface LinkTableProps {
  links: Link[];
}

export default function LinkTable({ links }: LinkTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (shortCode: string) => {
    const shortUrl = getShortUrl(shortCode);
    const success = await copyToClipboard(shortUrl);
    
    if (success) {
      setCopiedCode(shortCode);
      // Reset after 2 seconds
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      alert('Failed to copy. Please try again or copy manually.');
    }
  };

  const handleDelete = async (shortCode: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${shortCode}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Show success message and reload
        alert('✅ Link deleted successfully!');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`❌ Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Network error - please check your connection.');
    }
  };

  const handleTestRedirect = (shortCode: string) => {
    // Open in new tab to test the redirect
    window.open(getShortUrl(shortCode), '_blank', 'noopener,noreferrer');
  };

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Short Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Clicks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Clicked
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {links.map((link) => (
            <tr key={link.id} className="hover:bg-gray-50">
              {/* Short Code */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-blue-600 font-medium">
                    {link.short_code}
                  </span>
                  <button
                    onClick={() => handleCopy(link.short_code)}
                    className={`p-1 rounded transition-colors ${
                      copiedCode === link.short_code 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                    title={copiedCode === link.short_code ? 'Copied!' : 'Copy short URL'}
                  >
                    {copiedCode === link.short_code ? '✅' : '📋'}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getShortUrl(link.short_code)}
                </div>
              </td>
              
              {/* Target URL */}
              <td className="px-6 py-4">
                <a 
                  href={link.long_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline max-w-xs truncate block"
                  title={link.long_url}
                >
                  {truncateUrl(link.long_url, 50)}
                </a>
              </td>
              
              {/* Clicks */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  link.click_count > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formatNumber(link.click_count)} clicks
                </span>
              </td>
              
              {/* Last Clicked */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(link.last_clicked)}
              </td>
              
              {/* Created */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(link.created_at)}
              </td>
              
              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestRedirect(link.short_code)}
                    className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
                    title="Test redirect"
                  >
                    🔗
                  </button>
                  
                  <button
                    onClick={() => handleDelete(link.short_code)}
                    className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
                    title="Delete link"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}