const API = "https://discord.com/api/v10";
const CDN = "https://cdn.discordapp.com";

function defaultAvatar(id) {
  return `${CDN}/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
}

export async function fetchMember(id, size = 256) {
  const token = import.meta.env.DISCORD_BOT_TOKEN ?? process.env.DISCORD_BOT_TOKEN;
  const fallback = {name: "Unknown", avatar: defaultAvatar(id)};

  if (!token) {
    console.warn(".env does not have a set DISCORD_BOT_TOKEN, falling back for user: " + id);
    return fallback;
  }

  try {
    const response = await fetch(`${API}/users/${id}`, {
      headers: {Authorization:`Bot ${token}`},
    });

    if (!response.ok) {
      console.warn(`Discord returned ${response.status} for ${id}`);
      return fallback;
    }

    const user = await response.json();

    return {
      name: user.global_name ?? user.username,
      avatar: user.avatar? `${CDN}/avatars/${id}/${user.avatar}.png?size=${size}` : defaultAvatar(id),
    };
  } catch (error) {
    console.warn(`Failed to fetch ${id}:`, error);
    return fallback;
  }
}