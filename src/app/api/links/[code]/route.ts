// app/api/links/[code]/route.ts - DELETE ENDPOINT
import { NextRequest } from 'next/server';
import { db } from '../../../lib/DataBase';
import { ApiUtils } from '../../../lib/utlis';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    
    console.log('🗑️ DELETE request for code:', code);

    const deleted = await db.deleteLink(code);
    
    if (!deleted) {
      console.log('❌ Link not found for deletion:', code);
      return ApiUtils.error('Link not found', 404);
    }

    console.log('✅ Link deleted successfully:', code);
    return ApiUtils.success({ message: 'Link deleted successfully' });
    
  } catch (error) {
    console.error('❌ DELETE API error:', error);
    return ApiUtils.serverError();
  }
}

// Also add GET method for single link (if needed)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    
    console.log('📥 GET request for link:', code);

    const link = await db.getLinkByCode(code);
    
    if (!link) {
      return ApiUtils.error('Link not found', 404);
    }

    return ApiUtils.success(link);
    
  } catch (error) {
    console.error('❌ GET API error:', error);
    return ApiUtils.serverError();
  }
}