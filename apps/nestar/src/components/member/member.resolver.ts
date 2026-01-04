import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'bson';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

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

	@Roles(MemberType.AGENT, MemberType.USER)
	@UseGuards(RolesGuard)
	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async checkRoleAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('CheckRoleAuth mutation called for memberNick:', memberNick);
		return `Hi ${memberNick}, you have the required role!`;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	public async getAllMembersByAdmin(): Promise<string> {
		console.log('GetAllMembersByAdmin mutation called');
		return this.memberService.getAllMembersByAdmin();
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
