// The homepage owns the navigation markup; every generated page reuses it.
export function siteHeader(homepage, section) {
  const header = homepage.match(/<header id="site-navigation"[\s\S]*?<\/header>/)?.[0];
  if (!header) throw new Error('Shared site navigation is missing');
  const marker = `data-section="${section}"`;
  if (!header.includes(marker)) throw new Error(`Unknown navigation section: ${section}`);
  return header.replace(/ aria-current="page"/g, '').replace(marker, `${marker} aria-current="page"`);
}
