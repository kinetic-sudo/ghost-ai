"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react/suspense";

export function PresenceUI() {
  const { user } = useUser();
  const others = useOthers();

  // Filter out any presence entry that matches the current Clerk user ID
  const collaborators = others.filter((other) => other.id !== user?.id);
  
  const maxVisible = 5;
  const visibleCollaborators = collaborators.slice(0, maxVisible);
  const overflowCount = collaborators.length - maxVisible;

  return (
    <div className="absolute right-4 top-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#121212]/90 p-2 shadow-xl backdrop-blur-md">
      {/* Collaborator Avatars (Only show if collaborators exist) */}
      {collaborators.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {visibleCollaborators.map((collaborator) => {
              const name = collaborator.info?.name || "Anonymous";
              const avatar = collaborator.info?.avatar;
              const color = collaborator.info?.color || "#00E5FF";
              const initials = name.charAt(0).toUpperCase();

              return (
                <div
                  key={collaborator.connectionId}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#121212] bg-neutral-800 ring-1 ring-white/10"
                  style={{ backgroundColor: color }}
                  title={name}
                >
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt={name} 
                      className="h-full w-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-xs font-medium text-white">{initials}</span>
                  )}
                </div>
              );
            })}
            
            {/* Overflow Chip */}
            {overflowCount > 0 && (
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#121212] bg-neutral-700 ring-1 ring-white/10">
                <span className="text-xs font-medium text-white">+{overflowCount}</span>
              </div>
            )}
          </div>
          
          {/* Divider between collaborators and current user */}
          <div className="mx-3 h-6 w-px bg-white/10" />
        </div>
      )}
      
      {/* Current User Clerk Profile */}
      <div className="flex h-8 w-8 items-center justify-center">
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-1 ring-white/10"
            }
          }}
        />
      </div>
    </div>
  );
}