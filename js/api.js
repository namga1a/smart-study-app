export async function searchWikipedia(query) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Topic not found");
  }

  return await response.json();
}

export async function fetchProgrammingInfo(tag) {
  const url = `https://api.stackexchange.com/2.3/tags/${encodeURIComponent(tag)}/wikis?site=stackoverflow`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to connect to Stack Overflow servers.");
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("No documentation summary found for this technical tag.");
  }

  return data.items[0]; 
}