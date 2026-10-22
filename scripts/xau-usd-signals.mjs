import { appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SYMBOL = "XAU/USD";
const BARS = {
  D1: { interval: "1day", milliseconds: 86_400_000 },
  H4: { interval: "4h", milliseconds: 14_400_000 },
  H1: { interval: "1h", milliseconds: 3_600_000 },
  M15: { interval: "15min", milliseconds: 900_000 },
};

function number(value) {
  if (typeof value !== "number" && (typeof value !== "string" || value.trim() === "")) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchCandles(timeframe, config) {
  const { interval, milliseconds } = BARS[timeframe];
  const url = new URL("https://api.twelvedata.com/time_series");
  url.search = new URLSearchParams({
    symbol: SYMBOL,
    interval,
    outputsize: "300",
    timezone: "UTC",
    apikey: config.twelveDataApiKey,
  }).toString();

  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || payload.status === "error" || !Array.isArray(payload.values)) {
    throw new Error(`${timeframe} candle request failed: ${payload.message ?? response.statusText}`);
  }

  const now = Date.now();
  const candles = payload.values
    .map((item) => ({
      time: Date.parse(`${item.datetime.replace(" ", "T")}Z`),
      open: number(item.open),
      high: number(item.high),
      low: number(item.low),
      close: number(item.close),
    }))
    .filter((candle) =>
      Number.isFinite(candle.time) &&
      candle.open !== null &&
      candle.high !== null &&
      candle.low !== null &&
      candle.close !== null &&
      candle.time + milliseconds <= now,
    )
    .sort((a, b) => a.time - b.time);

  if (candles.length < 205) {
    throw new Error(`${timeframe} returned only ${candles.length} closed candles; at least 205 are required.`);
  }
  return candles;
}

function ema(values, period) {
  const multiplier = 2 / (period + 1);
  let current = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (const value of values.slice(period)) current = value * multiplier + current * (1 - multiplier);
  return current;
}

function rsi(values, period = 14) {
  let gains = 0;
  let losses = 0;
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    gains += Math.max(change, 0);
    losses += Math.max(-change, 0);
  }
  let averageGain = gains / period;
  let averageLoss = losses / period;
  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
  }
  if (averageLoss === 0) return 100;
  return 100 - 100 / (1 + averageGain / averageLoss);
}

function atr(candles, period = 14) {
  const ranges = candles.slice(1).map((candle, index) => {
    const previousClose = candles[index].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });
  return ranges.slice(-period).reduce((sum, value) => sum + value, 0) / period;
}

function pivots(candles, key) {
  const found = [];
  for (let index = 2; index < candles.length - 2; index += 1) {
    const value = candles[index][key];
    const neighbors = candles.slice(index - 2, index + 3).filter((_, offset) => offset !== 2);
    const isPivot = key === "high"
      ? neighbors.every((candle) => value > candle.high)
      : neighbors.every((candle) => value < candle.low);
    if (isPivot) found.push({ time: new Date(candles[index].time).toISOString(), price: value });
  }
  return found.slice(-6);
}

function patterns(candles, averageTrueRange) {
  const current = candles.at(-1);
  const previous = candles.at(-2);
  const beforePrevious = candles.at(-3);
  const body = Math.abs(current.close - current.open);
  const range = current.high - current.low;
  const upperWick = current.high - Math.max(current.open, current.close);
  const lowerWick = Math.min(current.open, current.close) - current.low;
  const result = [];

  if (current.close > current.open && previous.close < previous.open &&
      current.open <= previous.close && current.close >= previous.open) result.push("bullish engulfing");
  if (current.close < current.open && previous.close > previous.open &&
      current.open >= previous.close && current.close <= previous.open) result.push("bearish engulfing");
  if (range > 0 && body / range <= 0.1) result.push("doji");
  if (range > 0 && lowerWick >= body * 2 && upperWick <= body && current.close > current.open) result.push("bullish pin bar");
  if (range > 0 && upperWick >= body * 2 && lowerWick <= body && current.close < current.open) result.push("bearish pin bar");
  if (current.high < previous.high && current.low > previous.low) result.push("inside bar");

  const middleRange = beforePrevious.high - beforePrevious.low;
  const middleBody = Math.abs(previous.close - previous.open);
  const midpoint = (beforePrevious.open + beforePrevious.close) / 2;
  if (beforePrevious.close < beforePrevious.open && middleRange > 0 &&
      middleBody / middleRange <= 0.3 && current.close > current.open && current.close > midpoint) {
    result.push("morning star");
  }
  if (beforePrevious.close > beforePrevious.open && middleRange > 0 &&
      middleBody / middleRange <= 0.3 && current.close < current.open && current.close < midpoint) {
    result.push("evening star");
  }
  if (range >= averageTrueRange * 1.2 && range > 0 && body / range >= 0.7) {
    result.push(current.close > current.open ? "bullish momentum candle" : "bearish momentum candle");
  }
  return result.length ? result : ["none"];
}

function analyze(candles) {
  const closes = candles.map((candle) => candle.close);
  const price = closes.at(-1);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);
  const averageTrueRange = atr(candles);
  const highs = pivots(candles, "high");
  const lows = pivots(candles, "low");
  const nearest = (items, direction) => items
    .map((item) => item.price)
    .filter((level) => direction === "support" ? level < price : level > price)
    .sort((a, b) => Math.abs(a - price) - Math.abs(b - price))
    .slice(0, 3);
  const risingHighs = highs.length >= 2 && highs.at(-1).price > highs.at(-2).price;
  const risingLows = lows.length >= 2 && lows.at(-1).price > lows.at(-2).price;
  const fallingHighs = highs.length >= 2 && highs.at(-1).price < highs.at(-2).price;
  const fallingLows = lows.length >= 2 && lows.at(-1).price < lows.at(-2).price;
  const structure = risingHighs && risingLows
    ? "higher highs and higher lows"
    : fallingHighs && fallingLows
      ? "lower highs and lower lows"
      : "mixed or ranging";

  return {
    closed_candles: candles.length,
    last_closed_at: new Date(candles.at(-1).time).toISOString(),
    close: price,
    trend: price > ema20 && ema20 > ema50 && ema50 > ema200
      ? "bullish"
      : price < ema20 && ema20 < ema50 && ema50 < ema200
        ? "bearish"
        : "mixed",
    structure,
    emas: { ema20, ema50, ema200 },
    rsi14: rsi(closes),
    atr14: averageTrueRange,
    swing_highs: highs,
    swing_lows: lows,
    support: nearest(lows, "support"),
    resistance: nearest(highs, "resistance"),
    candlestick_patterns: patterns(candles, averageTrueRange),
  };
}

function parseModelResponse(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Claude did not return a JSON setup.");
  return JSON.parse(text.slice(start, end + 1));
}

export function validateSetup(setup, analyses) {
  if (setup.decision === "NO TRADE") return { valid: false, reason: setup.why ?? "Model returned NO TRADE." };
  if (!["LONG", "SHORT"].includes(setup.decision)) return { valid: false, reason: "Invalid decision." };

  const entry = number(setup.entry);
  const stop = number(setup.stop_loss);
  const targets = Array.isArray(setup.take_profits) ? setup.take_profits.map(number) : [];
  const latestPrice = analyses.M15.close;
  const m15Atr = analyses.M15.atr14;
  const h1Atr = analyses.H1.atr14;
  if (entry === null || stop === null || targets.length !== 3 || targets.some((target) => target === null)) {
    return { valid: false, reason: "Entry, stop, and all three take-profits must be finite prices." };
  }
  if (Math.abs(entry - latestPrice) > h1Atr * 1.5) {
    return { valid: false, reason: "Entry is too far from the latest closed M15 price." };
  }

  const long = setup.decision === "LONG";
  const risk = long ? entry - stop : stop - entry;
  if (risk <= 0) return { valid: false, reason: "Stop-loss is not on the protective side of entry." };
  if (risk < m15Atr * 0.25 || risk > h1Atr * 3) {
    return { valid: false, reason: "Stop distance is outside the allowed ATR range." };
  }

  let previousTarget = entry;
  for (const target of targets) {
    const reward = long ? target - entry : entry - target;
    const ordered = long ? target > previousTarget : target < previousTarget;
    if (!ordered || reward / risk < 1.5) {
      return { valid: false, reason: "Targets must be ordered and each must offer at least 1.5:1 reward-to-risk." };
    }
    previousTarget = target;
  }
  if (typeof setup.why !== "string" || setup.why.trim().length < 8) {
    return { valid: false, reason: "A concise explanation is required." };
  }

  return {
    valid: true,
    signal: {
      decision: setup.decision,
      entry,
      stop_loss: stop,
      take_profits: targets,
      why: setup.why.trim(),
      risk_reward: targets.map((target) =>
        Number(((long ? target - entry : entry - target) / risk).toFixed(2)),
      ),
    },
  };
}

async function requestSetup(analyses, config) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.claudeModel,
      max_tokens: 700,
      system: `You analyze XAU/USD for educational signal generation, not execution. Use only the supplied CLOSED-candle data. Be conservative; conflicting timeframes, weak evidence, or no clear invalidation means NO TRADE. Do not invent indicators or claim certainty. Return exactly one JSON object with keys decision ("LONG", "SHORT", or "NO TRADE"), entry (number or null), stop_loss (number or null), take_profits (three numbers or []), and why (brief evidence-based explanation). For a trade, targets must be price-ordered beyond entry and the stop must be on the protective side. Choose an entry near current M15 close.`,
      messages: [{
        role: "user",
        content: `Choose at most one setup or NO TRADE. Data: ${JSON.stringify(analyses)}`,
      }],
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Claude request failed: ${payload.error?.message ?? response.statusText}`);
  return parseModelResponse((payload.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n"));
}

function formatPrice(value) {
  return value.toFixed(2);
}

async function sendTelegram(signal, config) {
  if (!config.telegramBotToken && !config.telegramChatId) return;
  if (!config.telegramBotToken || !config.telegramChatId) {
    throw new Error("Set both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID, or neither.");
  }
  const targetLines = signal.take_profits
    .map((target, index) => `TP${index + 1}: ${formatPrice(target)}  (${signal.risk_reward[index]}R)`)
    .join("\n");
  const text = [
    `XAU/USD ${signal.decision}`,
    `ENTRY: ${formatPrice(signal.entry)}`,
    `SL: ${formatPrice(signal.stop_loss)}`,
    targetLines,
    `WHY: ${signal.why}`,
  ].join("\n");
  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: config.telegramChatId, text }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(`Telegram delivery failed: ${payload.description ?? response.statusText}`);
}

async function main() {
  const config = {
    twelveDataApiKey: process.env.TWELVE_DATA_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    logPath: process.env.SIGNAL_LOG_PATH || "signals.jsonl",
  };
  if (!config.twelveDataApiKey || !config.anthropicApiKey) {
    throw new Error("Set TWELVE_DATA_API_KEY and ANTHROPIC_API_KEY.");
  }

  const entries = await Promise.all(
    Object.keys(BARS).map(async (timeframe) => [timeframe, analyze(await fetchCandles(timeframe, config))]),
  );
  const analyses = Object.fromEntries(entries);
  const timestamp = new Date().toISOString();
  let setup;
  let result;
  try {
    setup = await requestSetup(analyses, config);
    result = validateSetup(setup, analyses);
  } catch (error) {
    result = { valid: false, reason: `Setup generation failed: ${error.message}` };
  }

  const record = {
    timestamp,
    symbol: SYMBOL,
    decision: result.valid ? result.signal.decision : "NO TRADE",
    signal: result.valid ? result.signal : null,
    reason: result.valid ? null : result.reason,
    analysis: analyses,
  };
  await appendFile(config.logPath, `${JSON.stringify(record)}\n`, { encoding: "utf8", flag: "a" });

  if (result.valid) {
    await sendTelegram(result.signal, config);
    console.log(`Logged and delivered ${result.signal.decision} XAU/USD signal.`);
  } else {
    console.log(`Logged NO TRADE: ${result.reason}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
