import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ShareService } from './share.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { CreateShareInput } from './inputs/create.input';
import { Model } from 'mongoose';
import { Share, ShareDocument } from '@app/common';

describe('ShareService', () => {
  let shareService: ShareService;
  let httpService: HttpService;
  let configService: ConfigService;
  let model: Model<Share>;

  const mockShareModel = {
    createOne: jest.fn(),
  };

  const mockHttpService = {
    axiosRef: {
      get: jest.fn(),
    },
  };

  const mockShare = {
    _id: "1",
    video_id: 'videoId',
    title: 'Video Title',
    channel: 'Video Channel',
    thumbnail: 'Thumbnail URL',
    description: 'Video Description',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareService,
        ConfigService,
        {
          provide: getModelToken(Share.name),
          useValue: mockShareModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    shareService = module.get<ShareService>(ShareService);
    model = module.get<Model<Share>>(getModelToken(Share.name));
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(shareService).toBeDefined();
    expect(model).toBeDefined();
    expect(httpService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('createShare', () => {
    it('should create a share successfully with valid input', async () => {
      const createShareInput: CreateShareInput = { url: 'https://www.youtube.com/watch?v=eQuhS0jmeUI', user: 'userId' };

      jest.spyOn(shareService, 'createOne').mockResolvedValueOnce(mockShare as ShareDocument);
      jest.spyOn(shareService, 'getVideoDetailById').mockResolvedValueOnce({ video_id: 'videoId', title: 'Video Title', channel: 'Video Channel', thumbnail: 'Thumbnail URL', description: 'Video Description' });

      const result = await shareService.createShare(createShareInput);

      expect(result).toEqual(mockShare);
    });

    it('should throw RpcException with invalid YouTube URL', async () => {
      const createShareInput: CreateShareInput = { url: 'invalidUrl', user: 'userId' };
      await expect(shareService.createShare(createShareInput)).rejects.toThrow(new RpcException('Invalid Youtube Url'));
    });

    it('should throw RpcException if video not found', async () => {
      const createShareInput: CreateShareInput = { url: 'https://www.youtube.com/watch?v=eQuhS0jmeUI', user: 'userId' };
      jest.spyOn(shareService, 'getVideoDetailById').mockResolvedValueOnce(null);

      await expect(shareService.createShare(createShareInput)).rejects.toThrow(new RpcException('Video not found'));
    });
  });
});