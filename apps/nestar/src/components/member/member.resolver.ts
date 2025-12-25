import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => String)
	public async signUp(): Promise<string> {
		console.log('SignUp mutation called');
		return this.memberService.signUp();
	}

	@Mutation(() => String)
	public async login(): Promise<string> {
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
