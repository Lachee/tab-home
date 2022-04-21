export async function fetchFavicon(url) {
    const quickSearch = (async () => {
        const faviconUrl = (new URL('/favicon.ico', url)).toString();
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        if (response.status !== 200) {
            console.log('Bad Response from ', faviconUrl);
            throw new Error('Bad response code ' + response.status);
        }

        return faviconUrl;
    })();

    const deepSearch = (async () => {
        try 
        {
            console.log("deep state", url.toString());
            const response = await fetch(url);
            if (response.status !== 200)
                throw new Error('Bad response code ' + response.status);

            let body = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            console.log('decoding response of ', response.status);
            let isDone = false;
            while (!isDone) {
                const chunk = await reader.read();
                isDone = chunk.done;

                const text = decoder.decode(chunk.value);
                body += text;

                const eoh = body.lastIndexOf('</head>');
                if (eoh >= 0) {
                    const soh = body.indexOf('<head>');
                    body = body.substring(soh, eoh + 7);

                    console.log('Finished decoding head, parsing...');
                    const links = findLinkAttributes(body);

                    // Load the manifest for a better icon
                    if (links.manifest != null) {
                        console.log('Found a manifest', links.manifest.href);
                        const manifestUrl = await findManifestIcon(new URL(links.manifest.href, links.manifest.base || url));
                        if (manifestUrl != null) {
                            console.log('found manifest source', manifestUrl);
                            return manifestUrl;
                        } else {
                            console.log('manifest is null!');
                        }
                    }

                    // Load the first favicon we find
                    if (links.icons.length > 0) {
                        const faviconUrl = (new URL(links.icons[0].href, links.icons[0].base || url)).toString();
                        console.log('found favicon url', faviconUrl);
                        return faviconUrl;
                    }

                    // Load manifest
                    console.log('NO appropriate favicons found', JSON.stringify(links));
                    throw new Error('Failed to find any appropriate icons');
                }
            }
        } catch (e) {
            console.error('failed to parse deepstate', e.message);
            throw e;
        }
    })();

    const results = (await Promise.allSettled([quickSearch, deepSearch]))
        .map(r => r.value)
        .filter(r => r != undefined);

    console.log('Response for ', url, results);
    if (results.length == 0) return null;
    return results[results.length - 1];
}

/** Finds the favicon from the header */
function findLinkAttributes(head) {
    let links = {
        icons: [],
        manifest: null,
    }

    // TODO: Find the base tag and use it to set the link relative path
    for (let match of head.matchAll(/<link .*>/g)) {
        const html = match[0].substring(match[0].indexOf('<link') + 5, match[0].indexOf('>'));
        const pairs = html.split(/ (?=(?:[^"]*"[^"]*")*[^"]*$)/g);

        let attributes = {};
        for (let pair of pairs) {
            if (pair.trim() === '') continue;
            const [key, value] = pair.split('=', 2);
            if (key === undefined || value === undefined) continue;

            attributes[key.toLowerCase()] = value.substring(value.indexOf('"') + 1, value.lastIndexOf('"'));
        }

        if (attributes['rel'] != null) {
            if (attributes['rel'] === 'icon' || attributes['rel'].includes(' icon'))
                links.icons.push(attributes);
            if (attributes['rel'] === 'manifest')
                links.manifest = attributes;
        }
    }

    return links;
}

async function findManifestIcon(url) {
    console.log('fetching url ', url.toString())

    const userAgent = 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36'
    const response = await fetch(url, {
        headers: {
            'User-Agent': userAgent
        }
    });

    const manifest = await response.json();
    if (manifest.icons && manifest.icons.length > 0) {
        return manifest.icons[0].src;
    }
    return null;
}