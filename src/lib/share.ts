export function shareNative(title: string, url: string) {
  if (navigator.share) {
    navigator.share({ title, url })
  } else {
    copyToClipboard(url)
  }
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

export function shareZalo(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  window.open(`https://zalo.me/share?url=${encodedUrl}&title=${encodedTitle}`, '_blank', 'noopener')
}

export function shareFacebook(url: string) {
  const encodedUrl = encodeURIComponent(url)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener')
}

export function shareKakaoTalk(url: string, title: string) {
  if (typeof window.Kakao !== 'undefined' && window.Kakao.isInitialized()) {
    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        imageUrl: `${window.location.origin}/android-chrome-192x192.png`,
        link: { mobileWebUrl: url, webUrl: url },
      },
    })
  } else {
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`, '_blank', 'noopener')
  }
}

export function shareWhatsApp(url: string) {
  const encodedUrl = encodeURIComponent(url)
  window.open(`https://wa.me/?text=${encodedUrl}`, '_blank', 'noopener')
}

export function shareTwitter(url: string, title: string) {
  const text = encodeURIComponent(`${title} | ${url}`)
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener')
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      Link: {
        sendDefault: (config: {
          objectType: string
          content: {
            title: string
            imageUrl: string
            link: { mobileWebUrl: string; webUrl: string }
          }
        }) => void
      }
    }
  }
}
