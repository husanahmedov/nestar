import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import commentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { PropertyModule } from '../property/property.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Comment', schema: commentSchema }]),
		AuthModule,
		ViewModule,
    MemberModule,
		PropertyModule,
		BoardArticleModule,
	],
	providers: [CommentService, CommentResolver],
})
export class CommentModule {}
