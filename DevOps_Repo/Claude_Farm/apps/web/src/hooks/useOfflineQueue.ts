import { useEffect } from 'react';
import { api } from '../lib/api.js';

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data: unknown;
  timestamp: number;
}

const QUEUE_KEY = 'offline_queue';

function getQueue(): QueuedRequest[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedRequest[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(method: string, url: string, data: unknown) {
  const queue = getQueue();
  queue.push({ id: crypto.randomUUID(), method, url, data, timestamp: Date.now() });
  saveQueue(queue);
}

export function useOfflineQueue() {
  useEffect(() => {
    async function flush() {
      const queue = getQueue();
      if (!queue.length) return;

      const remaining: QueuedRequest[] = [];
      for (const req of queue) {
        try {
          await api.request({ method: req.method, url: req.url, data: req.data });
        } catch {
          remaining.push(req);
        }
      }
      saveQueue(remaining);
    }

    window.addEventListener('online', flush);
    if (navigator.onLine) flush();
    return () => window.removeEventListener('online', flush);
  }, []);
}
