import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as Websocket from 'ws';

interface MessagePayload {
	event: string;
	text: string;
}

interface InfoPayload {
	event: string;
	totalClients: number;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private clients: Set<WebSocket> = new Set();

	@WebSocketServer()
	server: Server;

	afterInit(server: Server) {
		this.logger.log(`WebSocket server initialized ${this.clients.size} clients connected`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.clients.add(client);
		this.logger.log(`Client connected. Total clients: ${this.clients.size}`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.clients.size,
		};
		this.emitMessage(infoMsg);
	}

	handleDisconnect(client: WebSocket) {
		this.clients.delete(client);
		this.logger.log(`Client disconnected. Total clients: ${this.clients.size}`);
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.clients.size,
		};
		this.broadcastMessage(client, infoMsg);
	}

	private broadcastMessage(client: WebSocket, message: InfoPayload) {
		this.clients.forEach((c) => {
			if (c !== client && c.readyState === Websocket.OPEN) {
				c.send(JSON.stringify(message));
			}
		});
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const newMessage: MessagePayload = {
			event: 'message',
			text: payload,
		};
		this.logger.verbose(`Received message: ${payload} from client`);
		this.emitMessage(newMessage);
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.clients.forEach((client) => {
			if (client.readyState === Websocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
