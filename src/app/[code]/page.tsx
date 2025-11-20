// app/[code]/page.tsx - ALTERNATIVE VERSION
import { db } from '../lib/DataBase';
import { redirect } from 'next/navigation';

export default async function RedirectPage(props: any) {
  console.log('🔍 DEBUG - Full props:', props);
  
  const params = await props.params;

  const code = params?.code;
  
  
  const link = await db.getLinkByCode(code);
  
  if (!link) {
    return <div>No link found for: {code}</div>;
  }
  
  redirect(link.long_url);
}

export const dynamic = 'force-dynamic';