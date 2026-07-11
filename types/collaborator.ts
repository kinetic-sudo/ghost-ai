export interface Collaborator {
    email: string;
    createdAt: string;
    name: string | null;
    imageUrl: string | null;
    isOwner?: boolean;
  }