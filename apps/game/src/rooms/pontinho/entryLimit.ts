export const CLIENT_IP_HEADER = "cf-connecting-ip";

const WINDOW_MS = 60_000;
const MAX_ENTRIES_PER_WINDOW = 30;

const entriesByIp = new Map<string, number>();

export const entryLimit = {
  allow(ip: string) {
    const entries = (entriesByIp.get(ip) ?? 0) + 1;
    entriesByIp.set(ip, entries);
    return entries <= MAX_ENTRIES_PER_WINDOW;
  },

  reset() {
    entriesByIp.clear();
  },
};

setInterval(entryLimit.reset, WINDOW_MS).unref();
