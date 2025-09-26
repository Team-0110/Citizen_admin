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
    // This variable is now used below, resolving the warning.
    const validPosts = posts.filter(post => post.latitude !== null && post.longitude !== null);

    // Transform the data to match the Issue interface
    // CORRECTION: Used 'validPosts' instead of 'posts' to resolve the unused variable warning.
    const transformedIssues: Issue[] = validPosts.map((post: any) => ({
      id: post.id,
      title: post.topic, // Assuming 'topic' is the column for the title
      description: post.content,
      status: post.status,
      department: post.department,
      // The filter above ensures latitude and longitude are not null
      location: { lat: post.latitude!, lng: post.longitude! }, 
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
