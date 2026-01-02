import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();
	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now();
		const type = context.getType<GqlContextType>();

		if (type === 'http') {
			// HTTP request logging
			this.logger.log(`HTTP ----${type}---- request...`);
			return next.handle().pipe(
				tap(() => {
					const responseTime = Date.now() - recordTime;
					this.logger.log(`Outgoing ----${type}---- response... +${responseTime}ms`);
				}),
			);
		} else if (type === 'graphql') {
			/** (1) Print Request **/
			const gqlCtx = GqlExecutionContext.create(context);
			this.logger.log(`GraphQL ----${this.stringify(gqlCtx.getContext().req.body)}---- request...`);
			/** (3) NO errors, giving response below **/
			return next.handle().pipe(
				tap((context) => {
					const responseTime = Date.now() - recordTime;
					this.logger.log(`Outgoing ----${this.stringify(context)}---- response... +${responseTime}ms\n`);
				}),
			);
		}
		return next.handle();
	}

	private stringify(context: ExecutionContext): string {
		return JSON.stringify(context).slice(0, 75);
	}
}
