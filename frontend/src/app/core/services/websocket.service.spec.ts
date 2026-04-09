import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });
    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    service.disconnect();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have connect and disconnect methods', () => {
    expect(typeof service.connect).toBe('function');
    expect(typeof service.disconnect).toBe('function');
  });

  it('should emit data wrapped in an observable', () => {
    const obs$ = service.listen('test-event');
    expect(obs$).toBeTruthy();
  });
});
