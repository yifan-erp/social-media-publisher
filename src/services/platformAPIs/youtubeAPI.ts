import axios from 'axios';

interface YouTubeConfig {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

interface YouTubeVideo {
  title: string;
  description: string;
  videoFile: string;
  thumbnail?: string;
  tags?: string[];
  privacy?: 'public' | 'unlisted' | 'private';
}

export class YouTubeAPI {
  private config: YouTubeConfig;
  private baseURL = 'https://www.googleapis.com/youtube/v3';
  private uploadURL = 'https://www.googleapis.com/upload/youtube/v3';

  constructor(config: YouTubeConfig) {
    this.config = config;
  }

  async publish(video: YouTubeVideo) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.uploadURL}/videos?uploadType=multipart`,
        {
          snippet: {
            title: video.title,
            description: video.description,
            tags: video.tags || [],
            categoryId: '24',
          },
          status: {
            privacyStatus: video.privacy || 'public',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        videoId: response.data.id,
        platform: 'youtube',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: 'youtube',
      };
    }
  }

  async getAnalytics(videoId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseURL}/videos`,
        {
          params: {
            part: 'statistics',
            id: videoId,
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.items[0].statistics;
    } catch (error) {
      console.error('YouTube analytics error:', error);
      return null;
    }
  }

  async getStatus(videoId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseURL}/videos`,
        {
          params: {
            part: 'status',
            id: videoId,
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.items[0].status;
    } catch (error) {
      console.error('YouTube status error:', error);
      return null;
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }
      );
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get YouTube access token');
    }
  }
}
