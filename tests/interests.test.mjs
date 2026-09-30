import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const read = (file) => readFile(resolve(root, file), 'utf8');

const interestPages = [
  'interests/index.html',
  'interests/aviation/index.html',
  'interests/cars/index.html',
  'interests/weightlifting/index.html',
  'interests/food/index.html',
  'interests/places/index.html',
  'interests/finds/index.html',
];

test('Beyond Work exposes each interest as a navigable collection', async () => {
  const html = await read('interests/index.html');
  assert.match(html, /<h1[^>]*>Beyond Work\.?</i);

  for (const slug of ['aviation', 'cars', 'weightlifting', 'food', 'places', 'finds']) {
    assert.match(html, new RegExp(`href="${slug}/"`), `${slug} should be linked from the hub`);
    await access(resolve(root, 'interests', slug, 'index.html'));
  }
});

test('interest pages share working navigation back to the portfolio and collection', async () => {
  for (const file of interestPages) {
    const html = await read(file);
    const depth = file === 'interests/index.html' ? '..' : '../..';
    assert.match(html, new RegExp(`href="${depth}/index\\.html"`), `${file} should link home`);
    assert.match(html, new RegExp(`href="${depth === '..' ? './' : '../'}"[^>]*>Interests`), `${file} should link to Interests`);
  }
});

test('aviation collection retains its verified browser-safe flight media', async () => {
  const file = 'interests/aviation/index.html';
  const html = await read(file);
  assert.match(html, /<h1[^>]*>Flight &amp; Exploration<\/h1>/);
  assert.doesNotMatch(html, /I am a pilot|my aircraft|as a pilot/i);

  const sources = [...html.matchAll(/<source src="([^"]+)" type="video\/mp4"/g)].map((match) => match[1]);
  assert.ok(sources.length >= 3, 'expected at least three MP4 flight sources');
  assert.doesNotMatch(html, /\.(?:heic|mov)\b/i);
  assert.match(html, /<video[^>]*controls[^>]*preload="metadata"/);
  assert.doesNotMatch(html, /<video[^>]*autoplay/);
  for (const source of sources) await access(resolve(root, dirname(file), decodeURIComponent(source)));
});

test('aviation collection presents optimized flight photos as a lazy-loaded location gallery', async () => {
  const file = 'interests/aviation/index.html';
  const html = await read(file);
  const photos = [...html.matchAll(/<img\s+[^>]*src="([^"]+\.webp)"[^>]*>/g)];

  assert.ok(photos.length >= 12, 'expected a curated gallery of at least twelve WebP photos');
  assert.match(html, /class="flight-photo-gallery"/);
  assert.match(html, /<dialog[^>]*id="flightPhotoDialog"/);
  assert.match(html, /class="[^"]*\bflight-photo\b[^"]*"[^>]*data-full=/);
  for (const location of ['Monterey', 'San Jose', 'Alameda', 'Merced', 'Oakdale']) {
    assert.match(html, new RegExp(`data-location="${location}"`), `${location} should have a gallery group`);
  }
  assert.match(html, /USS Hornet Museum/);

  for (const [, source] of photos) {
    const tag = photos.find((match) => match[1] === source)[0];
    assert.match(tag, /loading="lazy"/);
    assert.match(tag, /decoding="async"/);
    assert.match(tag, /alt="[^"]+"/);
    await access(resolve(root, dirname(file), decodeURIComponent(source)));
  }
});

test('public navigation promotes Interests instead of a single hobby', async () => {
  for (const file of ['index.html', 'projects.html', 'resume.html', 'tools.html', 'about.html', 'contact.html']) {
    const html = await read(file);
    const links = html.match(/href="interests\/"/g) ?? [];
    assert.ok(links.length >= 2, `${file} should include desktop and mobile Interests links`);
  }
});

test('legacy aviation URL forwards visitors to the nested collection', async () => {
  const html = await read('aviation.html');
  assert.match(html, /http-equiv="refresh"[^>]*url=interests\/aviation\//i);
  assert.match(html, /rel="canonical" href="https:\/\/jerryp\.vercel\.app\/interests\/aviation\/"/);
});
