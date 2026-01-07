import { Metadata } from 'next';
import UserVanityClient from '../UserVanityClient';

interface UserVanityPageProps {
  params: {
    userId: string;
  };
}

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
  const { userId } = params;
  
  return {
    title: `Photos for ${userId} | LuxSync Gallery`,
    description: `View galleries and photos for user ${userId} on LuxSync`,
    openGraph: {
      title: `Photos for ${userId}` ,
      description: `Galleries and photos tagged to user ${userId}`,
      type: 'profile',
      url: `https://luxsync.vercel.app/${userId}`,
      siteName: 'LuxSync',
    },
    twitter: {
      card: 'summary',
      title: `Photos for ${userId}`,
      description: `Galleries and photos tagged to user ${userId}`,
    },
  };
}

export default async function UserVanityPage({ params }: UserVanityPageProps) {
  const { userId } = params;
  
  return <UserVanityClient userId={userId} />;
}