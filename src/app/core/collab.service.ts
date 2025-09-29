import { Injectable } from '@angular/core';
import { z } from 'zod';
import { BoardPatch } from '../domain/types';

@Injectable({ providedIn: 'root' })
export class CollabService {
  private bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('taskmanager') : null;
  private ws?: WebSocket;
  private listeners = new Set<(p: BoardPatch) => void>();

  private PatchSchema = z.object({
    id: z.string(),
    ts: z.number(),
    author: z.string().optional(),
    ops: z.array(z.object({ t: z.string() }).passthrough())
  });

  constructor() {
    this.bc?.addEventListener('message', (ev) => this.handleIncoming(ev.data));
    const wsUrl = (globalThis as any)?.TASKMANAGER_WS_URL as string | undefined;
    if (wsUrl) {
      try {
        this.ws = new WebSocket(wsUrl);
        this.ws.onmessage = (ev) => this.handleIncoming(ev.data);
      } catch {
        // ws jest opcjonalny
      }
    }
  }

  onPatch(cb: (p: BoardPatch) => void) { this.listeners.add(cb); return () => this.listeners.delete(cb); }

  broadcast(patch: BoardPatch) {
    this.bc?.postMessage(patch);
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(patch));
  }

  private handleIncoming(raw: unknown) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const patch = this.PatchSchema.parse(parsed) as BoardPatch;
      this.listeners.forEach((l) => l(patch));
    } catch {
    }
  }
}
