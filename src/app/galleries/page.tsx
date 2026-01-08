import { getGalleries } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function GalleriesPage() {
  // Fetch all galleries from the database
  const galleries = await getGalleries();
  
  if (!galleries || galleries.length === 0) {
    // If no galleries exist, redirect to home
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Available Galleries</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <div 
            key={gallery.id} 
            className="border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white"
            onClick={() => {
              // Redirect to the gallery page
              window.location.href = `/gallery/${gallery.folder_name}`;
            }}
          >
            <h2 className="text-xl font-semibold mb-2">{gallery.title}</h2>
            <p className="text-gray-600 mb-1">{gallery.event_date}</p>
            <p className="text-sm text-gray-500">ID: {gallery.folder_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}