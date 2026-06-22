import { ProjectDialogsProvider } from "@/components/editor/project-dialog-context";
import { EditorLayout } from "@/components/editor/editor-layout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectDialogsProvider>
      <EditorLayout>{children}</EditorLayout>
    </ProjectDialogsProvider>
  );
}