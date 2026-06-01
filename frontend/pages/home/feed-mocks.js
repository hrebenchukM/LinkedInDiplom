(function () {
  "use strict";

  function mockPostImage(seed) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/600`;
  }

  function mockPostImageFallback(seed) {
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6164f1,e9edff,cbd5ff`;
  }

  window.feedPostImageUrl = function feedPostImageUrl(post) {
    const seed = post && (post.seed || post.id || post.author) ? post.seed || post.id || post.author : "feed";
    if (post && typeof post.image === "string" && post.image.trim() && !/images\.unsplash\.com/i.test(post.image)) {
      return post.image.trim();
    }
    return mockPostImage(seed);
  };

  window.feedPostImageFallback = function feedPostImageFallback(post) {
    const seed = post && (post.seed || post.id || post.author) ? post.seed || post.id || post.author : "feed";
    return mockPostImageFallback(seed);
  };

  window.FEED_MOCK_TEMPLATE = [
    {
      id: "mock-1",
      author: "Christian Nolan",
      seed: "ChristianNolan",
      role: "UI/UX Designer",
      textKey: "feed.mock1.text",
    },
    {
      id: "mock-2",
      author: "Jonathan Matthews",
      seed: "JonathanMatthews",
      role: "UX Designer",
      textKey: "feed.mock2.text",
    },
    {
      id: "mock-3",
      author: "Sarah Chen",
      seed: "SarahChen",
      role: "Product Designer",
      textKey: "feed.mock3.text",
    },
    {
      id: "mock-4",
      author: "Marcus Dias",
      seed: "MarcusDias",
      role: "Design Manager",
      textKey: "feed.mock4.text",
    },
    {
      id: "mock-5",
      author: "Elena Volkov",
      seed: "ElenaVolkov",
      role: "Frontend Developer",
      textKey: "feed.mock5.text",
    },
    {
      id: "mock-6",
      author: "James Lee",
      seed: "JamesLee",
      role: "UI Engineer",
      textKey: "feed.mock6.text",
    },
    {
      id: "mock-7",
      author: "Nina Petrova",
      seed: "NinaPetrova",
      role: "UX Research Lead",
      textKey: "feed.mock7.text",
    },
    {
      id: "mock-8",
      author: "Priya Patel",
      seed: "PriyaPatel",
      role: "DevOps Engineer",
      textKey: "feed.mock8.text",
    },
    {
      id: "mock-9",
      author: "Duncan Callahan",
      seed: "DuncanCallahan",
      role: "UX Researcher",
      textKey: "feed.mock9.text",
    },
    {
      id: "mock-10",
      author: "Ryan O'Brien",
      seed: "RyanOBrien",
      role: "Product Manager",
      textKey: "feed.mock10.text",
    },
    {
      id: "mock-11",
      author: "Sophie Martin",
      seed: "SophieMartin",
      role: "Visual Designer",
      textKey: "feed.mock11.text",
    },
    {
      id: "mock-12",
      author: "Alex Kim",
      seed: "AlexKim",
      role: "React Developer",
      textKey: "feed.mock12.text",
    },
    {
      id: "mock-13",
      author: "Timur Yamchuk",
      seed: "TimurYamchuk",
      role: "Full-stack Developer",
      textKey: "feed.mock13.text",
      avatar: "/auth/assets/timur-yamchuk-avatar.png",
    },
    {
      id: "mock-14",
      author: "Andrii Rotar",
      seed: "AndriiRotar",
      role: "Software Engineer",
      textKey: "feed.mock14.text",
      avatar: "/auth/assets/andrii-rotar-avatar.png",
    },
    {
      id: "mock-15",
      author: "David Jonson",
      seed: "DavidJonson",
      role: "Backend Developer",
      textKey: "feed.mock15.text",
    },
    {
      id: "mock-16",
      author: "Maria Rodriguez",
      seed: "MariaRodriguez",
      role: "Design Systems Lead",
      textKey: "feed.mock16.text",
    },
    {
      id: "mock-17",
      author: "Joshua Cortez",
      seed: "JoshuaCortez",
      role: "Mobile Developer",
      textKey: "feed.mock17.text",
    },
    {
      id: "mock-18",
      author: "Alena Curtis",
      seed: "AlenaCurtis",
      role: "Brand Designer",
      textKey: "feed.mock18.text",
    },
    {
      id: "mock-19",
      author: "Liam Nguyen",
      seed: "LiamNguyen",
      role: "QA Engineer",
      textKey: "feed.mock19.text",
    },
    {
      id: "mock-20",
      author: "Abram Lipshutz",
      seed: "AbramLipshutz",
      role: "Tech Lead",
      textKey: "feed.mock20.text",
    },
    {
      id: "mock-21",
      author: "Olivia Grant",
      seed: "OliviaGrant",
      role: "Content Strategist",
      textKey: "feed.mock21.text",
    },
    {
      id: "mock-22",
      author: "Daniel Weiss",
      seed: "DanielWeiss",
      role: "Data Analyst",
      textKey: "feed.mock22.text",
    },
    {
      id: "mock-23",
      author: "Kate Morrison",
      seed: "KateMorrison",
      role: "Scrum Master",
      textKey: "feed.mock23.text",
    },
    {
      id: "mock-24",
      author: "Ivan Petrov",
      seed: "IvanPetrov",
      role: "Cloud Architect",
      textKey: "feed.mock24.text",
    },
  ].map((post) => ({
    ...post,
    image: mockPostImage(post.seed || post.id),
  }));
})();
