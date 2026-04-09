import { Injectable } from '@nestjs/common';

@Injectable()
export class RealtimeService {
  // Maps user ID (or string representation) to their active Socket ID
  private readonly userSockets = new Map<string | number, string>();

  /**
   * Register a user's socket connection
   */
  addSocket(userId: string | number, socketId: string): void {
    this.userSockets.set(userId, socketId);
  }

  /**
   * Remove a socket connection when client disconnects
   */
  removeSocket(socketId: string): void {
    for (const [userId, curSocketId] of this.userSockets.entries()) {
      if (curSocketId === socketId) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  /**
   * Get the active socket ID for a given user
   */
  getSocketId(userId: string | number): string | undefined {
    return this.userSockets.get(userId);
  }
}
