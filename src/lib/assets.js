/** URLs of media imported by writing pages. Filled when those modules load. */
export const pageAssets = [];

export function registerAssets(...urls) {
	for (const url of urls) {
		if (url && !pageAssets.includes(url)) pageAssets.push(url);
	}
}
