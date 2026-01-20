import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { Properties } from '../../libs/dto/property/property';
import { lookupFavorite } from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exists = await this.likeModel.findOne(search).exec();
		let modifier = 1;
		if (exists) {
			await this.likeModel.deleteOne(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
			} catch (error) {
				console.error('Error in toggleLike service:', error);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		return modifier;
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: any = { likeGroup: LikeGroup.PROPERTY, memberId: memberId };

		const data: any[] = await this.likeModel.aggregate([
			{ $match: match },
			{ $sort: { updatedAt: -1 } },
			{
				$lookup: {
					from: 'properties',
					localField: 'likeRefId',
					foreignField: '_id',
					as: 'favoriteProperty',
				},
			},
			{ $unwind: '$favoriteProperty' },
			{
				$facet: {
					list: [
						{ $skip: (page - 1) * limit },
						{ $limit: limit },
						lookupFavorite,
						{ $unwind: '$favoriteProperty.memberData' },
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		const result: Properties = {
			list: [],
			metaCounter: data[0].metaCounter,
		};

		result.list = data[0].list.map((ele) => ele.favoriteProperty);

		return result;
	}
}
