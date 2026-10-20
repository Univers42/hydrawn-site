// The people who built Hydrawn, read from GitHub when the site is built, never by the
// visitor's browser: the avatars are embedded in the page, so a visit asks GitHub nothing.
// The app and its engine are two repositories; one person's commits to both count once.
//
// With GITHUB_TOKEN set (the release workflow sets it) a failed read fails the build, so
// a release never quietly drops the faces. Without one (a local or Docker build, limited
// to 60 unauthenticated calls an hour) the section shows only the link to GitHub.

export const REPOSITORY = "https://github.com/Univers42/hydrawn";
const REPOSITORIES = ["Univers42/hydrawn", "Univers42/draw-engine"];

export interface Contributor {
  login: string;
  profile: string;
  avatar: string; // a data: URI
  contributions: number;
}

interface GitHubContributor {
  login: string;
  html_url: string;
  avatar_url: string;
  type: string;
  contributions: number;
}

async function read(url: string, token: string | undefined): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

async function fetchContributors(token: string | undefined): Promise<Contributor[]> {
  const byLogin = new Map<string, GitHubContributor>();
  for (const repository of REPOSITORIES) {
    const url = `https://api.github.com/repos/${repository}/contributors?per_page=100`;
    const people = (await (await read(url, token)).json()) as GitHubContributor[];
    for (const person of people) {
      if (person.type !== "User") continue;
      const known = byLogin.get(person.login);
      if (known) known.contributions += person.contributions;
      else byLogin.set(person.login, { ...person });
    }
  }
  const people = [...byLogin.values()].sort((a, b) => b.contributions - a.contributions);
  return Promise.all(
    people.map(async (person) => {
      const picture = await read(`${person.avatar_url}&s=96`, undefined);
      const type = picture.headers.get("content-type") ?? "image/png";
      const bytes = Buffer.from(await picture.arrayBuffer()).toString("base64");
      return {
        login: person.login,
        profile: person.html_url,
        avatar: `data:${type};base64,${bytes}`,
        contributions: person.contributions,
      };
    }),
  );
}

export async function contributors(): Promise<Contributor[]> {
  const token = process.env.GITHUB_TOKEN || undefined;
  try {
    return await fetchContributors(token);
  } catch (error) {
    if (token) throw error;
    console.info(`Contributors left out of this build (${String(error)}).`);
    return [];
  }
}
