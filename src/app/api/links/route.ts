// PURPOSE: Handle GET request to fetch all links

import { validateLinkCreation } from "@/app/lib/validation";
import { NextRequest } from "next/server";
import { ApiUtils } from "../../lib/utlis";
import { db } from "../../lib/DataBase";

// DATA FLOW: Frontend request → This function → Database → JSON response
export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/links - Fetching all links');
    
    // Call database to get all links
    const links = await db.getAllLinks();
    
    console.log(`✅ Found ${links.length} links`);
    
    // Return success response with data
    return ApiUtils.success(links);
    
  } catch (error) {
    console.error('❌ GET /api/links error:', error);
    return ApiUtils.serverError(); // Return 500 error
  }
}

// PURPOSE: Handle POST request to create new short link
// DATA FLOW: Frontend form → This function → Validation → Database → Response
export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/links - Creating new link');
    
    // STEP 1: Parse incoming JSON data
    const body = await request.json();
    const { url, customCode } = body;

    // STEP 2: Validate input data
    const validation = validateLinkCreation({ url, customCode });
    if (!validation.isValid) {
      return ApiUtils.error(validation.errors[0], 400); // Return 400 error
    }

    // STEP 3: Check for duplicate custom code
    if (customCode && await db.codeExists(customCode)) {
      return ApiUtils.conflict('Custom code already exists'); // Return 409 error
    }

    // STEP 4: Create the link in database
    const sanitizedUrl = url.trim();
    const link = await db.createLink(sanitizedUrl, customCode);
    
    // STEP 5: Return success with created link
    return ApiUtils.success(link, 201); // 201 = Created
    
  } catch (error: unknown) {
    // Handle specific database errors
    const err = error as { code?: string } | undefined;
    if (err?.code === '23505') { // PostgreSQL unique violation
      return ApiUtils.conflict('Custom code already exists');
    }
    
    console.error('❌ POST /api/links error:', error);
    return ApiUtils.serverError(); // Generic server error
  }
}