// Liveblocks type definitions for this application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data

declare global {
  interface Liveblocks {
    // Each user's real-time presence data
    Presence: {
      /** Cursor position on the canvas, null when cursor is off-screen */
      cursor: { x: number; y: number } | null;
      /** True while the user's AI request is in-flight */
      isThinking: boolean;
    };

    // Persistent shared canvas data — populated in the canvas feature spec
    Storage: {};

    // Static metadata attached to each user's session
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    // Custom broadcast events between clients
    RoomEvent: {};

    // Comment thread metadata
    ThreadMetadata: {};

    // Room-level metadata
    RoomInfo: {};
  }
}

export {};