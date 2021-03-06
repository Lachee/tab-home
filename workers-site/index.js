import { getAssetFromKV, mapRequestToAsset, NotFoundError } from '@cloudflare/kv-asset-handler'
import { discoverFavicon } from './Favicon';

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

addEventListener('fetch', event => {
    try {
        event.respondWith(handleEvent(event))
    } catch (e) {
        if (DEBUG) {
            return event.respondWith(
                new Response(e.message || e.toString(), {
                    status: 500,
                }),
            )
        }
        event.respondWith(new Response('Internal Error', { status: 500 }))
    }
})

async function handleEvent(event) {
    const url = new URL(event.request.url);
    const cache = caches.default;
    let options = {}


    /**
     * You can add custom logic to how we fetch your assets
     * by configuring the function `mapRequestToAsset`
     */
    // options.mapRequestToAsset = handlePrefix(/^\/docs/)

    try {
        if (DEBUG) {
            // customize caching
            options.cacheControl = {
                //bypassCache: true,
            };
        }
        

        // Determine the URL and if its /api
        console.log('request pathname', url.pathname);
        let response = null;
        switch(url.pathname) {
            // Basic static content serving
            default:
                try {
                    console.log('fetching assets', event.request.url);
                    const page = await getAssetFromKV(event, options);
                    response = new Response(page.body, page);
                } catch(e) {
                    if (e instanceof NotFoundError) {
                        // 404s should get a redirect to asset to let React handle
                        options.mapRequestToAsset = (request) => {
                            const defaultUrl = (new URL(request.url)).origin;
                            const defaultAssetKey = mapRequestToAsset(new Request(defaultUrl, request));
                            
                            const url = new URL(defaultAssetKey.url);
                            return new Request(url.toString(), request);
                        };

                        const errpage = await getAssetFromKV(event, options);
                        response = new Response(errpage.body, errpage);
                    } else {
                        // Every other error handle as normal
                        throw e;
                    }
                }
                response.headers.set("X-XSS-Protection", "1; mode=block");
                response.headers.set("X-Content-Type-Options", "nosniff");
                response.headers.set("X-Frame-Options", "DENY");
                response.headers.set("Referrer-Policy", "unsafe-url");
                response.headers.set("Feature-Policy", "none");
                return response;

            // Favicon API serving
            case '/api/favicon':
                response = await cache.match(event.request, {});
                if (!response) { 
                    const favicon = await discoverFavicon(url.searchParams.get('url'));
                    response = (await fetch(favicon));
                    event.waitUntil(cache.put(event.request, response.clone()));
                }
                return response;

        }


    } catch (e) {
        // if an error is thrown try to serve the asset at 404.html
        // if (!DEBUG) {
        //     try {
        //         let notFoundResponse = await getAssetFromKV(event, {
        //             mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req),
        //         })
        // 
        //         return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
        //     } catch (e) { }
        // }

        console.error('Failed to fetch:', e.message);
        return new Response(e.message || e.toString(), { status: 500 })
    }
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
    return request => {
        // compute the default (e.g. / -> index.html)
        let defaultAssetKey = mapRequestToAsset(request)
        let url = new URL(defaultAssetKey.url)

        // strip the prefix from the path for lookup
        url.pathname = url.pathname.replace(prefix, '/')

        // inherit all other props from the default request
        return new Request(url.toString(), defaultAssetKey)
    }
}