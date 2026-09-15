"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SurveyAnalysis, SurveyRow, TrendResult } from "./types";

const STORAGE_KEY = "gifttime-dashboard-state";

type PersistedState = {
  season: string;
  budget: string;
  trendResult: TrendResult | null;
  surveyRows: SurveyRow[];
  surveyAnalysis: SurveyAnalysis | null;
  savedCandidates: string[];
};

const EMPTY_STATE: PersistedState = {
  season: "",
  budget: "",
  trendResult: null,
  surveyRows: [],
  surveyAnalysis: null,
  savedCandidates: [],
};

type StoreContextValue = PersistedState & {
  setSeason: (season: string) => void;
  setBudget: (budget: string) => void;
  setTrendResult: (result: TrendResult | null) => void;
  setSurveyData: (rows: SurveyRow[], analysis: SurveyAnalysis | null) => void;
  saveCandidate: (name: string) => void;
  removeCandidate: (name: string) => void;
  resetAll: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState({ ...EMPTY_STATE, ...JSON.parse(raw) });
      }
    } catch {
      // localStorage 접근 불가 시 초기 상태 유지
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 저장 실패는 무시 (프라이빗 브라우징 등)
    }
  }, [state, hydrated]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      setSeason: (season) => setState((s) => ({ ...s, season })),
      setBudget: (budget) => setState((s) => ({ ...s, budget })),
      setTrendResult: (trendResult) => setState((s) => ({ ...s, trendResult })),
      setSurveyData: (surveyRows, surveyAnalysis) =>
        setState((s) => ({ ...s, surveyRows, surveyAnalysis })),
      saveCandidate: (name) =>
        setState((s) =>
          s.savedCandidates.includes(name)
            ? s
            : { ...s, savedCandidates: [...s.savedCandidates, name] }
        ),
      removeCandidate: (name) =>
        setState((s) => ({
          ...s,
          savedCandidates: s.savedCandidates.filter((n) => n !== name),
        })),
      resetAll: () => setState(EMPTY_STATE),
    }),
    [state]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
