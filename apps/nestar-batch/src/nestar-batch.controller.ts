import { Controller, Get, Logger } from '@nestjs/common';
import { NestarBatchService } from './nestar-batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_PROPERTIES } from './libs/config';

@Controller()
export class NestarBatchController {
	private logger: Logger = new Logger(NestarBatchController.name);
	constructor(private readonly nestarBatchService: NestarBatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug(`BATCH SERVICE INITIALIZED...`);
	}

	@Cron('00 00 01 * * *', { name: BATCH_ROLLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLLBACK;
			this.logger.debug(`EXECUTING BATCH ROLLBACK TASK...`);
			await this.nestarBatchService.batchRollback();
		} catch (error) {
			this.logger.error(`BATCH ROLLBACK TASK FAILED!`, error);
		}
	}

	@Cron('20 00 01 * * *', { name: BATCH_TOP_PROPERTIES })
	public async batchTopProperties() {
		try {
			this.logger['context'] = BATCH_TOP_PROPERTIES;
			this.logger.debug(`EXECUTING BATCH TOP PROPERTIES TASK...`);
			await this.nestarBatchService.batchTopProperties();
		} catch (error) {
			this.logger.error(`BATCH TOP PROPERTIES TASK FAILED!`, error);
		}
	}

	@Cron('40 00 01 * * *', { name: BATCH_TOP_AGENTS })
	public async batchTopAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug(`EXECUTING BATCH TOP AGENTS TASK...`);
			await this.nestarBatchService.batchTopAgents();
		} catch (error) {
			this.logger.error(`BATCH TOP AGENTS TASK FAILED!`, error);
		}
	}

	/**
	 @Interval(1000)
	 handleInterval() {
		 this.logger.debug(`Interval task running every 1 second`);
	 } 
	 */
	@Get()
	getHello(): string {
		return this.nestarBatchService.getHello();
	}
}
