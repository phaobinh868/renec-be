import { Share, ShareDocument } from '@app/common';
import { Injectable } from '@nestjs/common';
import { CreateShareInput } from './inputs/create.input';
import { BaseService } from '@app/common/utils/base-service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ShareService extends BaseService {
  constructor(
    @InjectModel(Share.name, 'shares') private ShareModel: Model<ShareDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    super(ShareModel);
  }

  async createShare(createShareInput: CreateShareInput): Promise<Share> {
    const id = this.getIDfromURL(createShareInput.url);
    if(!id) throw new RpcException('Invalid Youtube Url');
    const videoDetail = await this.getVideoDetailById(id);
    if(!id) throw new RpcException('Video not found');
    const share = await this.createOne({user: createShareInput.user, ...videoDetail});
    return share;
  }

  async getShares(pagingInput): Promise<{total: Number, data: Share[]}> {
    return await this.paging({ ...pagingInput.query }, [], pagingInput);
  }
  getIDfromURL(url: string) {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  }
  async getVideoDetailById(id: string) {
    try {
      const videos = await this.httpService.axiosRef.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${this.configService.get("YOUTUBE_API_KEY")}`);
      if (videos.data?.items?.[0]?.id?.toLowerCase() == id.toLowerCase()) {
        const videoDetail = videos.data.items[0];
        return {
          video_id: videoDetail.id,
          title: videoDetail.snippet?.title ?? "",
          description: videoDetail.snippet?.description ?? "",
          channel: videoDetail.snippet?.channelTitle ?? "",
          thumbnail: videoDetail.snippet?.thumbnails?.maxres?.url ??
            (videoDetail.snippet?.thumbnails?.standard?.url ??
              (videoDetail.snippet?.thumbnails?.high?.url ??
                (videoDetail.snippet?.thumbnails?.medium?.url ??
                  (videoDetail.snippet?.thumbnails?.default?.url ?? "")))),
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
