
import type { PodcastSeries } from "@/types/podcast";

export const mockPodcastSeries: PodcastSeries[] = [
  {
    id: 1,
    title: "The Daily Bits",
    author: "Tech Media",
    description: "Daily tech news and insights from the digital world",
    coverImage: "https://picsum.photos/seed/1/400",
    episodes: [
      {
        id: 1,
        title: "The Future of AI",
        description: "Exploring the latest developments in artificial intelligence",
        duration: "45:30",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        publishedAt: "Mar 15, 2024"
      },
      {
        id: 2,
        title: "Web Development Trends",
        description: "Latest trends in web development for 2024",
        duration: "38:15",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        publishedAt: "Mar 14, 2024"
      }
    ]
  },
  {
    id: 2,
    title: "Future Forward",
    author: "Innovation Hub",
    description: "Exploring breakthrough technologies and innovative solutions",
    coverImage: "https://picsum.photos/seed/2/400",
    episodes: [
      {
        id: 3,
        title: "Electric Vehicles Revolution",
        description: "The transformation of transportation",
        duration: "52:20",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        publishedAt: "Mar 13, 2024"
      },
      {
        id: 4,
        title: "Sustainable Tech",
        description: "How technology is helping fight climate change",
        duration: "41:45",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        publishedAt: "Mar 12, 2024"
      }
    ]
  },
  {
    id: 3,
    title: "Design Matters",
    author: "Creative Minds",
    description: "Conversations with leading designers and creators",
    coverImage: "https://picsum.photos/seed/3/400",
    episodes: [
      {
        id: 5,
        title: "UX Design Principles",
        description: "Core principles of user experience design",
        duration: "48:10",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        publishedAt: "Mar 11, 2024"
      }
    ]
  }
];
