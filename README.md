# POC SSR PWA

This project aims to experiment service worker ability to handle background network activity in order to optimize browsing a traditional SSR website.

## Introduction

PWA allows web developer to create advanced web application with powerful abilities:

-   a network proxy allowing request and response interception and handling
-   advanced cache with different cache strategy
-   offline browsing
-   handling templating through the service worker to avoid doing it in the main JS thread
-   managing an app shell for faster application bootstrap

For this POC, we aim to plug ourselves upon an existing traditional website.
The service worker will help to speed up navigation by preloading future needed resources.
The application is still server side rendered and each navigation unload the old page and load the new one, this is not a SPA!

## Bootstrap

```sh
clone git@github.com:astik/experiment-traditional-ssr-pwa.git
cd experiment-traditional-ssr-pwa
npm install
# generate server certificate (see HTTPS section below)
npm run start
```

Open browser on https://my-local-domain:3443.

## HTTPS

In order to use _serviceWorker_ we need the application to be served over HTTPS.

```sh
# feel free to update the request conf: server.conf
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.pem -config server.conf -sha256
```

The _subjectAltName_ attribute is needed for Chrome to accept the certificate.

As the POC is running in local, the self signed certificate may need to be added to your system keychain in order to be trusted.

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

As our POC is not about providing a PWA experience but focusing on providing a faster browsing experience, we should not have problem with `clients.claim()`.
It will allow us to take control of the page even at the first run.

## Prepare future navigation

The idea is to speed up future navigation.
To do so, we preload as much resources that might be used as possible.

To predict what page might be visited by user, we setup an event listener on some links.

In this POC, we listen to hover on main navigation links.
If one of those links is hovered, a _warmup_ event is triggered on the document.

The service worker initialization script add an event listener on the document for the _warmup_ event and forward the link information to warmup to the service worker.

The service worker is listening for message, especially those with a payload type _warmup_.
If a message is received, it fetches the page and add it to the cache, enhancing future navigation.

To go further, we need to analyze the retrieved page to extract linked resource from the HTML content and add them to the cache as well.

## Extracting resource from HTML content

Once we retrieved the HTML stream while warming up, we hit a new wall: transforming the string result into a DOM-like tree in order to extract images, stylesheets and scripts.
The idea is to be as light as possible, so we'll try not to load external dependencies and stick with what the browser has.

Using a regex for extracting resources' url is a no-way.

We could load the string in a *DocumentFragment* and then use *querySelectorAll*.
But, as the process is run inside the service worker, we do not have access to *document*.

Another solution would have been to use the *template* markup, but once again, *document* is not enable.

Another shot would be to use *DOMParser* but here again, it is not exposed to the service worker.
From https://github.com/w3c/ServiceWorker/issues/846, `DOM implementations in browsers are not thread-safe.`

Let's give up for now and try the external dependency: *parse5* (https://github.com/inikulin/parse5).

TODO

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

## Lorem ipsum generator

-   http://fillerama.io/
-   http://www.catipsum.com/index.php
-   http://officeipsum.com/index.php
-   https://trumpipsum.net/?paras=5&type=make-it-great
