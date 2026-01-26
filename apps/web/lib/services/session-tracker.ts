// apps/web/lib/services/session-tracker.ts
// Session Tracking Service - Tracks active user sessions in Supabase PostgreSQL

import { createClient } from '@/lib/supabase/server';

export interface ActiveSession {
  userId: string;
  username: string;
  name: string;
  role: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

class SessionTracker {
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Register a new active session
   */
  async registerSession(
    userId: string,
    username: string,
    name: string,
    role: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const supabase = await createClient();
      const now = new Date();
      
      const sessionData = {
        user_id: userId,
        username,
        name,
        role,
        login_time: now.toISOString(),
        last_activity: now.toISOString(),
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      };

      // Delete existing session for this user if any (upsert behavior)
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .then(() => {
          // Ignore error if session doesn't exist
        });

      // Create new session
      const { error } = await supabase
        .from('user_sessions')
        .insert(sessionData);

      if (error) {
        // Silently fail if table doesn't exist (migration not run yet)
        if (error.code === 'PGRST205') {
          // Table doesn't exist - migration 027 not run yet
          return; // Don't log, just return
        }
        console.error('Failed to register session:', error);
        // Don't throw - allow login to proceed even if session tracking fails
      }
    } catch (error: any) {
      // Silently fail if table doesn't exist (migration not run yet)
      if (error?.code === 'PGRST205') {
        return; // Don't log, just return
      }
      console.error('Failed to register session:', error);
      // Don't throw - allow login to proceed even if session tracking fails
    }
  }

  /**
   * Update last activity for a session
   */
  async updateActivity(userId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const now = new Date();
      
      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity: now.toISOString() })
        .eq('user_id', userId);

      if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
        // PGRST116 = not found, PGRST205 = table doesn't exist (migration not run yet)
        console.error('Failed to update session activity:', error);
      }
    } catch (error: any) {
      // Silently fail if table doesn't exist (migration not run yet)
      if (error?.code !== 'PGRST205') {
        console.error('Failed to update session activity:', error);
      }
    }
  }

  /**
   * Remove a session (on logout)
   */
  async removeSession(userId: string): Promise<void> {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

      if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
        // PGRST116 = not found, PGRST205 = table doesn't exist (migration not run yet)
        console.error('Failed to remove session:', error);
      }
    } catch (error: any) {
      // Silently fail if table doesn't exist (migration not run yet)
      if (error?.code === 'PGRST205') {
        return; // Don't log, just return
      }
      console.error('Failed to remove session:', error);
    }
  }

  /**
   * Get active sessions (for admin/staff dashboard)
   */
  async getActiveSessions(): Promise<ActiveSession[]> {
    try {
      const supabase = await createClient();
      const timeoutDate = new Date(Date.now() - this.SESSION_TIMEOUT);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('last_activity', timeoutDate.toISOString())
        .order('last_activity', { ascending: false });

      if (error) {
        // Silently fail if table doesn't exist (migration not run yet)
        if (error.code === 'PGRST205') {
          return [];
        }
        console.error('Failed to get active sessions:', error);
        return [];
      }

      return (data || []).map((session) => ({
        userId: session.user_id,
        username: session.username,
        name: session.name,
        role: session.role,
        loginTime: new Date(session.login_time),
        lastActivity: new Date(session.last_activity),
        ipAddress: session.ip_address || undefined,
        userAgent: session.user_agent || undefined,
      }));
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      return [];
    }
  }

  /**
   * Get session for a specific user
   */
  async getSession(userId: string): Promise<ActiveSession | null> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        if (error.code === 'PGRST205') {
          // Table doesn't exist - migration not run yet
          return null;
        }
        console.error('Failed to get session:', error);
        return null;
      }

      if (!data) return null;

      return {
        userId: data.user_id,
        username: data.username,
        name: data.name,
        role: data.role,
        loginTime: new Date(data.login_time),
        lastActivity: new Date(data.last_activity),
        ipAddress: data.ip_address || undefined,
        userAgent: data.user_agent || undefined,
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const supabase = await createClient();
      const timeoutDate = new Date(Date.now() - this.SESSION_TIMEOUT);
      
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .lt('last_activity', timeoutDate.toISOString());

      if (error) {
        // Silently fail if table doesn't exist (migration not run yet)
        if (error.code === 'PGRST205') {
          return;
        }
        console.error('Failed to cleanup expired sessions:', error);
      }
    } catch (error: any) {
      // Silently fail if table doesn't exist (migration not run yet)
      if (error?.code === 'PGRST205') {
        return;
      }
      console.error('Failed to cleanup expired sessions:', error);
    }
  }
}

// Singleton instance
export const sessionTracker = new SessionTracker();

// Note: Session cleanup should be handled by a cron job in production
// We don't run setInterval here because it would try to access cookies()
// outside of a request context, which causes errors
// See: /api/cron/cleanup-sessions for production cleanup

