import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { APP_URL } from "./site-config";
import * as schema from "./../db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications
        }
    }),
    baseURL: APP_URL,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            try {
                const verifyUrl = new URL(url);
                const token = verifyUrl.searchParams.get("token");
                const customUrl = `${APP_URL}/verify-email?token=${token}`;

                const result = await resend.emails.send({
                    from: "Logged <noreply@info.oheo.site>",
                    to: user.email,
                    subject: "Verify your email address",
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                            <img src="${APP_URL}/logo/logo.png" alt="Logged" width="120" style="display: block; margin-bottom: 24px;" />
                            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Welcome to <span class="color: #727D8F">Logged<span/></h1>
                            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                                Thanks for signing up! Please verify your email address to get started.
                            </p>
                            <a href="${customUrl}" style="display: inline-block; background: #727D8F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                                Verify Email
                            </a>
                            <p style="color: #888; font-size: 13px; margin-top: 24px;">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                        </div>
                    `,
                });
                console.log("Verification email sent:", result);
            } catch (error) {
                console.error("Failed to send verification email:", error);
                throw error;
            }
        },
    },
});
