// src/data/supabase_data.ts
import { supabase } from '../supabaseClient';
import type { Issue } from './issues.ts'; // Use your existing Issue interface

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

    // Add this line to inspect the fetched data
    console.log("Fetched posts:", posts);

    // Filter out any posts with null location data
    const validPosts = posts.filter(post => post.latitude !== null && post.longitude !== null);

    // Transform the data to match the Issue interface
    const transformedIssues: Issue[] = posts.map((post: any) => ({
      id: post.id,
      title: post.topic, // You may need a 'title' column in your DB
      description: post.content,
      status: post.status,
      department: post.department,
      location: { lat: post.latitude, lng: post.longitude },
      upvotes: post.likes.length, // Count the number of likes
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