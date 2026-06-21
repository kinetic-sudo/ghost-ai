import { SignIn } from "@clerk/nextjs";

import { AuthLayout } from "@/components/auth/auth-layout";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn appearance={clerkAuthAppearance} routing="path" path="/sign-in" />
    </AuthLayout>
  );
}
