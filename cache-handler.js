const cache = new Map();

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    const data = cache.get(key);
    if (!data) return null;
    
    // Return null if data is expired
    if (data.expiresAt && Date.now() > data.expiresAt) {
      cache.delete(key);
      return null;
    }
    
    return data.value;
  }

  async set(key, data, ctx) {
    const ttl = ctx?.revalidate ? ctx.revalidate * 1000 : undefined;
    cache.set(key, {
      value: data,
      lastModified: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined,
      tags: ctx?.tags ?? [],
    });
  }

  async revalidateTag(tags) {
    tags = [tags].flat();
    for (let [key, value] of cache) {
      if (value.tags.some((tag) => tags.includes(tag))) {
        cache.delete(key);
      }
    }
  }
};
