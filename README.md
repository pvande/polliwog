# Polliwog

Sometimes it's unavoidable.  The only way to get updates from that web service
you love is to nag at it, endlessly repeating the same HTTP request like a child
who's grown tired of the car ride.  **Polliwog manages the details so that you
can focus on the data.**

## Features

* Transforms a URL into an EventEmitter **stream of data events**.
* **Cache-hint awareness** means fewer unnecessary HTTP requests by default.
* **Response de-duplication** keeps your application from re-processing the same
  data over and over again.

## Getting Started

There's no better way to explain Polliwog than with an example.

``` javascript
const url = 'http://date.jsontest.com'
const options = { json: true }

const p = new Polliwog(url, options)
p.on('response', console.log)
p.start()
```

## Configuration

The Polliwog constructor takes two arguments, he HTTP or HTTPS URL to poll, and
an optional hash of configuration options.

The following configuration options are supported.

#### `interval` (default: `500`)
Specifies the polling interval, in milliseconds.

#### `json` (default: `false`)
When `true`, response bodies will be parsed as JSON.

#### `emitUnchanged` (default: `false`)
When `true`, events will be fired following every request (rather than when data
has changed).

#### `skipCache` (default: `false`)
When `true`, locally cached data will always be considered expired.  *Note that
on its own, this will still result in conditional requests based on the `Etag`
and `Last-Modified` headers being made.*

#### `skipEtag` (default: `false`)
When `true`, Etags will not be considered when testing cache validity.

#### `skipLastModified` (default: `false`)
When `true`, the Last-Modified date will not be considered when testing cache
validity.

## Events

#### `'response'` => `(code, headers, body)`

Produces a stream of HTTP responses, regardless of HTTP status code.

#### `success` => `(body)`

Produces a stream of successful HTTP responses (`2xx`).

#### `failure` => `(body)`

Produces a stream of unsuccessful HTTP responses (`4xx` and `5xx`).

#### `error` => `(err)`

Produces a stream of exceptions, from networking failures to JSON parsing errors.

<!--
#### `poll` => `()`

Fires at the end of each polling interval; primarily used as a diagnostic and
for testing.
-->

## API

#### `new Polliwog(url, options)`

Constructs a new poller for the specified URL.  See
[Configuration](#configuration) for a list of the supported options.

#### `on(event, callback)`
#### `addListener(event, callback)`

Regiiwogs a new callback for the named event.  See [Events](#events) for a list
of the supported events.

#### `removeListener(event, callback)`

Unregiiwogs a callback from the named event.

#### `start()`

Begins polling the URL for data and firing the appropriate events.

#### `stop()`

Terminates the current polling cycle and aborts any further data processing.
Events for any outstanding requests may still be fired after this method is
called.
