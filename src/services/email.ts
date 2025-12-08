/**
 * Email Service
 * Client-side helper for sending emails via Supabase Edge Function
 */
import { supabase } from './supabaseClient';

export type EmailTemplate = 'welcome' | 'weekly_digest' | 'password_reset';

interface SendEmailParams {
    to: string | string[];
    template: EmailTemplate;
    data?: Record<string, any>;
}

interface SendCustomEmailParams {
    to: string | string[];
    customSubject: string;
    customHtml: string;
}

interface EmailResult {
    success: boolean;
    id?: string;
    error?: string;
}

/**
 * Send a templated email
 */
export async function sendTemplatedEmail({
    to,
    template,
    data,
}: SendEmailParams): Promise<EmailResult> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase client not initialized' };
        }
        const { data: result, error } = await supabase.functions.invoke('send-email', {
            body: { to, template, data },
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }

        return result as EmailResult;
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send a custom email with your own HTML
 */
export async function sendCustomEmail({
    to,
    customSubject,
    customHtml,
}: SendCustomEmailParams): Promise<EmailResult> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase client not initialized' };
        }
        const { data: result, error } = await supabase.functions.invoke('send-email', {
            body: { to, customSubject, customHtml },
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }

        return result as EmailResult;
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<EmailResult> {
    return sendTemplatedEmail({
        to: email,
        template: 'welcome',
        data: { name },
    });
}

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigest(
    email: string,
    options: {
        name?: string;
        featuredComposer?: string;
        composerBlurb?: string;
        quizScore?: number;
    }
): Promise<EmailResult> {
    return sendTemplatedEmail({
        to: email,
        template: 'weekly_digest',
        data: options,
    });
}
