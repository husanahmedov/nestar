import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { T } from '../../libs/types/common';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly authService: AuthService,
	) {}
	// Business logic for member operations would go here
	public async signUp(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		try {
			const result = await this.memberModel.create(input);
			result.accessToken = await this.authService.createToken(result);
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
			if (!member || member.memberStatus === MemberStatus.DELETE) {
				throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
			} else if (member.memberStatus === MemberStatus.BLOCK) {
				throw new InternalServerErrorException(Message.BLOCKED_USER);
			}

			const isMatch = await this.authService.comparePasswords(memberPassword, member.memberPassword);
			if (!isMatch) {
				throw new InternalServerErrorException(Message.WRONG_PASSWORD);
			}
			member.accessToken = await this.authService.createToken(member);
			return member;
		} catch (error) {
			console.error('Error in login service:', error);
			throw new BadRequestException(error);
		}
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result: Member | null = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async getMember(targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};
		const targetMember: Member | null = await this.memberModel.findOne(search).exec();
		if (!targetMember) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
		return targetMember;
	}

	public async getAllMembersByAdmin(): Promise<string> {
		return 'GetAllMembersByAdmin Successful';
	}
}
