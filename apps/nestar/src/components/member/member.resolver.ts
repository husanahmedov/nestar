import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

import { UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => String)
	@UsePipes(ValidationPipe)
	public async signUp(@Args('input') input: MemberInput): Promise<string> {
		console.log('SignUp mutation called');
		console.log('Input:', input);
		return this.memberService.signUp();
	}

	@Mutation(() => String)
	public async login(@Args('input') input: LoginInput): Promise<string> {
		console.log('Login mutation called');
		return this.memberService.login();
	}

	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		console.log('UpdateMember mutation called');
		return this.memberService.updateMember();
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('GetMember query called');
		return this.memberService.getMember();
	}
}
