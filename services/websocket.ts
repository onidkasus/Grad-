import { Notification } from '../types';

type MessageHandler = (data: any) => void;

class MockWebSocketService {
  private handlers: MessageHandler[] = [];
  private isConnected = false;
  private intervalId: any;

  connect(token: string) {
    if (this.isConnected) return;
    this.isConnected = true;
    console.log('[MockWS] Connected with token:', token);
    
    // Simulate incoming messages from server
    this.intervalId = setInterval(() => {
       if (Math.random() > 0.8) {
         this.simulateIncomingMessage();
       }
    }, 15000);
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  offMessage(handler: MessageHandler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  send(type: string, data: any) {
    console.log('[MockWS] Sending:', type, data);
    // In a real app, this goes to server. 
    // Here we can self-echo some events if needed.
  }

  disconnect() {
    this.isConnected = false;
    if (this.intervalId) clearInterval(this.intervalId);
    console.log('[MockWS] Disconnected');
  }

  private simulateIncomingMessage() {
    const events = [
      {
         type: 'IDEA_UPDATED',
         data: { id: '101', stage: 'Prototipiranje' }
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    this.notifyHandlers(randomEvent);
  }

  private notifyHandlers(data: any) {
    this.handlers.forEach(h => h(data));
  }
}

export const websocketService = new MockWebSocketService();
