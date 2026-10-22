import assert from "node:assert/strict";
import test from "node:test";
import { validateSetup } from "./xau-usd-signals.mjs";

const analyses = {
  M15: { close: 2300, atr14: 2 },
  H1: { atr14: 10 },
};

test("accepts a valid long with ordered targets and sufficient reward-to-risk", () => {
  const result = validateSetup({
    decision: "LONG",
    entry: 2300,
    stop_loss: 2290,
    take_profits: [2315, 2320, 2330],
    why: "Higher timeframe trend and structure align.",
  }, analyses);

  assert.equal(result.valid, true);
  assert.deepEqual(result.signal.risk_reward, [1.5, 2, 3]);
});

test("accepts a valid short", () => {
  const result = validateSetup({
    decision: "SHORT",
    entry: "2300",
    stop_loss: "2310",
    take_profits: ["2285", "2280", "2270"],
    why: "Bearish structure and momentum align.",
  }, analyses);

  assert.equal(result.valid, true);
});

test("rejects null and nonnumeric prices rather than treating them as zero", () => {
  const result = validateSetup({
    decision: "LONG",
    entry: null,
    stop_loss: 2290,
    take_profits: [2315, null, 2330],
    why: "Higher timeframe trend and structure align.",
  }, analyses);

  assert.equal(result.valid, false);
  assert.match(result.reason, /finite prices/);
});

test("rejects protective-side and minimum reward-to-risk violations", () => {
  const wrongStop = validateSetup({
    decision: "LONG",
    entry: 2300,
    stop_loss: 2301,
    take_profits: [2315, 2320, 2330],
    why: "Higher timeframe trend and structure align.",
  }, analyses);
  const poorReward = validateSetup({
    decision: "LONG",
    entry: 2300,
    stop_loss: 2290,
    take_profits: [2314, 2320, 2330],
    why: "Higher timeframe trend and structure align.",
  }, analyses);

  assert.equal(wrongStop.valid, false);
  assert.match(wrongStop.reason, /protective side/);
  assert.equal(poorReward.valid, false);
  assert.match(poorReward.reason, /1.5:1/);
});
