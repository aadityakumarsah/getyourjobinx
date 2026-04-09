import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  
  const { searchParams } = new URL(request.url);
  const field = searchParams.get("field") || "Tech";
  const subfield = searchParams.get("subfield") || "Frontend";
  const query = searchParams.get("query") || "";
  const nextToken = searchParams.get("nextToken") || undefined;

  // Logging for debugging
  console.log(`[API] Fetching jobs for: ${field} > ${subfield} ${query ? `(${query})` : ""}`);
  console.log(`[API] Bearer Token present: ${!!TWITTER_BEARER_TOKEN}`);

  // If no token, return mock data for demo purposes
  if (!TWITTER_BEARER_TOKEN) {
    console.log("[API] No token found, returning mock data.");
    return NextResponse.json({
      data: generateMockJobs(subfield, field, query),
      meta: { next_token: nextToken ? null : "mock_next_token" },
      isMock: true
    });
  }

  try {
    // Construct the search query
    // We search for "hiring" or "job" keywords along with the subfield
    // We exclude tweets that are people looking FOR jobs using -"looking for a job"
    const searchQuery = `(hiring OR "job opening" OR "we are hiring") "${subfield}" ${query} -is:retweet -is:reply -"looking for a job" -"searching for a job"`;
    
    const url = new URL("https://api.twitter.com/2/tweets/search/recent");
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("tweet.fields", "created_at,entities,author_id");
    url.searchParams.append("expansions", "author_id");
    url.searchParams.append("user.fields", "name,username,profile_image_url");
    url.searchParams.append("max_results", "20");
    if (nextToken) url.searchParams.append("next_token", nextToken);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch from Twitter API");
    }

    const json = await response.json();
    
    // Transform Twitter API response to our Job interface
    const users = json.includes?.users || [];
    const jobs = (json.data || []).map((tweet: any) => {
      const user = users.find((u: any) => u.id === tweet.author_id);
      return {
        id: tweet.id,
        text: tweet.text,
        author: user?.name || "Unknown",
        authorHandle: `@${user?.username || "unknown"}`,
        authorAvatar: user?.profile_image_url || "",
        createdAt: formatRelativeTime(tweet.created_at),
        url: `https://x.com/${user?.username}/status/${tweet.id}`,
      };
    });

    return NextResponse.json({
      data: jobs,
      meta: json.meta,
      isMock: false
    });

  } catch (error: any) {
    console.error("Twitter API Error Detail:", error);
    return NextResponse.json({ 
      error: error.message,
      detail: "Check server logs for full stack trace. Possible issues: Invalid Bearer Token, Rate limits (max 1500/mo on Free), or restricted search query."
    }, { status: 500 });
  }
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
}

function generateMockJobs(subfield: string, field: string, query: string) {
  return Array.from({ length: 15 }).map((_, i) => {
    const id = Math.random().toString(36).substring(7);
    const mins = Math.floor(Math.random() * 59) + 1;
    return {
      id,
      text: `We are looking for a ${subfield} specialist to join our ${field} team at ${['GlobalTech', 'InnovateX', 'VibeCheck', 'Supabase', 'Resend'][i % 5]}! \n\nMust have experience with ${query || 'modern tools'}. \n\nApply here: https://t.co/example \n#hiring #jobs #${subfield.toLowerCase()}`,
      author: ["Tech Recruiter", "Sarah Jenkins", "Dev Hiring", "Startup Jobs", "X Hiring"][i % 5],
      authorHandle: `@recruiter_${i}`,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      createdAt: `${mins} min ago`,
      url: `https://x.com/status/${id}`,
    };
  });
}
