import { TestBed } from '@angular/core/testing';

import { PostGetService } from './post-get.service';

describe('PostGetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PostGetService = TestBed.get(PostGetService);
    expect(service).toBeTruthy();
  });
});
