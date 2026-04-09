import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly url = 'http://localhost:3000'; // Define backend URL

  constructor() {
    this.connect();
  }

  connect(): void {
    if (!this.socket) {
      this.socket = io(this.url, {
        reconnection: true,
      });
      // Optionally attach jwt to auth query params here in the future
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable((subscriber) => {
      this.socket?.on(eventName, (data: T) => {
        subscriber.next(data);
      });

      // Cleanup
      return () => {
        this.socket?.off(eventName);
      };
    });
  }

  emit(eventName: string, data: any): void {
    this.socket?.emit(eventName, data);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
