import { ObjectId } from 'bson';

export const availableAgentSorts = ['createdAt', 'memberNick', 'memberLikes', 'memberViews', 'memberRank'];

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};
