import { Metadata } from 'next';
import UserGalleryClient from '../UserGalleryClient';

interface UserGalleryPageProps {
  params: {
    userId: string;
  };
}

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
  const { userId } = params;
  
  return {
    title: `Photos for ${userId} | LuxSync Gallery`,
    description: `View photos for user ${userId} on LuxSync`,
    openGraph: {
      title: `Photos for ${userId}` ,
      description: `Photos tagged to user ${userId}`,
      type: 'profile',
      url: `https://luxsync.vercel.app/${userId}`,
      siteName: 'LuxSync',
    },
    twitter: {
      card: 'summary',
      title: `Photos for ${userId}`,
      description: `Photos tagged to user ${userId}`,
    },
  };
}

export default async function UserGalleryPage({ params }: UserGalleryPageProps) {
  const { userId } = params;
  
  return <UserGalleryClient userId={userId} />;
}