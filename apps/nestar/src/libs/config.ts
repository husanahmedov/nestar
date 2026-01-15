// IMAGE CONFIGURATION (config.js)
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ObjectId } from 'bson';

export const availableAgentSorts = ['createdAt', 'memberNick', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMemberSorts = ['createdAt', 'memberNick', 'memberLikes', 'memberViews'];
export const availableOptions = ['propertyBarter', 'propertyRent'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

export const availablePropertySorts = [
	"createdAt",
	"updatedAt",
	"propertyRank",
	"propertyPrice",
	"propertyViews",
	"propertyLikes",
]

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: "memberData"
	}
}