
import { PodcastSeries, Episode } from "@/types/podcast";

export async function fetchPodcastFeed(rssUrl: string, id: number): Promise<PodcastSeries> {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    const data = await response.json();
    
    // Map RSS feed data to our PodcastSeries type
    return {
      id,
      title: data.feed.title,
      author: data.feed.author,
      description: data.feed.description,
      coverImage: data.feed.image,
      episodes: data.items.map((item: any, index: number): Episode => ({
        id: index + 1,
        title: item.title,
        description: item.description,
        duration: "Loading...", // Duration might not be available in RSS
        audioUrl: item.enclosure?.link || item.link,
        publishedAt: new Date(item.pubDate).toLocaleDateString(),
      }))
    };
  } catch (error) {
    console.error("Error fetching podcast feed:", error);
    throw error;
  }
}
