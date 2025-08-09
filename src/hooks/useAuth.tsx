import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'management_board' | 'high_board' | 'member';
  department?: 'IT' | 'Organizing' | 'Graphic Design' | 'Public Relations' | 'Treasury' | 'Marketing & Social Media' | 'Content Writing' | 'HR';
  position?: string;
  avatar_url?: string;
  phone_number?: string;
  is_active?: boolean;
  points: number;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer profile fetching to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!data) {
        // Create a minimal profile if missing (handles legacy accounts)
        const { data: userRes } = await supabase.auth.getUser();
        const u = userRes?.user;
        const meta: any = u?.user_metadata ?? {};
        const insertPayload: any = {
          user_id: userId,
          email: u?.email ?? '',
          full_name: meta.full_name || u?.email?.split('@')[0] || 'User',
          role: 'member',
          department: meta.department ?? null,
          phone_number: meta.phone_number ?? null,
        };
        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert(insertPayload)
          .select('*')
          .maybeSingle();

        if (insertError) {
          console.error('Error creating missing profile:', insertError);
          return;
        }
        setProfile(created as any);
        return;
      }

      setProfile(data as any);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'management_board' | 'high_board' | 'member';
    department?: string;
    phone_number?: string;
  }) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.full_name,
            role: data.role,
            department: data.department,
            phone_number: data.phone_number,
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful!",
        description: "Please check your email to confirm your account.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error in signUp:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error in signIn:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error in signOut:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out",
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred during password reset",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Send approval email after first sign-in if account not active
  useEffect(() => {
    if (user && profile) {
      if (profile.is_active === false) {
        const key = `approval_sent:${user.id}`;
        if (!localStorage.getItem(key)) {
          supabase.functions.invoke('registration-approval', {
            body: {
              user_id: user.id,
              full_name: profile.full_name,
              email: profile.email,
              role: profile.role,
              department: profile.department,
              phone_number: profile.phone_number,
            }
          }).then(() => {
            localStorage.setItem(key, '1');
            toast({ title: 'Registration pending approval', description: 'We notified management to review your account.' });
          }).catch(() => {});
        }
      }
    }
  }, [user, profile]);

  const deleteAccount = async () => {
    try {
      const { error } = await supabase.functions.invoke('user-admin', { body: { action: 'delete_user' } });
      if (error) throw error;
      await supabase.auth.signOut();
      toast({ title: 'Account deleted' });
      return { error: null };
    } catch (error: any) {
      console.error('Error in deleteAccount:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    deleteAccount,
  };
};