import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

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
}
