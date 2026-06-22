'use client'

import { EditorLayout } from "@/components/editor/editor-layout";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const dialogs = useProjectDialogs()
  return <EditorLayout dialogs={dialogs}>{children}</EditorLayout>;
}
