# Authentication and Roles Decorators Documentation

## Overview

This document explains how the authentication and role-based authorization system works in the Nestar application using NestJS decorators and guards.

---

## Table of Contents

1. [Roles Decorator](#roles-decorator)
2. [AuthMember Decorator](#authmember-decorator)
3. [Authentication Flow](#authentication-flow)
4. [How They Work Together](#how-they-work-together)
5. [Usage Examples](#usage-examples)

---

## Roles Decorator

**File**: `apps/nestar/src/components/auth/decorators/roles.decorator.ts`

### Purpose

The `Roles` decorator is used to specify which user roles are allowed to access a specific route or resolver method.

### Code Explanation

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**What this does:**

1. **Imports SetMetadata**: Imports the `SetMetadata` function from NestJS, which allows us to attach custom metadata to a method or class.

2. **Creates Roles Decorator**: Defines a decorator function that accepts multiple role strings as parameters using rest parameters (`...roles`).

3. **Sets Metadata**: Uses `SetMetadata` to attach the roles array to the method's metadata with the key `'roles'`. This metadata will later be read by the `RolesGuard` to determine if the user has the required permissions.

### How It Works

When you use `@Roles('ADMIN', 'AGENT')` on a resolver method:

- The roles array `['ADMIN', 'AGENT']` is stored as metadata
- The `RolesGuard` reads this metadata
- The guard checks if the authenticated user's `memberType` matches any of the specified roles
- If there's a match, access is granted; otherwise, a `ForbiddenException` is thrown

---

## AuthMember Decorator

**File**: `apps/nestar/src/components/auth/decorators/authMember.decorator.ts`

### Purpose

The `AuthMember` decorator is a parameter decorator that extracts the authenticated user's information from the request and makes it available as a method parameter in your resolver or controller.

### Code Explanation

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthMember = createParamDecorator((data: string, context: ExecutionContext | any) => {
	let request: any;
	if (context.contextType === 'graphql') {
		request = context.getArgByIndex(2).req;
		if (request.body.authMember) {
			request.body.authMember.authorization = request.headers?.authorization;
		}
	} else request = context.switchToHttp().getRequest();

	const member = request.body.authMember;

	if (member) return data ? member?.[data] : member;
	else return null;
});
```

**What each action does:**

1. **Import Dependencies**: Imports `createParamDecorator` and `ExecutionContext` from NestJS to create a custom parameter decorator.

2. **Create Parameter Decorator**: Uses `createParamDecorator` to define a custom decorator that can extract data from the execution context.

3. **Handle GraphQL Context**:
   - Checks if the request is coming from GraphQL (`context.contextType === 'graphql'`)
   - For GraphQL: Gets the request object from the third argument (index 2) of the resolver context
   - Attaches the authorization header to the `authMember` object for reference

4. **Handle HTTP Context**: If not GraphQL, switches to HTTP context and gets the request object.

5. **Extract Member Data**: Retrieves the `authMember` object from `request.body`, which was previously set by either `AuthGuard` or `RolesGuard`.

6. **Return Member or Property**:
   - If `data` parameter is provided (e.g., `@AuthMember('_id')`), returns that specific property of the member
   - If no `data` parameter, returns the entire member object
   - Returns `null` if no authenticated member exists

---

## Authentication Flow

### 1. Request Arrives

A client makes a request to a protected endpoint with a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

### 2. Guard Intercepts Request

**AuthGuard** (Basic Authentication):

- Checks if the token exists in the request headers
- Extracts the token from `Bearer <token>`
- Calls `authService.verifyToken(token)` to validate and decode the token
- If valid, attaches the decoded member data to `request.body.authMember`
- If invalid, throws `UnauthorizedException`

**RolesGuard** (Role-Based Authorization):

- First checks if any roles metadata is set on the method
- If no roles are specified, allows access (returns `true`)
- If roles are specified:
  - Extracts the token from headers
  - Verifies the token using `authService.verifyToken(token)`
  - Checks if the member's `memberType` matches any of the required roles
  - If match found, attaches member to `request.body.authMember` and grants access
  - If no match, throws `ForbiddenException`

### 3. Decorator Extracts Member

After guards have validated the request and attached `authMember` to the request body, the `@AuthMember` decorator:

- Extracts the member data from `request.body.authMember`
- Makes it available as a parameter in your resolver method

---

## How They Work Together

### Complete Flow Example

```typescript
@Resolver()
export class PropertyResolver {
	@UseGuards(RolesGuard)
	@Roles('ADMIN', 'AGENT')
	@Mutation(() => Property)
	async createProperty(@Args('input') input: PropertyInput, @AuthMember('_id') memberId: string): Promise<Property> {
		// Your logic here
	}
}
```

**Step-by-step execution:**

1. **Request arrives** with JWT token in Authorization header

2. **@Roles('ADMIN', 'AGENT')** decorator attaches metadata to the method indicating only ADMIN and AGENT roles are allowed

3. **RolesGuard** activates:
   - Reads the roles metadata: `['ADMIN', 'AGENT']`
   - Extracts and verifies the JWT token
   - Checks if user's `memberType` is ADMIN or AGENT
   - If yes: attaches member to `request.body.authMember` and allows request
   - If no: throws `ForbiddenException`

4. **@AuthMember('\_id')** decorator:
   - Extracts `request.body.authMember`
   - Returns the `_id` property of the member
   - Injects it as the `memberId` parameter

5. **Method executes** with the authenticated member's ID available

---

## Usage Examples

### Example 1: Protecting with Basic Authentication

```typescript
@UseGuards(AuthGuard)
@Query(() => [Property])
async getMyProperties(
  @AuthMember() member: Member,
): Promise<Property[]> {
  // Any authenticated user can access this
  return this.propertyService.findByMember(member._id);
}
```

### Example 2: Role-Based Access Control

```typescript
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Mutation(() => Boolean)
async deleteUser(
  @Args('userId') userId: string,
  @AuthMember('_id') adminId: string,
): Promise<boolean> {
  // Only ADMIN role can access this
  return this.memberService.delete(userId, adminId);
}
```

### Example 3: Multiple Roles

```typescript
@UseGuards(RolesGuard)
@Roles('ADMIN', 'AGENT')
@Mutation(() => Property)
async updateProperty(
  @Args('input') input: PropertyUpdateInput,
  @AuthMember() member: Member,
): Promise<Property> {
  // Both ADMIN and AGENT roles can access this
  return this.propertyService.update(input, member);
}
```

### Example 4: Extracting Specific Member Properties

```typescript
@UseGuards(AuthGuard)
@Query(() => String)
async getMyNickname(
  @AuthMember('memberNick') nickname: string,
): Promise<string> {
  // Extracts only the memberNick field
  return `Hello, ${nickname}!`;
}
```

---

## Key Concepts

### Metadata

- Decorators like `@Roles()` attach metadata to methods
- Guards like `RolesGuard` read this metadata to make authorization decisions
- NestJS's `Reflector` service is used to retrieve metadata

### Guards

- Guards are executed **before** the route handler
- They determine if a request should be processed
- Return `true` to allow, throw an exception to deny

### Parameter Decorators

- Extract data from the request context
- Inject extracted data as method parameters
- Execute **after** guards have processed the request

### Execution Order

1. Decorators attach metadata (e.g., `@Roles()`)
2. Guards execute (e.g., `RolesGuard`, `AuthGuard`)
3. Parameter decorators extract data (e.g., `@AuthMember()`)
4. Route handler/resolver method executes

---

## Security Notes

1. **Always use guards** when applying role restrictions - the decorator alone doesn't enforce anything
2. **Token validation** happens in the guards, not in the decorators
3. **Guards fail fast** - if authentication fails, the method never executes
4. **GraphQL specific** - Current implementation only supports GraphQL context (HTTP and other protocols return `false`)

---

## Common Patterns

### Public Endpoint (No Authentication)

```typescript
@Query(() => [Property])
async getAllProperties(): Promise<Property[]> {
  return this.propertyService.findAll();
}
```

### Authenticated Only

```typescript
@UseGuards(AuthGuard)
@Query(() => Member)
async getProfile(@AuthMember() member: Member): Promise<Member> {
  return member;
}
```

### Role-Restricted

```typescript
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Mutation(() => Boolean)
async dangerousAction(@AuthMember('_id') adminId: string): Promise<boolean> {
  // Implementation
}
```

---

## Member Types

The application supports three member types (defined in `member.enum.ts`):

- **USER**: Regular users
- **AGENT**: Property agents with elevated permissions
- **ADMIN**: Administrators with full access

These values are used in the `@Roles()` decorator to control access.

---

## Troubleshooting

### "TOKEN_NOT_EXIST" Error

- No authorization header was sent with the request
- Check that the client includes `Authorization: Bearer <token>`

### "NOT_AUTHENTICATED" Error

- Token is invalid or expired
- Token verification failed in `authService.verifyToken()`

### "ONLY_SPECIFIC_ROLES_ALLOWED" Error

- User is authenticated but doesn't have the required role
- Check if the user's `memberType` matches the roles specified in `@Roles()`

### Decorator Returns Null

- Guards may not have executed (missing `@UseGuards()`)
- Authentication failed and request should have been blocked
- Check that guards are properly applied

---

## Summary

The authentication and authorization system uses a combination of:

- **Decorators** to mark methods and extract data
- **Guards** to enforce authentication and authorization rules
- **Metadata** to store role requirements
- **JWT tokens** for stateless authentication

This creates a flexible, secure, and clean authorization system that's easy to use throughout your application.
