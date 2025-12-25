import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { MemberInput } from '../../libs/dto/member/member.input';

@Injectable()
export class MemberService {
	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}
	// Business logic for member operations would go here
	public async signUp(input: MemberInput): Promise<Member> {
		try {
			const result = await this.memberModel.create(input);
			return result;
		} catch (error) {
			console.error('Error in signUp service:', error);
			throw new BadRequestException(error);
		}
	}

	public async login(): Promise<string> {
		return 'Login Successful';
	}

	public async updateMember(): Promise<string> {
		return 'UpdateMember Successful';
	}

	public async getMember(): Promise<string> {
		return 'GetMember Successful';
	}
}
