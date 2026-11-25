const MAX_TRACKED_CLIENTS = 2000;

/**
 * Fixed-window limiter: at most `max` hits per `windowMs` for each key.
 * State lives in memory, so on serverless hosting it is per instance. That makes it a best-effort speed
 * bump against casual abuse, not a hard guarantee. `now` is injectable so tests can control time.
 */
function createRateLimiter({ max, windowMs, now = Date.now }) {
  const windows = new Map();

  function pruneExpired(time) {
    if (windows.size < MAX_TRACKED_CLIENTS) return;
    windows.forEach((entry, key) => {
      if (time - entry.start >= windowMs) windows.delete(key);
    });
  }

  return {
    /** Records a hit for `key` and returns whether it is still within the limit. */
    allow(key) {
      const time = now();
      const entry = windows.get(key);
      if (!entry || time - entry.start >= windowMs) {
        pruneExpired(time);
        windows.set(key, { start: time, count: 1 });
        return true;
      }
      entry.count += 1;
      return entry.count <= max;
    },
  };
}

module.exports = { createRateLimiter };
