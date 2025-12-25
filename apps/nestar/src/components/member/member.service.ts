import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';

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

	public async login(input: LoginInput): Promise<Member> {
		try {
			const { memberNick, memberPassword } = input;
			const member: Member | null = await this.memberModel
				.findOne({
					memberNick: memberNick,
				})
				.select('+memberPassword')
				.exec();
			console.log("Member", member)
			if (!member || member.memberStatus === MemberStatus.DELETE) {
				throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
			} else if (member.memberStatus === MemberStatus.BLOCK) {
				throw new InternalServerErrorException(Message.BLOCKED_USER);
			}

			const isMatch = member.memberPassword === memberPassword;
			if (!isMatch) {
				throw new InternalServerErrorException(Message.WRONG_PASSWORD);
			}
			return member;
		} catch (error) {
			console.error('Error in login service:', error);
			throw new BadRequestException(error);
		}
	}

	public async updateMember(): Promise<string> {
		return 'UpdateMember Successful';
	}

	public async getMember(): Promise<string> {
		return 'GetMember Successful';
	}
}
