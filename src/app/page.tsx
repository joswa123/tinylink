import LinkTable from './components/LinkTable';
import { db } from './lib/DataBase';

export default async function Home() {
  const links = await db.getAllLinks();

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <LinkTable links={links} />
        </div>
      </div>
    </main>
  );
}