"use client";

import { useOthers } from "@liveblocks/react/suspense";

export function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence?.cursor) return null;

        const color = info?.color || "#00E5FF";
        const name = info?.name || "Anonymous";

        return (
          <div
            key={connectionId}
            className="pointer-events-none absolute left-0 top-0 z-50 transition-all duration-100 ease-linear will-change-transform"
            style={{
              transform: `translateX(${presence.cursor.x}px) translateY(${presence.cursor.y}px)`,
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="36"
              viewBox="0 0 24 36"
              fill="none"
              stroke="white"
              strokeWidth="2"
              xmlns="http://www.w3.org/2000/svg"
              style={{ fill: color }}
              className="drop-shadow-md"
            >
              <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" />
            </svg>
            
            {/* Name Badge */}
            <div
              className="absolute left-5 top-5 rounded-md px-2 py-1 text-xs font-medium text-white shadow-md whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </>
  );
}