const toGet = async (req) => {
  const proxy = new URL('/proxy', location.origin);

  proxy.searchParams.set('method', req.method);
  proxy.searchParams.set('url', req.url);

  for (const [key, value] of req.headers) {
    proxy.searchParams.set(`header:${key}`, value);
  }

  if (req.body) {
    const contentType = req.headers.get('content-type') || '';

    if (/text|script|xml|html|json|pdf/i.test(contentType)) {
      proxy.searchParams.set('body', await req.text());
      proxy.searchParams.set('bodyType', 'text');
    } else {
      proxy.searchParams.set(
        'body',
        (await req.bytes()).toBase64()
      );
      proxy.searchParams.set('bodyType', 'base64');
    }
  }

  return String(proxy);
};

const fromGet = (url) => {
  const proxy = new URL(url);

  const headers = new Headers();

  for (const [key, value] of proxy.searchParams) {
    if (key.startsWith('header:')) {
      headers.set(key.slice(7), value);
    }
  }

  let body = proxy.searchParams.get('body');

  if (
    body != null &&
    proxy.searchParams.get('bodyType') === 'base64'
  ) {
    body = Uint8Array.fromBase64(body);
  }

  return new Request(proxy.searchParams.get('url'), {
    method: proxy.searchParams.get('method'),
    headers,
    body,
  });
};
