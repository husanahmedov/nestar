export enum Message {
	SOMETHING_WENT_WRONG = 'Something went wrong. Please try again later.',
	INVALID_CREDENTIALS = 'Invalid credentials. Please check your username and password.',
	ACCESS_DENIED = 'Access denied. You do not have permission to view this resource.',
	RESOURCE_NOT_FOUND = 'The requested resource was not found.',
	OPERATION_SUCCESSFUL = 'The operation was completed successfully.',

	NO_DATA_FOUND = 'No data found.',
	CREATE_FAILED = 'Failed to create the resource.',
	UPDATE_FAILED = 'Failed to update the resource.',
	REMOVE_FAILED = 'Failed to delete the resource.',
	UPLOAD_FAILED = 'Failed to upload the file.',
	BAD_REQUEST = 'Bad request. Please check the data you have provided.',

	NO_MEMBER_NICK = 'No member nickname provided.',
	BLOCKED_USER = 'The member is blocked.',
	WRONG_PASSWORD = 'The password you entered is incorrect.',
	NOT_AUTHENTICATED = 'You are not authenticated. Please log in to continue.',
	TOKEN_NOT_EXIST = 'Authentication token does not exist.',
	ONLY_SPECIFIC_ROLES_ALLOWED = 'Only users with specific roles are allowed to perform this action.',
	NOT_ALLOWED_REQUEST = 'This request is not allowed.',
	PROVIDE_ALLOWED_FORMAT = 'Please provide only jpg, jpeg, png formats.',
	SELF_SUBSCRIPTION_DENIED = 'You cannot subscribe to yourself.',
}
