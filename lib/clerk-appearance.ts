import { dark } from "@clerk/ui/themes";

const clerkVariables = {
  colorPrimary: "var(--accent-primary)",
  colorPrimaryForeground: "var(--bg-base)",
  colorForeground: "var(--text-primary)",
  colorMutedForeground: "var(--text-muted)",
  colorBackground: "var(--bg-surface)",
  colorInput: "var(--bg-subtle)",
  colorInputForeground: "var(--text-primary)",
  colorBorder: "var(--border-default)",
  colorRing: "var(--accent-primary)",
  colorMuted: "var(--bg-subtle)",
  colorNeutral: "var(--text-primary)",
  borderRadius: "var(--radius)",
  fontFamily: "var(--font-sans)",
  fontFamilyButtons: "var(--font-sans)",
};

const clerkElements = {
  card: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    boxShadow: "none",
  },
  headerTitle: {
    color: "var(--text-primary)",
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  headerSubtitle: {
    color: "var(--text-muted)",
  },
  socialButtonsBlockButton: {
    backgroundColor: "var(--bg-subtle)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "var(--bg-elevated)",
    },
  },
  formFieldInput: {
    backgroundColor: "var(--bg-subtle)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
  },
  formButtonPrimary: {
    backgroundColor: "var(--accent-primary)",
    color: "var(--bg-base)",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "var(--accent-primary)",
      opacity: 0.9,
    },
  },
  footerActionLink: {
    color: "var(--accent-primary)",
    "&:hover": {
      color: "var(--accent-primary)",
      opacity: 0.85,
    },
  },
  dividerLine: {
    backgroundColor: "var(--border-default)",
  },
  dividerText: {
    color: "var(--text-muted)",
  },
  formFieldLabel: {
    color: "var(--text-primary)",
  },
};

export const clerkAppearance = {
  theme: dark,
  variables: clerkVariables,
  elements: clerkElements,
};

export const clerkAuthAppearance = {
  theme: dark,
  variables: clerkVariables,
  elements: {
    ...clerkElements,
    rootBox: {
      width: "100%",
    },
    cardBox: {
      width: "100%",
      boxShadow: "none",
    },
  },
};
