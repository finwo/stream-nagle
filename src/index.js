const through = require('through');

module.exports = function( options ) {
  let opts = Object.assign({
    aggressive: false, // Whether to reset the timer on an incoming packet
    mtu       : 2048,  // Max outgoing package size in bytes & transmission threshold
    wait      :  200,  // Milliseconds to wait for another package
    burst     : true,  // Empty the whole buffer on sending
  }, options || {});

  // This is where we store stuff
  /** @var {Buffer}         queue */
  /** @var {Number|Boolean} timeout */
  let queue   = Buffer.alloc(0),
      timeout = false,
      bound   = false;

  // Actually sends the data
  let sendQueue = function() {
    timeout = false;

    // Fetch & emit data
    let data = queue.slice(0,opts.mtu);
    queue    = queue.slice(data.length);
    this.emit('data',data);

    // Burst
    if (opts.burst && queue.length) {
      console.log('burst');
      return sendQueue();
    }

    // Run again asap if >mtu
    if (queue.length >= opts.mtu) {
      timeout = setTimeout(sendQueue,0);
      return;
    }

    // Run again if we have data
    if (queue.length) {
      timeout = setTimeout(sendQueue,opts.wait);
    }

  };

  return through(
    function write(chunk) {
      chunk = Buffer.from(chunk);

      // Ensure sendQueue context
      if(!bound) {
        sendQueue = sendQueue.bind(this);
        bound     = true;
      }

      // Add data to queue
      queue = Buffer.concat([queue, chunk]);

      // Handle aggressive nagle
      if ( opts.aggressive ) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(sendQueue,opts.wait);
      }

      // Handle non-aggressive nagle
      if (!timeout) {
        timeout = setTimeout(sendQueue,opts.wait);
      }

      // Handle transmission threshold
      if ( queue.length >= opts.mtu ) {
        if (timeout) clearTimeout(timeout);
        sendQueue();
      }
    },
    function end() {

      // Clear timer
      if (timeout) clearTimeout(timeout);

      // Send remaining chunks
      while(queue.length >= opts.mtu) {
        let data = queue.slice(0,opts.mtu);
        queue    = queue.slice(data.length);
        this.emit('data',data);
      }

      // Send remaining data
      this.emit('data', queue);
      this.emit('end');

    }
  )
};
