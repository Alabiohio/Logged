export function generateErrorFingerprint(
  message: string,
  stack?: string,
  pathname?: string
): string {
  // A simple way to generate a unique key for the error
  const parts = [message, pathname || ""];
  
  if (stack) {
    // Take the first few lines of the stack trace to avoid issues with 
    // highly dynamic frames, but keep enough context to uniquely identify it.
    const stackLines = stack.split("\n").slice(0, 3).join("\n");
    parts.push(stackLines);
  }

  return parts.join("|");
}

export class DuplicateFilter {
  private seen = new Map<string, number>();
  private readonly maxAgeMs = 10000; // 10 seconds timeout for duplicates
  private readonly maxEventsPerType = 5; // allow at most 5 similar errors per 10s

  shouldFilter(fingerprint: string): boolean {
    const now = Date.now();
    this.cleanup(now);

    const count = this.seen.get(fingerprint) || 0;
    
    if (count >= this.maxEventsPerType) {
      return true; // filter it out
    }

    this.seen.set(fingerprint, count + 1);
    return false; // allow it
  }

  private cleanup(now: number) {
    // Only cleanup occasionally to avoid overhead
    if (Math.random() > 0.1) return;
    
    // For simplicity, we just clear the whole map occasionally if it gets too large
    // A real implementation might store timestamps for each entry
    if (this.seen.size > 100) {
      this.seen.clear();
    }
  }
}
