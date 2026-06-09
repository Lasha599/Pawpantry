'use client';

import { useEffect, useState } from 'react';
import type { Dog } from './recommend';

export type User = { id?: string; name: string; email: string };

export type Subscription = {
  id: string;
  dogId: string;
  productId: string;
  frequencyWeeks: number;
  nextDeliveryISO: string;
  status: 'active' | 'paused';
  createdAt: string;
};

export type OrderHistoryItem = {
  id: string;
  dogId: string;
  productId: string;
  deliveredAt: string;
};

export type State = {
  user: User | null;
  dogs: Dog[];
  subscriptions: Subscription[];
  history: OrderHistoryItem[];
};

const KEY = 'pawpantry:state:v1';
const TOKEN_KEY = 'pawpantry:token:v1';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

const initial: State = {
  user: null,
  dogs: [],
  subscriptions: [],
  history: [],
};

export function loadState(): State {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return JSON.parse(raw) as State;
  } catch {
    return initial;
  }
}

export function saveState(s: State) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function useStore() {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const update = (fn: (s: State) => State) => {
    setState(prev => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  };

  return { state, update, hydrated };
}

export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function addWeeks(iso: string, weeks: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString();
}
