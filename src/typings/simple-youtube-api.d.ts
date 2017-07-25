declare module 'simple-youtube-api' {
  class YouTube {
    constructor(key: string);
    public static util: YouTube.IUtil;

    public getVideo(url: string): Promise<YouTube.Video>;
    public getVideoByID(id: string): Promise<YouTube.Video>;
    public getPlaylist(url: string): Promise<YouTube.Playlist>;
    public getPlaylistByID(url: string): Promise<YouTube.Playlist>;
    public searchVideos(query: string, limit?: number): Promise<YouTube.Video[]>;
  }

  namespace YouTube {
    class Video extends PublishedStructure {
      public type: 'video';

      public thumbnails: {
        default: string;
        medium: string;
        high: string;
        standard: string;
        maxres: string;
      };

      public duration?: {
        hours: number;
        minutes: number;
        seconds: number;
      } | null;

      public readonly shortURL: string;
      public readonly durationSeconds: number;
    }

    class Channel extends Structure {
      public type: 'channel';
    }

    class Playlist extends PublishedStructure {
      public type: 'playlist';
      public videos: Video[];
      public getVideos(limit?: number): Promise<Video[]>;
    }

    abstract class Structure {
      public youtube: YouTube;
      abstract type: string;
      public id: string;
      public title: string;
      static extractID(url: string): string | null;
    }

    abstract class PublishedStructure extends Structure {
      public description: string;
      public publishedAt: Date;
      public channel: Channel;
      public readonly url: string;
    }

    interface IUtil {
      parseURL: (url: string) => {
        type: 'video' | 'playlist';
        id: string;
      }
    }
  }

  export = YouTube;
}
