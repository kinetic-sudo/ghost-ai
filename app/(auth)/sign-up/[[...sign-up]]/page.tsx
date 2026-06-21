import { SignUp } from "@clerk/nextjs";

import { AuthLayout } from "@/components/auth/auth-layout";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp appearance={clerkAuthAppearance} routing="path" path="/sign-up" />
    </AuthLayout>
  );
}
