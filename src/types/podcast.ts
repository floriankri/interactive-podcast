
export interface Episode {
  id: number;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  publishedAt: string;
}

export interface PodcastSeries {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  episodes: Episode[];
}
