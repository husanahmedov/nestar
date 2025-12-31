import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'bson';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		try {
			console.log('SignUp mutation called');
			return this.memberService.signUp(input);
		} catch (error) {
			console.error('Error in signUp mutation:', error);
			throw new InternalServerErrorException(error);
		}
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		try {
			console.log('Login mutation called');
			return this.memberService.login(input);
		} catch (error) {
			console.error('Error in login mutation:', error);
			throw new InternalServerErrorException(error);
		}
	}

	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async updateMember(@AuthMember('_id') memberId: ObjectId): Promise<string> {
		console.log('UpdateMember mutation called');
		return this.memberService.updateMember();
	}

	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('CheckAuth mutation called for memberNick:', memberNick);
		return `Hi ${memberNick}, you are authenticated!`;
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		try {
			console.log('GetMember query called');
			return this.memberService.getMember();
		} catch (error) {
			console.error('Error in getMember query:', error);
			throw new InternalServerErrorException(error);
		}
	}
}
