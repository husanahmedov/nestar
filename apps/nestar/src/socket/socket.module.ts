import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AppModule } from '../app.module';
import { AuthModule } from '../components/auth/auth.module';

@Module({
	imports: [forwardRef(() => AppModule), AuthModule],
	providers: [SocketGateway],
})
export class SocketModule {}
