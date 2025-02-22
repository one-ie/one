export interface Icon {
  title: string;
  slug: string;
  svg: string;
  hex: string;
  source: string;
}

export async function fetchSimpleIcons(slugs: string[]): Promise<Icon[]> {
  try {
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${slugs.join(",")}.json`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch icons");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching icons:", error);
    return [];
  }
} 