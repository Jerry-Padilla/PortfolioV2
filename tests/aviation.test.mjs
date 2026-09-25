import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const read = (file) => readFile(resolve(root, file), 'utf8');

test('aviation page provides the interests framing and restrained flight copy', async () => {
  const html = await read('aviation.html');
  assert.match(html, /<title>Flight &amp; Exploration/);
  assert.match(html, /<h1[^>]*>Flight &amp; Exploration<\/h1>/);
  assert.match(html, /Personal Interests/);
  assert.match(html, /long-standing personal interest/i);
  assert.doesNotMatch(html, /I am a pilot|my aircraft|as a pilot/i);
});

test('aviation page groups verified media by locations present in the repository', async () => {
  const html = await read('aviation.html');
  for (const location of ['Monterey, California', 'San Jose, California', 'Salinas, California']) {
    assert.match(html, new RegExp(location.replace(',', ',?')));
  }
  assert.doesNotMatch(html, /Laguna Seca from the air/i);
});

test('aviation media uses browser-safe sources and conservative loading behavior', async () => {
  const html = await read('aviation.html');
  const sources = [...html.matchAll(/<source src="([^"]+)" type="video\/mp4"/g)].map((match) => match[1]);
  assert.ok(sources.length >= 3, 'expected at least three MP4 flight sources');
  assert.doesNotMatch(html, /\.(?:heic|mov)\b/i);
  assert.match(html, /<video[^>]*controls[^>]*preload="metadata"/);
  assert.doesNotMatch(html, /<video[^>]*autoplay/);
  for (const source of sources) await access(resolve(root, decodeURIComponent(source)));
});

test('all public pages include Aviation in desktop and mobile navigation', async () => {
  for (const file of ['index.html', 'projects.html', 'resume.html', 'tools.html', 'about.html', 'contact.html', 'aviation.html']) {
    const html = await read(file);
    const links = html.match(/href="aviation\.html"/g) ?? [];
    assert.ok(links.length >= 2, `${file} should contain desktop and mobile Aviation links`);
  }
});

test('aviation page links back to Projects and Resume', async () => {
  const html = await read('aviation.html');
  assert.match(html, /href="projects\.html"/);
  assert.match(html, /href="resume\.html"/);
});
