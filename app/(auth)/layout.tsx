import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Logged",
  },
  description: "Sign in or create an account on Logged to start monitoring your applications.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
