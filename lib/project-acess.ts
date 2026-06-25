import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentIdentity() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const primaryEmail =
    user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId,
    )?.emailAddress ?? null;

  return { userId, email: primaryEmail };
}

export async function getAccessibleProject(roomId: string) {
  const identity = await getCurrentIdentity();
  if (!identity) return null;

  const accessClauses = [
    { ownerId: identity.userId },
    ...(identity.email
      ? [{ collaborators: { some: { email: identity.email } } }]
      : []),
  ];

  const project = await prisma.project.findFirst({
    where: {
      id: roomId,
      OR: accessClauses,
    },
  });

  return project;
}