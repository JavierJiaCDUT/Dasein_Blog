import { access, mkdir, readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, resolve } from 'node:path';
import sharp from 'sharp';

const WIDTH = 3200;
const HEIGHT = 1600;
const TEMPLATE_NAMES = new Set([
  'editorial-data',
  'editorial-concept',
  'editorial-person',
]);

type Brief = {
  template: string;
  output: string;
  visualThesis: string;
  kicker?: string;
  source?: string;
  primary: string;
  secondary?: string;
  descriptor?: string;
  footer?: string;
  annotation?: string;
  accent?: string;
  background?: string;
  text?: string;
  muted?: string;
  line?: string;
  modules?: string[];
  highlight?: string;
};

type Args = {
  briefPath: string;
  outputOverride?: string;
  force: boolean;
};

function usage(): never {
  console.error(
    'Usage: bun run hero:render -- <hero-brief.yml> [--out <output.png>] [--force]',
  );
  process.exit(1);
}

function parseArgs(argv: string[]): Args {
  let briefPath = '';
  let outputOverride: string | undefined;
  let force = false;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--force') {
      force = true;
      continue;
    }
    if (value === '--out') {
      outputOverride = argv[index + 1];
      if (!outputOverride) usage();
      index += 1;
      continue;
    }
    if (value.startsWith('--')) usage();
    if (briefPath) usage();
    briefPath = value;
  }

  if (!briefPath) usage();
  return { briefPath: resolve(briefPath), outputOverride, force };
}

function assertString(value: unknown, field: string, required = false): string {
  if (value === undefined || value === null) {
    if (required) throw new Error(`Missing required field: ${field}`);
    return '';
  }
  if (typeof value !== 'string') throw new Error(`${field} must be a string.`);
  const normalized = value.trim();
  if (required && !normalized) throw new Error(`${field} cannot be empty.`);
  if (normalized.length > 160) throw new Error(`${field} is too long for a hero image.`);
  return normalized;
}

function assertColor(value: unknown, field: string, fallback: string): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
    throw new Error(`${field} must be a six-digit hex color.`);
  }
  return value.toUpperCase();
}

function assertMaxLength(value: string, field: string, max: number) {
  if ([...value].length > max) {
    throw new Error(`${field} supports at most ${max} characters for this template.`);
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function validateBrief(raw: unknown): Brief {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('The brief must be a YAML object.');
  }

  const input = raw as Record<string, unknown>;
  const template = assertString(input.template, 'template', true);
  if (!TEMPLATE_NAMES.has(template)) {
    throw new Error(`Unknown template: ${template}`);
  }

  const modules = input.modules ?? [];
  if (!Array.isArray(modules) || modules.some((item) => typeof item !== 'string')) {
    throw new Error('modules must be a list of strings.');
  }
  if (modules.length > 6) throw new Error('modules supports at most six labels.');

  const brief: Brief = {
    template,
    output: assertString(input.output, 'output', true),
    visualThesis: assertString(input.visualThesis, 'visualThesis', true),
    kicker: assertString(input.kicker, 'kicker'),
    source: assertString(input.source, 'source'),
    primary: assertString(input.primary, 'primary', true),
    secondary: assertString(input.secondary, 'secondary'),
    descriptor: assertString(input.descriptor, 'descriptor'),
    footer: assertString(input.footer, 'footer'),
    annotation: assertString(input.annotation, 'annotation'),
    accent: assertColor(input.accent, 'accent', '#FF4D1A'),
    background: assertColor(input.background, 'background', '#050505'),
    text: assertColor(input.text, 'text', '#F4F2ED'),
    muted: assertColor(input.muted, 'muted', '#8A8A84'),
    line: assertColor(input.line, 'line', '#343434'),
    modules: modules.map((item) => item.trim()).filter(Boolean),
    highlight: assertString(input.highlight, 'highlight'),
  };

  assertMaxLength(brief.kicker ?? '', 'kicker', 36);
  assertMaxLength(brief.source ?? '', 'source', 24);
  assertMaxLength(brief.descriptor ?? '', 'descriptor', 30);
  assertMaxLength(brief.footer ?? '', 'footer', 30);
  assertMaxLength(brief.annotation ?? '', 'annotation', 28);
  for (const label of brief.modules ?? []) assertMaxLength(label, 'module label', 18);

  if (template === 'editorial-data') {
    assertMaxLength(brief.primary, 'primary', 10);
    assertMaxLength(brief.secondary ?? '', 'secondary', 14);
  }
  if (template === 'editorial-concept') {
    assertMaxLength(brief.primary, 'primary', 14);
    assertMaxLength(brief.secondary ?? '', 'secondary', 18);
  }
  if (template === 'editorial-person') {
    assertMaxLength(brief.primary, 'primary', 12);
    assertMaxLength(brief.secondary ?? '', 'secondary', 12);
  }

  if (brief.highlight && !brief.modules?.includes(brief.highlight)) {
    throw new Error('highlight must match one of the module labels.');
  }

  return brief;
}

function renderModules(brief: Brief): string {
  if (!brief.modules?.length) return '';

  const x = 1760;
  const width = 860;
  const height = 150;
  const gap = 54;
  const startY = 210;

  return brief.modules
    .map((label, index) => {
      const y = startY + index * (height + gap);
      const active = label === brief.highlight;
      const color = active ? brief.accent : brief.line;
      const labelColor = active ? brief.accent : brief.text;
      const annotation = active && brief.annotation
        ? `<line x1="${x + width + 18}" y1="${y + height / 2}" x2="${x + width + 48}" y2="${y + height / 2}" stroke="${brief.accent}" stroke-width="5" stroke-dasharray="14 10"/><text x="${x + width + 64}" y="${y + height / 2 + 11}" class="module-note" fill="${brief.accent}">${escapeXml(brief.annotation)}</text>`
        : '';

      return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="${color}" stroke-width="5"/><line x1="${x + 66}" y1="${y + 38}" x2="${x + 66}" y2="${y + 112}" stroke="${color}" stroke-width="5"/><text x="${x + 132}" y="${y + 96}" class="module-label" fill="${labelColor}">${escapeXml(label)}</text>${annotation}</g>`;
    })
    .join('');
}

function renderTokenMap(brief: Brief): Record<string, string> {
  return {
    BACKGROUND: brief.background ?? '#050505',
    TEXT: brief.text ?? '#F4F2ED',
    MUTED: brief.muted ?? '#8A8A84',
    LINE: brief.line ?? '#343434',
    ACCENT: brief.accent ?? '#FF4D1A',
    KICKER: escapeXml(brief.kicker ?? ''),
    SOURCE: escapeXml(brief.source ?? ''),
    PRIMARY: escapeXml(brief.primary),
    SECONDARY: escapeXml(brief.secondary ?? ''),
    DESCRIPTOR: escapeXml(brief.descriptor ?? ''),
    FOOTER: escapeXml(brief.footer ?? ''),
    ANNOTATION: escapeXml(brief.annotation ?? ''),
    MODULES: renderModules(brief),
  };
}

function fillTemplate(template: string, tokens: Record<string, string>): string {
  const rendered = template.replace(/\{\{([A-Z_]+)\}\}/g, (_match, token: string) => {
    if (!(token in tokens)) throw new Error(`Unknown template token: ${token}`);
    return tokens[token];
  });

  const unresolved = rendered.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved template tokens: ${unresolved.join(', ')}`);
  return rendered;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const briefSource = await readFile(args.briefPath, 'utf8');
  const brief = validateBrief(Bun.YAML.parse(briefSource));

  const templatePath = resolve(import.meta.dir, 'templates', `${brief.template}.svg`);
  const template = await readFile(templatePath, 'utf8');
  const svg = fillTemplate(template, renderTokenMap(brief));

  const requestedOutput = args.outputOverride ?? brief.output;
  const outputPath = isAbsolute(requestedOutput)
    ? requestedOutput
    : resolve(dirname(args.briefPath), requestedOutput);
  const extension = extname(outputPath).toLowerCase();

  if (!['.png', '.webp', '.jpg', '.jpeg'].includes(extension)) {
    throw new Error('Output must use .png, .webp, .jpg, or .jpeg.');
  }
  if (!args.force && await fileExists(outputPath)) {
    throw new Error(`Refusing to overwrite existing output: ${outputPath}. Use --force only after confirming replacement.`);
  }

  await mkdir(dirname(outputPath), { recursive: true });
  let pipeline = sharp(Buffer.from(svg)).resize(WIDTH, HEIGHT, { fit: 'fill' });
  if (extension === '.png') pipeline = pipeline.png({ compressionLevel: 9 });
  if (extension === '.webp') pipeline = pipeline.webp({ quality: 92 });
  if (extension === '.jpg' || extension === '.jpeg') {
    pipeline = pipeline.flatten({ background: brief.background }).jpeg({ quality: 94, mozjpeg: true });
  }

  await pipeline.toFile(outputPath);
  const metadata = await sharp(outputPath).metadata();
  if (metadata.width !== WIDTH || metadata.height !== HEIGHT) {
    throw new Error(`Unexpected output dimensions: ${metadata.width}x${metadata.height}`);
  }

  console.log(JSON.stringify({
    brief: args.briefPath,
    template: brief.template,
    visualThesis: brief.visualThesis,
    output: outputPath,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
