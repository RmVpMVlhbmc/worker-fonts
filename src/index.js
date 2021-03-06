import { fetchX } from './utils.js'

addEventListener('fetch', event => {
  event.respondWith(
    main(event.request, event).catch(
      err => new Response(err.stack, { status: 500 }),
    ),
  )
})

async function main(request, event) {
  const cache = caches.default
  const url = new URL(request.url)

  data = await cache.match(request.url)
  if (data == undefined) {
    const headers = {
      'access-control-allow-origin': '*',
      'cross-origin-resource-policy': 'cross-origin',
      'cache-control': 'public, max-age=2592000, s-max-age=2592000, immutable',
    }
    const path = url.pathname.substr(1).split('/')
    //Use a modern browser useragent to make sure we get woff2 assets
    const reqHeaders = {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36',
    }

    switch (path[0]) {
      case 'styles':
        if (path[2] == null) {
          upstreamUrl = `https://fonts.googleapis.com/css2?family=${path[1]}`
          //Append css display option of there is one
        } else {
          upstreamUrl = `https://fonts.googleapis.com/css2?family=${path[1]}&display=${path[2]}`
        }
        res = await fetchX(upstreamUrl, { headers: reqHeaders })

        finalHeaders = Object.assign(
          {
            'content-type': res.headers.get('content-type'),
            'last-modified': res.headers.get('last-modified'),
          },
          headers,
        )

        //Replace resources url
        const body = (await res.text()).replace(
          /https:\/\/fonts.gstatic.com\/s/g,
          `${url.origin}/fonts`,
        )
        data = new Response(body, { headers: finalHeaders })
        break
      case 'fonts':
        res = await fetchX(
          `https://fonts.gstatic.com/s/${path.slice(1).join('/')}`,
        )

        finalHeaders = Object.assign(
          {
            'content-type': res.headers.get('content-type'),
            'last-modified': res.headers.get('last-modified'),
          },
          headers,
        )

        data = new Response(res.body, { headers: finalHeaders })
        break
      case 'favicon.ico':
        res = await fetchX(
          'https://www.gstatic.com/images/branding/product/1x/google_fonts_64dp.png',
        )

        finalHeaders = Object.assign(
          {
            'content-type': res.headers.get('content-type'),
            'last-modified': res.headers.get('last-modified'),
          },
          headers,
        )

        data = new Response(res.body, { headers: finalHeaders })
        break
      default:
        data = Response.redirect('https://github.com/RmVpMVlhbmc/worker-fonts', 301)
        break
    }

    //Store cache enrty parallelly
    event.waitUntil(cache.put(request.url, data.clone()))
  }

  return data
}
