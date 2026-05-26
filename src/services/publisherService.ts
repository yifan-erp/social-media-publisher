import { FacebookAPI } from './platformAPIs/facebookAPI';
import { TikTokAPI } from './platformAPIs/tiktokAPI';
import { YouTubeAPI } from './platformAPIs/youtubeAPI';
import { LinkedInAPI } from './platformAPIs/linkedinAPI';

interface PublishConfig {
  facebook?: any;
  tiktok?: any;
  youtube?: any;
  linkedin?: any;
}

interface ContentData {
  contentId: string;
  type: 'video' | 'image' | 'text';
  title: string;
  description: string;
  file?: string;
  platforms: string[];
  scheduleTime?: Date;
}

interface PublishResult {
  contentId: string;
  timestamp: Date;
  results: Record<string, any>;
  status: 'success' | 'partial' | 'failed';
}

export class PublisherService {
  private facebookAPI?: FacebookAPI;
  private tiktokAPI?: TikTokAPI;
  private youtubeAPI?: YouTubeAPI;
  private linkedinAPI?: LinkedInAPI;

  constructor(config: PublishConfig) {
    if (config.facebook) {
      this.facebookAPI = new FacebookAPI(config.facebook);
    }
    if (config.tiktok) {
      this.tiktokAPI = new TikTokAPI(config.tiktok);
    }
    if (config.youtube) {
      this.youtubeAPI = new YouTubeAPI(config.youtube);
    }
    if (config.linkedin) {
      this.linkedinAPI = new LinkedInAPI(config.linkedin);
    }
  }

  async publishToAllPlatforms(content: ContentData): Promise<PublishResult> {
    const results: Record<string, any> = {};
    const promises: Promise<any>[] = [];

    if (content.platforms.includes('facebook') && this.facebookAPI) {
      promises.push(
        this.facebookAPI
          .publish({
            message: content.description,
            image: content.type === 'image' ? content.file : undefined,
            video: content.type === 'video' ? content.file : undefined,
          })
          .then((res) => {
            results.facebook = res;
          })
      );
    }

    if (content.platforms.includes('tiktok') && this.tiktokAPI) {
      promises.push(
        this.tiktokAPI
          .publish({
            videoUrl: content.file || '',
            description: content.description,
          })
          .then((res) => {
            results.tiktok = res;
          })
      );
    }

    if (content.platforms.includes('youtube') && this.youtubeAPI) {
      promises.push(
        this.youtubeAPI
          .publish({
            title: content.title,
            description: content.description,
            videoFile: content.file || '',
          })
          .then((res) => {
            results.youtube = res;
          })
      );
    }

    if (content.platforms.includes('linkedin') && this.linkedinAPI) {
      promises.push(
        this.linkedinAPI
          .publish({
            text: content.description,
            image: content.type === 'image' ? content.file : undefined,
          })
          .then((res) => {
            results.linkedin = res;
          })
      );
    }

    await Promise.all(promises);

    const successCount = Object.values(results).filter(
      (r: any) => r.success
    ).length;
    const status =
      successCount === content.platforms.length
        ? 'success'
        : successCount > 0
        ? 'partial'
        : 'failed';

    return {
      contentId: content.contentId,
      timestamp: new Date(),
      results,
      status,
    };
  }

  async getAnalytics(
    contentId: string,
    platforms: string[]
  ): Promise<Record<string, any>> {
    const analytics: Record<string, any> = {};

    if (platforms.includes('facebook') && this.facebookAPI) {
      analytics.facebook = await this.facebookAPI.getAnalytics(contentId);
    }
    if (platforms.includes('tiktok') && this.tiktokAPI) {
      analytics.tiktok = await this.tiktokAPI.getAnalytics(contentId);
    }
    if (platforms.includes('youtube') && this.youtubeAPI) {
      analytics.youtube = await this.youtubeAPI.getAnalytics(contentId);
    }
    if (platforms.includes('linkedin') && this.linkedinAPI) {
      analytics.linkedin = await this.linkedinAPI.getAnalytics(contentId);
    }

    return analytics;
  }
}
