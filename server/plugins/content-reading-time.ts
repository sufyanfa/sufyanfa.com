// Nuxt Content's per-file parse hooks live on the Nitro runtime hook system
// (`nitroApp.hooks`), not the build-time `hooks` field in nuxt.config.ts —
// registering there silently never fires. See @nuxt/content's
// dist/runtime/server/storage.js `parseContent`.
function countWords(node: any): number {
  if (!node) return 0;
  if (node.type === "text" && typeof node.value === "string") {
    return node.value.trim().split(/\s+/).filter(Boolean).length;
  }
  if (Array.isArray(node.children)) {
    return node.children.reduce((sum: number, child: any) => sum + countWords(child), 0);
  }
  return 0;
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("content:file:afterParse", (file: any) => {
    if (file._path?.startsWith("/articles/") && file.body) {
      const words = countWords(file.body);
      // ~180 wpm silent-reading estimate for Arabic prose.
      file.readingTime = Math.max(1, Math.round(words / 180));
    }
  });
});
