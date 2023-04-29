# Yandex music discor rich pressence
Use tampermonkey to watch yandex music track changes in browser
then update discord rich pressence through node server

## Getting started 

add `src/tampermonkey-watch-script.js` script to tampermonkey userscript

Run rich pressence server
```shell
pnpm install
pnpm run start
```
Open `yandex.music.ru` and enjoy rich pressence

## Why tampermonkey?
Tampermonkey used cause yandex.music does't provide public api/sdk.
Non offical sdk is broken (python) does't get track list properly and require manualy token extraction. NodeJs sdk just outdated and not work.

So simpliest solution just use tampermonkey and extract minimal information direclty from web page.

Yeah it does't work in application