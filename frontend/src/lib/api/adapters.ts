import type {
  Instrument,
  Signal,
  SignalRationaleLayer,
  WhaleTransaction,
} from "../types";
import { createRng, seedFrom } from "../mock/rng";

/**
 * Backend DTOs are leaner than the rich frontend view models, so adapters
 * fill in derived/presentational fields (sparklines, change abs) the API
 * doesn't persist. This keeps the UI identical whether data is live or mock.
 */

export interface InstrumentDto {
  id: string;
  symbol: string;
  name: string;
  market: Instrument["market"];
  price: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  aiScore: number;
}

export function adaptInstrument(dto: InstrumentDto): Instrument {
  const rng = createRng(seedFrom(dto.symbol));
  const change24hAbs = (dto.price * dto.change24hPct) / 100;
  const spark: number[] = [];
  let p = dto.price - change24hAbs;
  for (let i = 0; i < 24; i++) {
    p += (change24hAbs / 24) * rng.range(0.2, 1.8) + dto.price * rng.gaussian() * 0.004;
    spark.push(Number(p.toFixed(dto.price < 1 ? 5 : 2)));
  }
  spark[spark.length - 1] = dto.price;
  return {
    ...dto,
    change24hAbs: Number(change24hAbs.toFixed(dto.price < 1 ? 5 : 2)),
    sparkline: spark,
  };
}

export interface SignalDto extends Omit<Signal, "rationale" | "backtest"> {
  rationale: unknown;
  backtest: unknown;
}

export function adaptSignal(dto: SignalDto): Signal {
  return {
    ...dto,
    rationale: dto.rationale as SignalRationaleLayer[],
    backtest: dto.backtest as Signal["backtest"],
  };
}

export interface WhaleDto {
  id: string;
  asset: string;
  market: WhaleTransaction["market"];
  type: WhaleTransaction["type"];
  amountUsd: number;
  amountAsset: number;
  fromLabel: string;
  toLabel: string;
  impact: WhaleTransaction["impact"];
  aiInterpretation: string;
  linkedSignalId?: string | null;
  txRef?: string | null;
  timestamp: string;
}

export function adaptWhale(dto: WhaleDto): WhaleTransaction {
  return {
    id: dto.id,
    asset: dto.asset,
    market: dto.market,
    type: dto.type,
    amountUsd: dto.amountUsd,
    amountAsset: dto.amountAsset,
    from: dto.fromLabel,
    to: dto.toLabel,
    impact: dto.impact,
    aiInterpretation: dto.aiInterpretation,
    linkedSignalId: dto.linkedSignalId ?? undefined,
    txRef: dto.txRef ?? undefined,
    timestamp: dto.timestamp,
  };
}
