'use client';

import * as React from 'react';
import type { ToastProps } from '@/components/ui/toast';

type ToastInput = Omit<ToastProps, 'id'> & {
  id?: string;
  title?: string;
  description?: string;
};

type ToastState = Required<Pick<ToastInput, 'id'>> & ToastInput;

type Action =
  | { type: 'ADD'; toast: ToastState }
  | { type: 'DISMISS'; id: string }
  | { type: 'REMOVE'; id: string };

const LIMIT = 3;

function reducer(state: ToastState[], action: Action): ToastState[] {
  switch (action.type) {
    case 'ADD':
      return [action.toast, ...state].slice(0, LIMIT);
    case 'DISMISS':
      return state.map((t) => t.id === action.id ? { ...t, open: false } : t);
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
  }
}

let listeners: Array<(state: ToastState[]) => void> = [];
let memState: ToastState[] = [];

function dispatch(action: Action) {
  memState = reducer(memState, action);
  listeners.forEach((l) => l(memState));
}

let count = 0;
function genId() { return `toast-${++count}`; }

function toast(input: ToastInput) {
  const id = input.id ?? genId();
  dispatch({ type: 'ADD', toast: { ...input, id, open: true, onOpenChange: (open) => { if (!open) dispatch({ type: 'DISMISS', id }); } } });
  return id;
}

toast.error = (message: string, description?: string) =>
  toast({ variant: 'destructive', title: message, description });

toast.success = (message: string, description?: string) =>
  toast({ variant: 'success', title: message, description });

function useToast() {
  const [state, setState] = React.useState<ToastState[]>(memState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { listeners = listeners.filter((l) => l !== setState); };
  }, []);
  return {
    toasts: state,
    toast,
    dismiss: (id: string) => dispatch({ type: 'DISMISS', id }),
  };
}

export { useToast, toast };
