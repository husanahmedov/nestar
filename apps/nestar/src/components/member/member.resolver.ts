import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

import { InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signUp(@Args('input') input: MemberInput): Promise<Member> {
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

	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		try {
			console.log('UpdateMember mutation called');
			return this.memberService.updateMember();
		} catch (error) {
			console.error('Error in updateMember mutation:', error);
			throw new InternalServerErrorException(error);
		}
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
