# stream-nagle

> Reduce your websocket package count

[![NPM](https://nodei.co/npm/stream-nagle.png)](https://nodei.co/npm/stream-nagle/)

Wait for time to pass or a threshold to be met before sending data

---

## Why

Although not directly obvious, any socket or stream within a node environment (including websockets) are streams which
may pass through numerous systems implementing all kinds of packet switching and stream-packet conversions like
networks, proxies, etc. This package buffers data until there is enough to send or a time window has passed, to send
less packages with more data. Sending less packages reduces network traffic & improves context switching (whether
within the OS, javascript engine or otherwise), resulting in a better overall experience or lower cost to host.

## This isn't nagle

True, this package only implements behavior to emulate like nagle's algorithm. The actual nagle algorithm waited for
it's threshold to be met or an acknowledgement of the previous package by the receiving peer (which is not possible in a
1-way stream within javascript).

## Installation

```bash
npm install --save stream-nagle
```

## Usage

stream-nagle does NOT modify the data going through a pipe, only at which times & the amount of bytes. In the
background, [through][through] is used to handle streams.

You can use an instance of stream-nagle as if it were a pass-through stream.

Initialization:

```js
const nagle = require('stream-nagle');

// Initialize the stream
// Shown are the default options
let nagleStream = nagle({
  aggressive: false, // Whether to reset the timer on an incoming packet
  mtu       : 2048,  // Max outgoing package size in bytes & transmission threshold
  wait      :  200,  // Milliseconds to wait for another package
  burst     : true,  // Empty the whole buffer on sending
});
```

Application:

```js
/** @var {WebsocketServer} ws */
ws.on('connection', function(client) {
  /** @var {WebsocketStream} client */
  let randomStream = fs.createReadStream('/dev/random');
  randomStream.pipe(nagle()).pipe(client);
});
```

[through]: https://www.npmjs.com/package/through
