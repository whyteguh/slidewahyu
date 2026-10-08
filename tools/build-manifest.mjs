import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const decks = readdirSync('decks', { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(`decks/${d.name}/index.html`))
  .map(d => {
    const html = readFileSync(`decks/${d.name}/index.html`, 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || d.name;
    const slides = (html.match(/class="slide[\s"]/g) || []).length;
    return { slug: d.name, title, ...(slides && { slides }), path: `decks/${d.name}/` };
  })
  .sort((a, b) => b.slug.localeCompare(a.slug));

writeFileSync('manifest.json', JSON.stringify(decks, null, 2) + '\n');
console.log(`manifest.json → ${decks.length} deck`);
