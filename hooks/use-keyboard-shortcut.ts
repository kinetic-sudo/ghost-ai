"use client";

import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({
  zoomIn,
  zoomOut,
  undo,
  redo,
  canUndo,
  canRedo,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y -> Redo
      if (
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z") ||
        (isCmdOrCtrl && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      // Cmd/Ctrl + Z -> Undo
      if (isCmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Zoom in: '+' or '=' (without Cmd/Ctrl)
      if (!isCmdOrCtrl && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        zoomIn();
        return;
      }

      // Zoom out: '-' or '_' (without Cmd/Ctrl)
      if (!isCmdOrCtrl && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        zoomOut();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomIn, zoomOut, undo, redo, canUndo, canRedo]);
}