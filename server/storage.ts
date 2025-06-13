import {
  users,
  posts,
  likes,
  follows,
  bookmarks,
  comments,
  type User,
  type UpsertUser,
  type InsertPost,
  type Post,
  type PostWithUser,
  type UserWithCounts,
  type InsertLike,
  type InsertFollow,
  type InsertBookmark,
  type InsertComment,
  type Comment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, ne, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserWithCounts(id: string, currentUserId?: string): Promise<UserWithCounts | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(limit?: number, offset?: number): Promise<UserWithCounts[]>;
  searchUsers(query: string, currentUserId?: string): Promise<UserWithCounts[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number, currentUserId?: string): Promise<PostWithUser | undefined>;
  getPosts(currentUserId?: string, limit?: number, offset?: number): Promise<PostWithUser[]>;
  getUserPosts(userId: string, currentUserId?: string, limit?: number, offset?: number): Promise<PostWithUser[]>;
  getExplorePosts(currentUserId?: string, limit?: number, offset?: number): Promise<PostWithUser[]>;
  getFeedPosts(userId: string, limit?: number, offset?: number): Promise<PostWithUser[]>;
  deletePost(id: number, userId: string): Promise<boolean>;
  
  // Like operations
  likePost(userId: string, postId: number): Promise<boolean>;
  unlikePost(userId: string, postId: number): Promise<boolean>;
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<boolean>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<UserWithCounts[]>;
  getFollowing(userId: string): Promise<UserWithCounts[]>;
  
  // Bookmark operations
  bookmarkPost(userId: string, postId: number): Promise<boolean>;
  unbookmarkPost(userId: string, postId: number): Promise<boolean>;
  getUserBookmarks(userId: string, limit?: number, offset?: number): Promise<PostWithUser[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number, limit?: number, offset?: number): Promise<(Comment & { user: User })[]>;
  
  // Admin operations
  getPostsWithUsers(limit?: number, offset?: number): Promise<PostWithUser[]>;
  banUser(userId: string): Promise<boolean>;
  deletePostAsAdmin(postId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserWithCounts(id: string, currentUserId?: string): Promise<UserWithCounts | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;

    const [followersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, id));

    const [followingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, id));

    const [postsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.userId, id));

    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const [follow] = await db
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, id)));
      isFollowing = !!follow;
    }

    return {
      ...user,
      followersCount: followersCount.count,
      followingCount: followingCount.count,
      postsCount: postsCount.count,
      isFollowing,
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(limit = 50, offset = 0): Promise<UserWithCounts[]> {
    const usersList = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const usersWithCounts = await Promise.all(
      usersList.map(async (user) => {
        const [followersCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followingId, user.id));

        const [followingCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followerId, user.id));

        const [postsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(eq(posts.userId, user.id));

        return {
          ...user,
          followersCount: followersCount.count,
          followingCount: followingCount.count,
          postsCount: postsCount.count,
        };
      })
    );

    return usersWithCounts;
  }

  async searchUsers(query: string, currentUserId?: string): Promise<UserWithCounts[]> {
    const usersList = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.firstName, `%${query}%`),
          ilike(users.lastName, `%${query}%`)
        )
      )
      .limit(20);

    const usersWithCounts = await Promise.all(
      usersList.map(async (user) => {
        const [followersCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followingId, user.id));

        const [followingCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followerId, user.id));

        const [postsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(eq(posts.userId, user.id));

        let isFollowing = false;
        if (currentUserId && currentUserId !== user.id) {
          const [follow] = await db
            .select()
            .from(follows)
            .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)));
          isFollowing = !!follow;
        }

        return {
          ...user,
          followersCount: followersCount.count,
          followingCount: followingCount.count,
          postsCount: postsCount.count,
          isFollowing,
        };
      })
    );

    return usersWithCounts;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async getPost(id: number, currentUserId?: string): Promise<PostWithUser | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id));

    if (!post) return undefined;

    const postLikes = await db.select().from(likes).where(eq(likes.postId, id));
    const postComments = await db.select().from(comments).where(eq(comments.postId, id));
    const postBookmarks = await db.select().from(bookmarks).where(eq(bookmarks.postId, id));

    const [repostsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.originalPostId, id));

    let isLiked = false;
    let isBookmarked = false;

    if (currentUserId) {
      isLiked = postLikes.some(like => like.userId === currentUserId);
      isBookmarked = postBookmarks.some(bookmark => bookmark.userId === currentUserId);
    }

    return {
      ...post.posts,
      user: post.users,
      likes: postLikes,
      comments: postComments,
      bookmarks: postBookmarks,
      isLiked,
      isBookmarked,
      likesCount: postLikes.length,
      commentsCount: postComments.length,
      repostsCount: repostsCount.count,
    };
  }

  async getPosts(currentUserId?: string, limit = 20, offset = 0): Promise<PostWithUser[]> {
    const postsList = await db
      .select()
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return await this.enrichPostsWithMetadata(postsList, currentUserId);
  }

  async getUserPosts(userId: string, currentUserId?: string, limit = 20, offset = 0): Promise<PostWithUser[]> {
    const postsList = await db
      .select()
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return await this.enrichPostsWithMetadata(postsList, currentUserId);
  }

  async getExplorePosts(currentUserId?: string, limit = 20, offset = 0): Promise<PostWithUser[]> {
    return this.getPosts(currentUserId, limit, offset);
  }

  async getFeedPosts(userId: string, limit = 20, offset = 0): Promise<PostWithUser[]> {
    const followingIds = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    if (followingIds.length === 0) {
      return [];
    }

    const postsList = await db
      .select()
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(
        or(
          ...followingIds.map(f => eq(posts.userId, f.followingId)),
          eq(posts.userId, userId)
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return await this.enrichPostsWithMetadata(postsList, userId);
  }

  private async enrichPostsWithMetadata(postsList: any[], currentUserId?: string): Promise<PostWithUser[]> {
    return await Promise.all(
      postsList.map(async (post) => {
        const postLikes = await db.select().from(likes).where(eq(likes.postId, post.posts.id));
        const postComments = await db.select().from(comments).where(eq(comments.postId, post.posts.id));
        const postBookmarks = await db.select().from(bookmarks).where(eq(bookmarks.postId, post.posts.id));

        const [repostsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(eq(posts.originalPostId, post.posts.id));

        let isLiked = false;
        let isBookmarked = false;

        if (currentUserId) {
          isLiked = postLikes.some(like => like.userId === currentUserId);
          isBookmarked = postBookmarks.some(bookmark => bookmark.userId === currentUserId);
        }

        return {
          ...post.posts,
          user: post.users,
          likes: postLikes,
          comments: postComments,
          bookmarks: postBookmarks,
          isLiked,
          isBookmarked,
          likesCount: postLikes.length,
          commentsCount: postComments.length,
          repostsCount: repostsCount.count,
        };
      })
    );
  }

  async deletePost(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .returning();
    return Array.isArray(result) && result.length > 0;
  }

  async likePost(userId: string, postId: number): Promise<boolean> {
    try {
      await db.insert(likes).values({ userId, postId });
      return true;
    } catch {
      return false;
    }
  }

  async unlikePost(userId: string, postId: number): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .returning();
    return result.length > 0;
  }

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      await db.insert(follows).values({ followerId, followingId });
      return true;
    } catch {
      return false;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .returning();
    return result.length > 0;
  }

  async getFollowers(userId: string): Promise<UserWithCounts[]> {
    const followersList = await db
      .select()
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));

    return await Promise.all(
      followersList.map(async (item) => {
        const user = item.users;
        const [followersCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followingId, user.id));

        const [followingCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followerId, user.id));

        const [postsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(eq(posts.userId, user.id));

        return {
          ...user,
          followersCount: followersCount.count,
          followingCount: followingCount.count,
          postsCount: postsCount.count,
        };
      })
    );
  }

  async getFollowing(userId: string): Promise<UserWithCounts[]> {
    const followingList = await db
      .select()
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));

    return await Promise.all(
      followingList.map(async (item) => {
        const user = item.users;
        const [followersCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followingId, user.id));

        const [followingCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(eq(follows.followerId, user.id));

        const [postsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(eq(posts.userId, user.id));

        return {
          ...user,
          followersCount: followersCount.count,
          followingCount: followingCount.count,
          postsCount: postsCount.count,
        };
      })
    );
  }

  async bookmarkPost(userId: string, postId: number): Promise<boolean> {
    try {
      await db.insert(bookmarks).values({ userId, postId });
      return true;
    } catch {
      return false;
    }
  }

  async unbookmarkPost(userId: string, postId: number): Promise<boolean> {
    const result = await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
      .returning();
    return result.length > 0;
  }

  async getUserBookmarks(userId: string, limit = 20, offset = 0): Promise<PostWithUser[]> {
    const bookmarksList = await db
      .select()
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    return await this.enrichPostsWithMetadata(
      bookmarksList.map(item => ({ posts: item.posts, users: item.users })),
      userId
    );
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getPostComments(postId: number, limit = 20, offset = 0): Promise<(Comment & { user: User })[]> {
    const commentsList = await db
      .select()
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    return commentsList.map(item => ({
      ...item.comments,
      user: item.users,
    }));
  }

  async getPostsWithUsers(limit = 50, offset = 0): Promise<PostWithUser[]> {
    return this.getPosts(undefined, limit, offset);
  }

  async banUser(userId: string): Promise<boolean> {
    // In a real app, you might have a "banned" field or delete the user
    // For now, we'll just return true
    return true;
  }

  async deletePostAsAdmin(postId: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, postId)).returning();
    return Array.isArray(result) && result.length > 0;
  }
}

export const storage = new DatabaseStorage();
