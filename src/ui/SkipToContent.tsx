export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="bg-background text-foreground not-focus:sr-only absolute left-0 top-0 z-20"
      tabIndex={0}
    >
      Skip to content
    </a>
  );
}
