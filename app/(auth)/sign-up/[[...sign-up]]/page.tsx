import { SignUp } from "@clerk/nextjs";

import { AuthLayout } from "@/components/auth/auth-layout";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

const signUpPath = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

export default function SignUpPage() {
  return (
    <AuthLayout>
     <SignUp
       appearance={clerkAuthAppearance}
       routing="path"
       path={signUpPath}
     />
    </AuthLayout>
  );
}
