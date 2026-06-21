import { AuthBranding } from "@/components/auth/auth-branding";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col bg-surface px-12 py-10 xl:px-16">
        <AuthBranding />
      </div>
      <div className="flex w-full flex-1 items-center justify-center bg-base px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
