import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { MemberType } from '../../enums/member.enum';

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
