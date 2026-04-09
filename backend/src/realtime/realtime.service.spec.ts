import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeService } from './realtime.service';

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeService],
    }).compile();

    service = module.get<RealtimeService>(RealtimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new connected user socket', () => {
    service.addSocket('user-1', 'socket-abc');
    const socketId = service.getSocketId('user-1');
    expect(socketId).toEqual('socket-abc');
  });

  it('should remove a disconnected user socket', () => {
    service.addSocket('user-2', 'socket-def');
    service.removeSocket('socket-def');
    const socketId = service.getSocketId('user-2');
    expect(socketId).toBeUndefined();
  });
});
