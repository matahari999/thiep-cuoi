import { useEffect } from 'react'

interface OGMetaOptions {
  title: string
  description: string
  imageUrl: string
}

const DEFAULT_TITLE = 'Thiệp Cưới Online - Thiệp Mời Cưới Digital'

function setMetaTag(selector: string, attr: string, key: string, value: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

export function useOGMeta({ title, description, imageUrl }: OGMetaOptions) {
  useEffect(() => {
    document.title = title

    // Open Graph
    setMetaTag('meta[property="og:title"]',       'property', 'og:title',       title)
    setMetaTag('meta[property="og:description"]',  'property', 'og:description', description)
    setMetaTag('meta[property="og:image"]',        'property', 'og:image',       imageUrl)
    setMetaTag('meta[property="og:image:width"]',  'property', 'og:image:width', '1200')
    setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height','630')
    setMetaTag('meta[property="og:type"]',         'property', 'og:type',        'website')
    setMetaTag('meta[property="og:url"]',          'property', 'og:url',         window.location.href)

    // Twitter / X card
    setMetaTag('meta[name="twitter:card"]',        'name', 'twitter:card',       'summary_large_image')
    setMetaTag('meta[name="twitter:title"]',       'name', 'twitter:title',      title)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description',description)
    setMetaTag('meta[name="twitter:image"]',       'name', 'twitter:image',      imageUrl)

    // Standard description
    setMetaTag('meta[name="description"]', 'name', 'description', description)

    return () => { document.title = DEFAULT_TITLE }
  }, [title, description, imageUrl])
}
