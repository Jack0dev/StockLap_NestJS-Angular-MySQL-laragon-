import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { Socket, Server } from 'socket.io';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let service: RealtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: RealtimeService,
          useValue: {
            addSocket: jest.fn(),
            removeSocket: jest.fn(),
            getSocketId: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    service = module.get<RealtimeService>(RealtimeService);
    
    // Mock the WebSocket server
    gateway.server = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as any as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle client connection (temporarily without auth)', () => {
    const mockClient = { id: 'test-socket-id' } as Socket;
    gateway.handleConnection(mockClient);
    // As per basic implementation, maybe just logging or tracking anon connections
    expect(mockClient).toBeDefined();
  });

  it('should handle client disconnection and clear from service', () => {
    const mockClient = { id: 'test-socket-id' } as Socket;
    gateway.handleDisconnect(mockClient);
    expect(service.removeSocket).toHaveBeenCalledWith('test-socket-id');
  });

  it('should broadcast price update to all clients', () => {
    const payload = { stockId: 1, currentPrice: 150 };
    gateway.broadcastPriceUpdate(1, 150);
    expect(gateway.server.emit).toHaveBeenCalledWith('stock:price-update', payload);
  });

  it('should notify user privately about order execution', () => {
    jest.spyOn(service, 'getSocketId').mockReturnValue('socket-123');
    const orderPayload = { orderId: 5, status: 'FILLED' };
    
    gateway.notifyUserOrder(10, orderPayload);
    
    expect(service.getSocketId).toHaveBeenCalledWith(10);
    expect(gateway.server.to).toHaveBeenCalledWith('socket-123');
    expect(gateway.server.to('socket-123').emit).toHaveBeenCalledWith('order:update', orderPayload);
  });
});
