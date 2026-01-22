import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private clients: Set<WebSocket> = new Set();

	afterInit(server: Server) {
		this.logger.log(`WebSocket server initialized ${this.clients.size} clients connected`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.clients.add(client);
		this.logger.log(`Client connected. Total clients: ${this.clients.size}`);
	}

	handleDisconnect(client: WebSocket) {
		this.clients.delete(client);
		this.logger.log(`Client disconnected. Total clients: ${this.clients.size}`);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hay this is nestar socket server';
	}
}
