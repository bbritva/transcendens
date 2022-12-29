import { Test, TestingModule } from '@nestjs/testing';
import { ReqService } from 'src/req/req.service';

describe('ReqService', () => {
  let service: ReqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReqService],
    }).compile();

    service = module.get<ReqService>(ReqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
