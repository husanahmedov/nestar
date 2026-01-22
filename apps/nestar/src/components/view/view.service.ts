import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisited } from '../../libs/config';
import { Properties } from '../../libs/dto/property/property';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		console.log('Recording view...');
		const existingView = await this.checkExistingView(input);
		// If view already exists, return it; otherwise, create a new one
		return existingView ? null : await this.viewModel.create(input);
	}

	private async checkExistingView(input: ViewInput): Promise<View | null> {
		console.log('Checking existing view...');
		const { memberId, viewRefId } = input;
		const search: T = {
			memberId: memberId,
			viewRefId: viewRefId,
		};
		return await this.viewModel.findOne(search).exec();
	}

	public async GetVisitedProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: any = { viewGroup: ViewGroup.PROPERTY, memberId: memberId };

		const data: any[] = await this.viewModel.aggregate([
			{ $match: match },
			{ $sort: { updatedAt: -1 } },
			{
				$lookup: {
					from: 'properties',
					localField: 'viewRefId',
					foreignField: '_id',
					as: 'visitedProperty',
				},
			},
			{ $unwind: '$visitedProperty' },
			{
				$facet: {
					list: [
						{ $skip: (page - 1) * limit },
						{ $limit: limit },
						lookupVisited,
						{ $unwind: '$visitedProperty.memberData' },
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedProperty);

		return result;
	}
}
