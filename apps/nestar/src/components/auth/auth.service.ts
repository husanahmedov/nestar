import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}
	public async hashPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, salt);
	}

	public async comparePasswords(password: string, hashedPassword: string | undefined): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	public async createToken(member: Member): Promise<string> {
		const payload: T = {};

		Object.keys(member['_doc'] ? member['_doc'] : member).map((element) => {
			payload[element] = member[element];
		});

		delete payload['memberPassword'];

		return await this.jwtService.signAsync(payload);
	}
}
