import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, twoFactor } from "better-auth/plugins";
import { db } from "./db";
import { APP_URL } from "./site-config";
import * as schema from "./../db/schema";
import { Resend } from "resend";
import { ensureFreeSub } from "./billing/subscription";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
            twoFactor: schema.twoFactors
        }
    }),
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        await ensureFreeSub(user.id);
                    } catch (error) {
                        console.error(`Failed to create free subscription for user ${user.id}:`, error);
                    }
                },
            },
        },
    },
    user: {
        deleteUser: {
            enabled: true,
        },
        additionalFields: {
            username: {
                type: "string",
                required: false,
            },
            displayUsername: {
                type: "string",
                required: false,
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
            },
        },
    },
    plugins: [
        username(),
        twoFactor({
            issuer: "Logged",
            allowPasswordless: true,
            otpOptions: {
                sendOTP: async ({ user, otp }) => {
                    const result = await resend.emails.send({
                        from: "Logged <noreply@info.oheo.site>",
                        to: user.email,
                        subject: "Your Logged verification code",
                        html: `
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a;">
                                <img src="${APP_URL}/logo/logo.png" alt="Logged" width="120" style="display: block; margin-bottom: 24px;" />
                                <h1 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 12px;">Two-Factor Authentication Code</h1>
                                <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
                                    Use the one-time code below to verify your sign-in to Logged:
                                </p>
                                <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827;">${otp}</span>
                                </div>
                                <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-bottom: 8px;">
                                    This code will expire in 3 minutes.
                                </p>
                                <p style="color: #9ca3af; font-size: 12px; line-height: 1.4;">
                                    If you didn't attempt to sign in to Logged, someone else may know your password. Please secure your account.
                                </p>
                            </div>
                        `,
                    });

                    if (result.error) {
                        throw new Error(
                            `Resend rejected the 2FA OTP email: ${result.error.message}`
                        );
                    }
                },
            },
        }),
    ],
    baseURL: APP_URL,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, token }) => {
            const resetUrl = `${APP_URL}/reset-password?token=${token}`;
            const result = await resend.emails.send({
                from: "Logged <noreply@info.oheo.site>",
                to: user.email,
                subject: "Reset your Logged password",
                html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                            <img src="${APP_URL}/logo/logo.png" alt="Logged" width="120" style="display: block; margin-bottom: 24px;" />
                            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
                            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                                We received a request to reset your password for your Logged account. Click the button below to set a new password.
                            </p>
                            <a href="${resetUrl}" style="display: inline-block; background: #727D8F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                                Reset Password
                            </a>
                            <p style="color: #888; font-size: 13px; margin-top: 24px;">
                                If you didn't request a password reset, you can safely ignore this email. The link is valid for 1 hour.
                            </p>
                        </div>
                `,
            });

            if (result.error) {
                throw new Error(
                    `Resend rejected the reset password email: ${result.error.message}`,
                );
            }
        },
    },
    emailVerification: {
        expiresIn: 60 * 60 * 24,
        sendOnSignUp: false,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const token = new URL(url).searchParams.get("token");
            if (!token) {
                throw new Error("Verification URL did not include a token");
            }

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

            if (result.error) {
                throw new Error(
                    `Resend rejected the verification email: ${result.error.message}`,
                );
            }
        },
    },
});
