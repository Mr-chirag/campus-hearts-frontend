export function TypingDots({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2" aria-live="polite">
      <span className="flex gap-1 rounded-full bg-surface px-3 py-2.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-subtext"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </span>
      <span className="sr-only">{name} is typing</span>
    </div>
  );
}
