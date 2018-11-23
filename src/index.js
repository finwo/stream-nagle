const through = require('through');

module.exports = {

  // Encodes multiple 'data' events into few as possible
  encoder: function (options) {
    let opts = Object.assign({
      wait: 200,  // Wait up to 200ms for more packets
      mtu : 2048, // Max transmission unit (split into multiple packets when overflowing)
    }, options || {});

    let queue = Buffer.alloc(0),
        timer = false;

    function sendQueue() {

    }

    return through(
      function write(chunk) {
        chunk = Buffer.from(chunk);

        // Append chunk to the queue
        queue = Buffer.concat([queue, Buffer.alloc(4)]);
        queue.writeInt32BE(chunk.length, queue.length-4);
        queue = Buffer.concat([queue, chunk]);

        // TODO: trigger send if >mtu
        // TODO: set timer

      },
      function end() {

        // TODO: send rest of the queue

      }
    );


  },

  // Decodes the combined events into multiple
  decoder: function (options) {
    let opts = Object.assign({}, options || {})

    // TODO: decode stream

  },
};
