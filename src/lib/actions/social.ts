"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Toggle like on experience
// ---------------------------------------------------------------------------

export async function toggleExperienceLike(experienceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("experience_likes")
    .select("id")
    .eq("experience_id", experienceId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("experience_likes").delete().eq("id", existing.id);
    return { liked: false };
  }

  const { error } = await supabase.from("experience_likes").insert({
    experience_id: experienceId,
    user_id: user.id,
  });

  if (error) return { error: error.message };
  return { liked: true };
}

// ---------------------------------------------------------------------------
// Toggle bookmark on experience
// ---------------------------------------------------------------------------

export async function toggleExperienceBookmark(experienceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("experience_bookmarks")
    .select("id")
    .eq("experience_id", experienceId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("experience_bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  }

  const { error } = await supabase.from("experience_bookmarks").insert({
    experience_id: experienceId,
    user_id: user.id,
  });

  if (error) return { error: error.message };
  return { bookmarked: true };
}

// ---------------------------------------------------------------------------
// Add comment
// ---------------------------------------------------------------------------

export async function addComment(experienceId: string, content: string, parentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("experience_comments")
    .insert({
      experience_id: experienceId,
      user_id: user.id,
      content,
      parent_id: parentId,
    })
    .select(
      `id, content, created_at, likes_count,
       profiles!experience_comments_user_id_fkey ( id, full_name, avatar_url )`
    )
    .single();

  if (error) return { error: error.message };
  return { comment: data };
}

// ---------------------------------------------------------------------------
// Delete comment
// ---------------------------------------------------------------------------

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("experience_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Get comments for experience
// ---------------------------------------------------------------------------

export async function getComments(experienceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("experience_comments")
    .select(
      `id, content, created_at, likes_count, parent_id,
       profiles!experience_comments_user_id_fkey ( id, full_name, avatar_url )`
    )
    .eq("experience_id", experienceId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Toggle like on comment
// ---------------------------------------------------------------------------

export async function toggleCommentLike(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("comment_likes").delete().eq("id", existing.id);
    return { liked: false };
  }

  const { error } = await supabase.from("comment_likes").insert({
    comment_id: commentId,
    user_id: user.id,
  });

  if (error) return { error: error.message };
  return { liked: true };
}

// ---------------------------------------------------------------------------
// Follow / Unfollow user
// ---------------------------------------------------------------------------

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === targetUserId) return { error: "No puedes seguirte a ti mismo" };

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .single();

  if (existing) {
    await supabase.from("follows").delete().eq("id", existing.id);
    return { following: false };
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  if (error) return { error: error.message };
  return { following: true };
}

// ---------------------------------------------------------------------------
// Check if following
// ---------------------------------------------------------------------------

export async function isFollowing(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .limit(1)
    .single();

  return !!data;
}

// ---------------------------------------------------------------------------
// Get user public profile
// ---------------------------------------------------------------------------

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, bio, created_at, followers_count, following_count, experiences_count")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  // Get user's experiences
  const { data: experiences } = await supabase
    .from("experiences")
    .select(
      `id, title, photos, location_name, rating, likes_count, comments_count, created_at, tags`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Check if current user follows
  let isFollowedByMe = false;
  if (user && user.id !== userId) {
    const { data: f } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .limit(1)
      .single();
    isFollowedByMe = !!f;
  }

  return {
    ...profile,
    experiences: experiences ?? [],
    isFollowedByMe,
    isOwnProfile: user?.id === userId,
  };
}

// ---------------------------------------------------------------------------
// Get followers / following
// ---------------------------------------------------------------------------

export async function getFollowers(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("profiles!follows_follower_id_fkey ( id, full_name, avatar_url )")
    .eq("following_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getFollowing(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("profiles!follows_following_id_fkey ( id, full_name, avatar_url )")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
