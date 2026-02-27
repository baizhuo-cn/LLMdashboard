type DeepSeekBpePayload = {
  vocab: Record<string, number>;
  merges: string[];
};

const DIGIT_CHUNK_RE = /\p{N}{1,3}/gu;
const CJK_CHUNK_RE = /[一-龥぀-ゟ゠-ヿ]+/gu;
const WORD_PUNCT_RE = new RegExp(
  `[!"#$%&'()*+,\\-./:;<=>?@\\[\\\\\\]^_\`{|}~][A-Za-z]+|[^\\r\\n\\p{L}\\p{P}\\p{S}]?[\\p{L}\\p{M}]+| ?[\\p{P}\\p{S}]+[\\r\\n]*|\\s*[\\r\\n]+|\\s+(?!\\S)|\\s+`,
  "gu"
);

const textEncoder = new TextEncoder();

function createByteToUnicodeMap(): string[] {
  const bytes: number[] = [];
  for (let i = 33; i <= 126; i += 1) bytes.push(i);
  for (let i = 161; i <= 172; i += 1) bytes.push(i);
  for (let i = 174; i <= 255; i += 1) bytes.push(i);

  const byteSet = new Set(bytes);
  const codePoints = [...bytes];
  let extra = 0;
  for (let i = 0; i < 256; i += 1) {
    if (!byteSet.has(i)) {
      bytes.push(i);
      byteSet.add(i);
      codePoints.push(256 + extra);
      extra += 1;
    }
  }

  const map = new Array<string>(256);
  for (let i = 0; i < bytes.length; i += 1) {
    map[bytes[i]] = String.fromCodePoint(codePoints[i]);
  }
  return map;
}

const BYTE_TO_UNICODE = createByteToUnicodeMap();

function splitIsolated(input: string, regex: RegExp): string[] {
  if (!input) return [];

  const result: string[] = [];
  let lastIndex = 0;

  regex.lastIndex = 0;
  for (const match of input.matchAll(regex)) {
    const index = match.index ?? 0;
    const value = match[0] ?? "";

    if (index > lastIndex) {
      result.push(input.slice(lastIndex, index));
    }
    if (value) {
      result.push(value);
    }
    lastIndex = index + value.length;
  }

  if (lastIndex < input.length) {
    result.push(input.slice(lastIndex));
  }

  return result.length > 0 ? result : [input];
}

function splitByPattern(segments: string[], regex: RegExp): string[] {
  const output: string[] = [];
  for (const segment of segments) {
    output.push(...splitIsolated(segment, regex));
  }
  return output;
}

function toByteLevelToken(input: string): string {
  const bytes = textEncoder.encode(input);
  let output = "";
  for (const byte of bytes) {
    output += BYTE_TO_UNICODE[byte];
  }
  return output;
}

function heuristicTokenFallback(text: string): number {
  if (!text) return 0;
  let tokens = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0x3000 && code <= 0x303f) ||
      (code >= 0xff00 && code <= 0xffef) ||
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x3040 && code <= 0x30ff)
    ) {
      tokens += 1.5;
    } else {
      tokens += 0.25;
    }
  }
  return Math.max(1, Math.ceil(tokens));
}

class DeepSeekBpeTokenizer {
  private readonly vocab: Set<string>;
  private readonly mergeRanks: Map<string, number>;
  private readonly tokenCountCache = new Map<string, number>();

  constructor(payload: DeepSeekBpePayload) {
    this.vocab = new Set(Object.keys(payload.vocab));
    this.mergeRanks = new Map(payload.merges.map((pair, index) => [pair, index]));
  }

  countTokens(text: string): number {
    if (!text) return 0;

    let segments = [text];
    segments = splitByPattern(segments, DIGIT_CHUNK_RE);
    segments = splitByPattern(segments, CJK_CHUNK_RE);
    segments = splitByPattern(segments, WORD_PUNCT_RE);

    let total = 0;
    for (const segment of segments) {
      if (!segment) continue;
      const byteLevelSegment = toByteLevelToken(segment);
      total += this.countBpeTokens(byteLevelSegment);
    }
    return total;
  }

  private countBpeTokens(token: string): number {
    const cached = this.tokenCountCache.get(token);
    if (cached !== undefined) {
      return cached;
    }

    let word = Array.from(token);
    while (word.length > 1) {
      let bestPair = "";
      let bestRank = Number.POSITIVE_INFINITY;

      for (let i = 0; i < word.length - 1; i += 1) {
        const pair = `${word[i]} ${word[i + 1]}`;
        const rank = this.mergeRanks.get(pair);
        if (rank !== undefined && rank < bestRank) {
          bestRank = rank;
          bestPair = pair;
        }
      }

      if (!Number.isFinite(bestRank)) {
        break;
      }

      const [left, right] = bestPair.split(" ");
      const merged: string[] = [];
      let index = 0;
      while (index < word.length) {
        if (index < word.length - 1 && word[index] === left && word[index + 1] === right) {
          merged.push(left + right);
          index += 2;
        } else {
          merged.push(word[index]);
          index += 1;
        }
      }
      word = merged;
    }

    let count = 0;
    for (const piece of word) {
      if (this.vocab.has(piece)) {
        count += 1;
      } else {
        // byte_fallback=true in DeepSeek config, treat unknown piece as raw byte tokens.
        count += Array.from(piece).length;
      }
    }

    this.tokenCountCache.set(token, count);
    return count;
  }
}

let tokenizerPromise: Promise<DeepSeekBpeTokenizer> | null = null;

async function loadTokenizer(): Promise<DeepSeekBpeTokenizer> {
  if (!tokenizerPromise) {
    tokenizerPromise = fetch("/tokenizers/deepseek-v3-bpe.min.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load tokenizer file: ${response.status}`);
        }
        return response.json() as Promise<DeepSeekBpePayload>;
      })
      .then((payload) => new DeepSeekBpeTokenizer(payload))
      .catch((error) => {
        tokenizerPromise = null;
        throw error;
      });
  }

  return tokenizerPromise;
}

export async function estimateTokensWithDeepSeekRule(text: string): Promise<number> {
  if (!text) return 0;
  const tokenizer = await loadTokenizer();
  return tokenizer.countTokens(text);
}

export function estimateTokensHeuristic(text: string): number {
  return heuristicTokenFallback(text);
}
