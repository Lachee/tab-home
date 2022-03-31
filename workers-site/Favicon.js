export function fetchFavicon(url) {
    const quickSearch = (async () => {
        const faviconUrl = url + 'favicon.ico';
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        if (response.status !== 200) throw new Error('Bad response code ' + response.status);
        return faviconUrl;
    })();

    const deepSearch = (async () => {
        const response = await fetch(url);
        if (response.status !== 200)
            throw new Error('Bad response code ' + response.status);

        let body = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

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

                const icons = findIconLink(body);
                if (!icons.length)
                    throw new Error('Failed to find any favicons');

                // TODO: Make the favicons pick the largest by default
                const faviconUrl = new URL(icons[0].href, icons[0].base || url);
                return faviconUrl.toString();
            }
        }
    })();

    return Promise.any([quickSearch, deepSearch]);
}

/** Finds the favicon from the header */
function findIconLink(head) {
    let icons = [];

    // TODO: Find the base tag and use it to set the link relative path
    for (let match of head.matchAll(/<link .*>/g)) {
        const html = match[0].substring(match[0].indexOf('<link') + 5, match[0].indexOf('>'));
        const pairs = html.split(/ (?=(?:[^"]*"[^"]*")*[^"]*$)/g);

        let attributes = {};
        for (let pair of pairs) {
            if (pair.trim() === '') continue;
            const [key, value] = pair.split('=', 2);
            if (key === undefined || value === undefined) continue;

            attributes[key.toLowerCase()] = value.substring(value.indexOf('"')+1, value.lastIndexOf('"'));
        }

        if (attributes['rel'] === 'icon')
            icons.push(attributes);
    }

    return icons;
}