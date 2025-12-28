import { Schema } from 'mongoose';
import { MemberType, MemberStatus, MemberAuthType } from '../libs/enums/member.enum';
import { timestamp } from 'rxjs';

const memberSchema = new Schema(
	{
		memberType: { type: String, enum: Object.values(MemberType), default: MemberType.USER },
		memberStatus: { type: String, enum: Object.values(MemberStatus), default: MemberStatus.ACTIVE },
		memberAuthType: { type: String, enum: Object.values(MemberAuthType), default: MemberAuthType.PHONE },
		memberPhone: { type: String, required: true, index: { unique: true, sparse: true } },
		memberNick: { type: String, required: true, index: { unique: true, sparse: true } },
		memberPassword: { type: String, required: true, select: false },
		memberFullName: { type: String, required: false },
		memberImage: { type: String, required: false, default: '' },
		memberAddress: { type: String, required: false },
		memberDesc: { type: String, required: false },
		memberProperties: { type: Number, required: false, default: 0 },
		memberArticles: { type: Number, required: false, default: 0 },
		memberFollowers: { type: Number, required: false, default: 0 },
		memberFollowing: { type: Number, required: false, default: 0 },
		memberPoints: { type: Number, required: false, default: 0 },
		memberLikes: { type: Number, required: false, default: 0 },
		memberViews: { type: Number, required: false, default: 0 },
		memberComments: { type: Number, required: false, default: 0 },
		memberRank: { type: Number, required: false, default: 0 },
		memberWarnings: { type: Number, required: false, default: 0 },
		memberBlocks: { type: Number, required: false, default: 0 },
		deletedAt: { type: Date, required: false },
	},
	{ timestamps: true, collection: 'members' },
);

export default memberSchema;
