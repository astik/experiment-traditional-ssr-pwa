# POC SSR PWA

The idea is to plug a PWA upon an existing traditional SSR website and being able to optimize loading.

-   identify a target website
-   isolate common structure
-   add a proxy ?
-   intercept request
-   extract from response useful content, response without common structure
-   define common structure as app shell
-   manage cache for app shell : long cache with a background refresh ? cache first ?
-   manage cache for content : short cache ?
-   serve optimized chunk from server for content, do not send common structure

## Lorem ipsum generator

-   http://fillerama.io/
-   http://www.catipsum.com/index.php
-   http://officeipsum.com/index.php
-   https://trumpipsum.net/?paras=5&type=make-it-great

## HTTPS

In order to use _serviceWorker_ we need the application to be served over HTTPS.

```sh
# feel free to update the request conf: server.conf
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.pem -config server.conf -sha256
```
