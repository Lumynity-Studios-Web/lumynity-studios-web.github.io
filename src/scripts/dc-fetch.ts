const API = 'https://discord.com/api/v10';
const CDN = 'https://cdn.discordapp.com';

const cache = new Map<string, CacheEntry>();
const cacheTimeout = Temporal.Duration.from({ minutes: 30 });
interface CacheMember {
    name: string;
    avatarHash?: string;
}
interface CacheEntry extends CacheMember {
    updated: Temporal.Instant;
}

function defaultAvatar(id: string): string {
    return `${CDN}/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
}

interface Member {
    name: string;
    avatar: string;
}

function exportMember(
    id: string,
    cacheMember: CacheMember,
    avatarSize: number,
): Member {
    return {
        name: cacheMember.name,
        avatar: cacheMember.avatarHash
            ? `${CDN}/avatars/${id}/${cacheMember.avatarHash}.png?size=${avatarSize}`
            : defaultAvatar(id),
    };
}

export async function getMember(id: string, avatarSize = 256): Promise<Member> {
    let member = getCachedMember(id);
    if (member) return exportMember(id, member, avatarSize);

    member = await fetchMember(id);
    setCachedMember(id, member);
    return exportMember(id, member, avatarSize);
}

async function fetchMember(id: string): Promise<CacheMember> {
    const token = import.meta.env.DISCORD_BOT_TOKEN ??
        process.env.DISCORD_BOT_TOKEN;
    const fallback = { name: 'Unknown' };

    if (!token) {
        console.warn(
            '.env does not have a set DISCORD_BOT_TOKEN, falling back for user: ' +
                id,
        );
        return fallback;
    }

    try {
        const response = await fetch(`${API}/users/${id}`, {
            headers: { Authorization: `Bot ${token}` },
        });

        if (!response.ok) {
            console.warn(`Discord returned ${response.status} for ${id}`);
            return fallback;
        }

        const user = await response.json();

        return {
            name: user.global_name ?? user.username,
            avatarHash: user.avatar,
        };
    } catch (error) {
        console.warn(`Failed to fetch ${id}:`, error);
        return fallback;
    }
}

function getCachedMember(id: string): CacheMember | null {
    const now = Temporal.Now.instant();

    const cachedMember = cache.get(id);
    if (
        !cachedMember ||
        // If cache is out-of-date (cache expiry before now)
        Temporal.Instant.compare(
                cachedMember.updated.add(cacheTimeout),
                now,
            ) === -1
    ) {
        return null;
    }

    return cachedMember;
}

function setCachedMember(id: string, member: CacheMember) {
    const now = Temporal.Now.instant();
    cache.set(id, { updated: now, ...member });
}
