import rss, { pagesGlobToRssItems } from '@astrojs/rss'
import { isBefore } from 'date-fns'

const items = await pagesGlobToRssItems(import.meta.glob('./[0-9][0-9][0-9][0-9]/[0-9][0-9]/**/*.(md|mdx)'))

export function GET(context) {
	const now = new Date()

	return rss({
		title: 'The Settlers II.net Blog',
		description: 'News and updates around the topic of The Settlers II and Return to the Roots.',
		site: context.site,
		items: items.filter((item) => isBefore(item.pubDate, now)).sort((a, b) => +a.pubDate - +b.pubDate),
	})
}
