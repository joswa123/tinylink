// PURPOSE: Validate URL format
// DATA FLOW: User input → This function → Return true/false
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Must be http or https protocol
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false; // Invalid URL format
  }
}

// PURPOSE: Validate custom code format
// DATA FLOW: Custom code input → This function → Return true/false
export function isValidCustomCode(code: string): boolean {
  // 6-8 characters, only letters and numbers
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

// PURPOSE: Comprehensive validation for link creation
// DATA FLOW: API request → This function → Return validation result
export function validateLinkCreation(data: { url: string; customCode?: string }) {
  const errors: string[] = [];

  // Check URL exists and is valid
  if (!data.url) {
    errors.push('URL is required');
  } else if (!isValidUrl(data.url)) {
    errors.push('Invalid URL format. Must start with http:// or https://');
  }

  // Check custom code format if provided
  if (data.customCode && !isValidCustomCode(data.customCode)) {
    errors.push('Custom code must be 6-8 alphanumeric characters');
  }

  return {
    isValid: errors.length === 0,
    errors // Array of error messages
  };
}