import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
	public async hashPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, salt);
	}

	public async comparePasswords(password: string, hashedPassword: string | undefined): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}
}
