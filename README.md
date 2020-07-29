# POC SSR PWA

This project aims to experiment service worker ability to handle background network activity in order to optimize browsing a traditional SSR website.

## Bootstrap

```sh
clone git@github.com:astik/experiment-traditional-ssr-pwa.git
cd experiment-traditional-ssr-pwa
npm install
# generate server certificate (see HTTPS section below)
npm run start
```

Open browser on https://knut.local:3443.

## HTTPS

In order to use _serviceWorker_ we need the application to be served over HTTPS.

```sh
# feel free to update the request conf: server.conf
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.pem -config server.conf -sha256
```

The _subjectAltName_ attribute is needed for Chrome to accept the certificate.

As the POC is running in local, the self signed certificate may need to be added to your system keychain in order to be trusted.

## Lorem ipsum generator

-   http://fillerama.io/
-   http://www.catipsum.com/index.php
-   http://officeipsum.com/index.php
-   https://trumpipsum.net/?paras=5&type=make-it-great

## Content-Security-Policy

CSP needs to be enabled on _self_ for this POC to work:

-   _manifest_ to allow PWA
-   _script_ and _worker_ for triggering the service worker
-   _img_, _style_ for UI example

An additional endpoint is available if _CSP report only_ feature is needed.
You can check the CSP middleware in _src/routes/index.js_:

```js
const cspMiddleware = function (req, res, next) {
	res.set(
		'Content-Security-Policy',
		`default-src 'none'; child-src 'none'; img-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self'; manifest-src 'self'; report-uri /csp/report`
	);
	return next();
};
```

## Service worker scope

Service worker is in a nested folder: _public/sw.js_ but needs access to the root level _/_.
In order to do so, a specific header needs to be sent in _src/index.js_:

```js
app.use('/public/sw.js', function (req, res, next) {
	res.set('Service-Worker-Allowed', '/');
	return next();
});
```

Be careful to set it before the _static_ middleware.

## Chrome extension injection

Extensions like _uMatrix_ may inject some code inside HTTP headers sent to and retrieved from server.
In a service worker scenario, _uMatrix_ may inject this header in HTML stream:

```
Content-Security-Policy-Report-Only: worker-src 'none'; report-uri about:blank
```

It overrides any _Content-Security-Policy-Report-Only_ header that may be set by server.

It triggers a error:

```
[Report Only] Refused to create a worker from 'https://knut.local:3443/public/sw.js' because it violates the following Content Security Policy directive: "worker-src 'none'".
```

Also, as no _report-uri_ is set in the header, no endpoint can be called and you'll get another error:

```
POST about:blank net::ERR_UNKNOWN_URL_SCHEME
```

In this use case, you may use privacy mode to disable temporary the extension or you can simply turn it off.

More information: https://github.com/gorhill/uMatrix/wiki/Raw-settings#disablecspreportinjection

## First run

from https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#activate

```
The first time you load the demo, even though dog.svg is requested long after the service worker activates, it doesn't handle the request, and you still see the image of the dog. The default is consistency, if your page loads without a service worker, neither will its subresources. If you load the demo a second time (in other words, refresh the page), it'll be controlled. Both the page and the image will go through fetch events, and you'll see a cat instead.
```

from https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#clientsclaim

```
You can take control of uncontrolled clients by calling clients.claim() within your service worker once it's activated.
...
If you use your service worker to load pages differently than they'd load via the network, clients.claim() can be troublesome, as your service worker ends up controlling some clients that loaded without it.
```

As our POC is not about providing a PWA experience but focusing on providing a faster browsing, we should not have problem with `clients.claim()`.
It will allow us to take control of the page even at the first run.

## TODO

-   identify a target website
-   isolate common structure
-   add a proxy ?
-   intercept request
-   extract from response useful content, response without common structure
-   define common structure as app shell
-   manage cache for app shell : long cache with a background refresh ? cache first ?
-   manage cache for content : short cache ?
-   serve optimized chunk from server for content, do not send common structure

## Something to search for

-   how preload play along with SW cache ?
-   how prefetch play along with SW cache ?
-   how race condition are handle with SW cache warmup ?
-   how communicate page to load from page to SW ? use prefetch like it is done with instant.page ?
-   should we define a minimum cache for html content ?
-   how expires or cache-control play along with SW cache TTL ?

## Literature

Prefetch / preload

-   [en] https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf
-   [en] https://instant.page/ and https://github.com/instantpage/instant.page
-   [fr] https://blog.dareboost.com/fr/2020/05/preload-prefetch-et-preconnect-resource-hints/

Service worker

-   [en] https://jakearchibald.com/2014/offline-cookbook/
-   [en] https://serviceworke.rs/
-   [en] https://developers.google.com/web/fundamentals/primers/service-workers
-   [en] https://classroom.udacity.com/courses/ud899

TO READ

-   [en] https://developers.google.com/web/updates/2018/05/beyond-spa
-   [en] https://developers.google.com/web/tools/workbox/ ?
-   [en] https://love2dev.com/blog/pwa-spa/
