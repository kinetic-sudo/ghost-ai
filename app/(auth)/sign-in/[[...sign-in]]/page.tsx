import { SignIn } from "@clerk/nextjs";

import { AuthLayout } from "@/components/auth/auth-layout";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

const signInPath = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";

export default function SignInPage() {
  return (
    <AuthLayout>
     <SignIn
       appearance={clerkAuthAppearance}
       routing="path"
       path={signInPath}
     />
    </AuthLayout>
  );
}
