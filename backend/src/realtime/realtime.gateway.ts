import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust dynamically if needed based on environment
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Optional: Authenticate client via JWT query param
    // const token = client.handshake.query.token;
    // For now, we will add support later. Currently, anonymous connections are allowed.
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.realtimeService.removeSocket(client.id);
  }

  /**
   * Push live price ticks to all subscribed frontend clients
   */
  broadcastPriceUpdate(stockId: number, currentPrice: number) {
    this.server.emit('stock:price-update', { stockId, currentPrice });
  }

  /**
   * Push live updates to the Bids/Asks order book view
   */
  broadcastOrderBookUpdate(stockId: number, orderBookData: any) {
    // E.g., emitting to a specific room for the stock
    this.server.emit(`stock:${stockId}:orderbook`, orderBookData);
  }

  /**
   * Send a private notification to a user when their order is filled
   */
  notifyUserOrder(userId: number, payload: any) {
    const socketId = this.realtimeService.getSocketId(userId);
    if (socketId) {
      this.server.to(socketId).emit('order:update', payload);
    }
  }
}
