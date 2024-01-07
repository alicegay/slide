const formatSource = (url: string) => {
  const source = url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')

  if (source.startsWith('pixiv.net'))
    return 'pixiv / ' + source.split('/')[source.split('/').length - 1]

  if (source.startsWith('fantia.jp'))
    return 'fantia / ' + source.split('/')[source.split('/').length - 1]

  if (source.startsWith('nijie.info'))
    return 'nijie / ' + source.split('id=')[1]

  if (source.split('.')[1] === 'fanbox')
    return (
      'fanbox / ' +
      source.split('.')[0] +
      ' / ' +
      source.split('/')[source.split('/').length - 1]
    )

  if (source.startsWith('twitter.com'))
    return (
      'twitter / ' +
      source.split('/')[source.split('/').length - 3] +
      ' / ' +
      source.split('/')[source.split('/').length - 1]
    )

  if (source.startsWith('deviantart.com'))
    return (
      'deviantart / ' +
      source.split('/')[1] +
      ' / ' +
      source.split('-')[source.split('-').length - 1].split('.')[0]
    )

  if (source.startsWith('gelbooru.com'))
    return 'gelbooru / ' + source.split('id=')[1]

  if (source.startsWith('hitomi.la'))
    return (
      'hitomi / ' +
      source.split('-')[source.split('-').length - 1].split('.')[0]
    )

  return source
}

export default formatSource
