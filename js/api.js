export async function searchWikipedia(query) {
  const url =
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Topic not found");
  }

  return await response.json();
}