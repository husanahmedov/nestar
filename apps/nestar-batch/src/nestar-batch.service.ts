import { Injectable } from '@nestjs/common';

@Injectable()
export class NestarBatchService {
	public async batchRollback(): Promise<void> {
		console.log('Batch rollback executed');
	}
	public async batchTopProperties(): Promise<void> {
		console.log('Batch top properties executed');
	}
	public async batchTopAgents(): Promise<void> {
		console.log('Batch top agents executed');
	}
	public getHello(): string {
		return 'Welcome to Nestar Batch Service!';
	}
}
