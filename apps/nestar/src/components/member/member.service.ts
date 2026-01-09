import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly authService: AuthService,
		private readonly viewService: ViewService,
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

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};
		const targetMember: Member | null = await this.memberModel.findOne(search).lean().exec();
		if (!targetMember) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
		if (memberId) {
			const viewInput: ViewInput = {
				memberId: memberId,
				viewGroup: ViewGroup.MEMBER,
				viewRefId: targetId,
			};
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				console.log('---New view recorded:---');
				await this.memberModel.findOneAndUpdate({ _id: targetId }, { $inc: { memberViews: 1 } }).exec();
				targetMember.memberViews++;
			}
		}
		return targetMember;
	}

	public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
		const { text } = input.search;
		const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match:', match);
		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: ((input.page ?? 1) - 1) * (input.limit ?? 10) }, { $limit: input.limit ?? 10 }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		console.log('result:', result);
		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
		return result[0];
	}

	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { text, memberType, memberStatus } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		if (memberStatus) match.memberStatus = memberStatus;
		if (memberType) match.memberType = memberType;
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match:', match);
		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: ((input.page ?? 1) - 1) * (input.limit ?? 10) }, { $limit: input.limit ?? 10 }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		console.log('result:', result);
		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		const result: Member | null = await this.memberModel
			.findOneAndUpdate(
				{
					_id: input._id,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
		return result;
	}
}
