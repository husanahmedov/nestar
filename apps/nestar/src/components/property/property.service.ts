import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { MemberService } from '../member/member.service';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		private readonly memberService: MemberService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		// Placeholder implementation
		try {
			const result = await this.propertyModel.create(input);
			await this.memberService.memberStatsEditor({
				_id: input.memberId,
				targetKey: 'memberProperties',
				modifier: 1,
			});
            console.log('salom');
            
			return result;
		} catch (error) {
			// Handle error appropriately
			console.log('Error creating property:', error);
			throw new BadRequestException('Failed to create property');
		}
	}
}
