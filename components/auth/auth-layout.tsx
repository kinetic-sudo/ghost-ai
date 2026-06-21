import { AuthBranding } from "@/components/auth/auth-branding";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-base">
      <div className="hidden lg:flex lg:w-2/5 lg:flex-col lg:justify-center lg:border-r lg:border-surface-border lg:px-16 xl:px-20">
        <AuthBranding />
      </div>
      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 lg:w-3/5">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
