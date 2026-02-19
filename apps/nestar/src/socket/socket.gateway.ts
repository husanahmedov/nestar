import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as Websocket from 'ws';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';
import { AuthService } from '../components/auth/auth.service';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member | null;
	action: 'joined' | 'left';
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private clients: Set<WebSocket> = new Set();
	private clientsAuthMap: Map<WebSocket, Member | null> = new Map();
	private messagesList: MessagePayload[] = [];
	constructor(private readonly authService: AuthService) {}

	@WebSocketServer()
	server: Server;

	afterInit(server: Server) {
		this.logger.log(`WebSocket server initialized ${this.clients.size} clients connected`);
	}

	private async retrieveAuth(req: any): Promise<Member | null> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			console.log('token:', token);
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			this.logger.error('Authentication failed', err);
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req);
		this.clients.add(client);
		this.clientsAuthMap.set(client, authMember);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Connection ${clientNick} & total (${this.clients.size})`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.clients.size,
			memberData: authMember,
			action: 'joined',
		};
		this.emitMessage(infoMsg);
	}

	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client);
		this.clients.delete(client);
		this.clientsAuthMap.delete(client);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Disconnection ${clientNick} & total (${this.clients.size})`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.clients.size,
			memberData: authMember ?? null,
			action: 'left',
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
		const authMember = this.clientsAuthMap.get(client);
		const newMessage: MessagePayload = {
			event: 'message',
			text: payload,
			memberData: authMember ?? null,
		};
		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Received message: ${payload} from client ${clientNick}`);
		this.messagesList.push(newMessage);
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
