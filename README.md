# Byteball ICO bot (web)

## Environment

### Back End
* [node.js](https://nodejs.org/en/) (v8.x.x)
* [sqlite](https://www.postgresql.org/) (v3.x.x)
* [pm2](http://pm2.keymetrics.io/)

### Front End
* [bower](https://bower.io/)
* [jquery](http://api.jquery.com/) (v3.x.x)
* [bootstrap](https://getbootstrap.com/docs/4.0/) (v4.x.x)
* [pug](https://pugjs.org)
* [stylus](http://stylus-lang.com/)

## First Init

```
npm install
```
or 
```
yarn install
```
will install all modules (node_modules, bower_modules)

## Client Build

* build (production)
```
npm run build
```
* build and start listening changes (production)
```
npm run builder
```
* build (development)
```
npm run build-dev
```
* build and start listening changes (development)
```
npm run builder-dev
```

## Server Start

* production
```
KEY1=VALUE1 KEY2=VALUE2 ... pm2 start pm2.config.js
```
* development
```
KEY1=VALUE1 KEY2=VALUE2 ... pm2-dev start pm2.config.js
```

`KEY1=VALUE1 KEY2=VALUE2 ...` - this is the node.js environment variables,  
that need to define for your configuration

you can use file `.env` in root of the project for store your environment variables

### Node.js environment variables

* `NODE_ENV` - `production` or `development` or other (`development`)
* `PORT` - port (`80` for `production`, `8080` for `development`)
* `DB_FILENAME` - path to sqlite3 database
* `SSL` - port to database (`false`)
* `SSL_KEY` - filename of ssl key (`ca.key`)
* `SSL_CRT` - filename of ssl crt (`ca.crt`)
