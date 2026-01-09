import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';
import { MemberType } from '../../enums/member.enum';
import { availableAgentSorts } from '../../config';

@InputType()
export class MemberInput {
	@IsNotEmpty()
	@Length(3, 10)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 20)
	@Field(() => String)
	memberPassword: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberStatus?: string;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 10)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 20)
	@Field(() => String)
	memberPassword: string;
}

@InputType()
class AISearch {
	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	text?: string;
}
@InputType()
export class AgentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableAgentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@IsIn(availableAgentSorts)
	@Field(() => String, { nullable: true })
	direction?: string;

	@IsNotEmpty()
	@Field(() => AISearch)
	search: AISearch;
}
