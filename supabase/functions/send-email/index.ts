import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email templates
const templates: Record<string, (data: Record<string, any>) => { subject: string; html: string }> = {
    welcome: (data) => ({
        subject: 'Welcome to Classical Music Companion! 🎼',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎼 Welcome to Classical Music Companion</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name || 'Music Lover'},</p>
            <p>Thank you for joining our community of classical music enthusiasts!</p>
            <p>Here's what you can explore:</p>
            <ul>
              <li>🎹 100+ Composer profiles</li>
              <li>📚 Musical terminology glossary</li>
              <li>🕰️ Timeline of musical eras</li>
              <li>🏛️ Famous concert halls</li>
              <li>🎯 Daily quizzes to test your knowledge</li>
            </ul>
            <a href="https://yourapp.com" class="button">Open the App</a>
          </div>
          <div class="footer">
            <p>Happy listening! 🎶</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    weekly_digest: (data) => ({
        subject: `This Week in Classical Music: ${data.featuredComposer || 'New Discoveries'}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a2e; color: white; padding: 30px; border-radius: 12px 12px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .composer-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 Your Weekly Digest</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name || 'Music Lover'},</p>
            
            <div class="composer-card">
              <h2>🎼 Featured Composer</h2>
              <p><strong>${data.featuredComposer || 'Johann Sebastian Bach'}</strong></p>
              <p>${data.composerBlurb || 'One of the greatest composers in Western music history.'}</p>
            </div>

            ${data.quizScore ? `
            <div class="composer-card">
              <h2>🎯 Your Quiz Stats</h2>
              <p>You scored ${data.quizScore}% this week!</p>
            </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    password_reset: (data) => ({
        subject: 'Reset Your Password - Classical Music Companion',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Password Reset Request</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${data.resetLink}" style="color: #667eea;">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    }),
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
            throw new Error('RESEND_API_KEY not configured');
        }

        const resend = new Resend(resendApiKey);
        const { to, template, data, customSubject, customHtml } = await req.json();

        if (!to) {
            throw new Error('Missing required field: to');
        }

        let subject: string;
        let html: string;

        if (template && templates[template]) {
            const templateResult = templates[template](data || {});
            subject = customSubject || templateResult.subject;
            html = customHtml || templateResult.html;
        } else if (customSubject && customHtml) {
            subject = customSubject;
            html = customHtml;
        } else {
            throw new Error('Either template or customSubject+customHtml required');
        }

        const fromEmail = Deno.env.get('FROM_EMAIL') || 'Classical Music <noreply@resend.dev>';

        const { data: result, error } = await resend.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, id: result?.id }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Function error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
