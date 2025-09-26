// src/data/supabase_data.ts
import { supabase } from '../supabaseClient';
import type { Issue } from './issues.ts';

export const fetchIssues = async (): Promise<Issue[]> => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        status,
        department,
        created_at,
        completed_at,
        image_url,
        latitude,
        longitude,
        likes ( id ), 
        comments ( id ) 
      `);

    if (error) {
      console.error("Error fetching data:", error);
      return [];
    }

    // You should use the posts array directly for logic
    // The previous filter logic is now applied here
    
    // Transform the data, filtering out posts with null location data
    const transformedIssues: Issue[] = posts
      .filter(post => post.latitude !== null && post.longitude !== null) // Filter posts with valid coordinates
      .map((post: any) => ({
        id: post.id,
        title: post.topic, 
        description: post.content,
        status: post.status,
        department: post.department,
        location: { lat: post.latitude, lng: post.longitude },
        upvotes: post.likes.length,
        image: post.image_url,
        reportedDate: post.created_at,
        resolvedDate: post.completed_at,
      }));

    return transformedIssues;

  } catch (e) {
    console.error("An unexpected error occurred:", e);
    return [];
  }
};
