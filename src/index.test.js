import expect from 'expect';
import nagle  from './index';

test('Small package delayed (default)', async () => {
  let n   = nagle(),
      buf = Buffer.alloc(0);

  n.on('data', function(chunk) {
    buf = Buffer.concat([buf,chunk]);
  });

  // Start
  expect(buf.length).toBe(0);
  n.write('Hello World\n');

  // Expect a delay
  expect(buf.length).toBe(0);

  // Default = 200ms, it should be empty then
  await new Promise(r=>setTimeout(r,300));

  // Data should be there now
  expect(buf.length).toBe(12);
});


test('Small package delayed (aggressive)', async () => {
  let n   = nagle({ aggressive: true }),
      buf = Buffer.alloc(0);

  n.on('data', function(chunk) {
    buf = Buffer.concat([buf,chunk]);
  });

  // Start
  expect(buf.length).toBe(0);
  n.write('Hello World\n');
  expect(buf.length).toBe(0);

  // Add some time
  await new Promise(r=>setTimeout(r,100));

  // Write more data
  n.write('Hello World\n');
  expect(buf.length).toBe(0);

  // Wait some more
  await new Promise(r=>setTimeout(r,100));

  // Write more data
  n.write('Hello World\n');
  expect(buf.length).toBe(0);

  // Wait some more
  await new Promise(r=>setTimeout(r,100));

  // Should still be 0
  expect(buf.length).toBe(0);

  // Wait some more
  await new Promise(r=>setTimeout(r,200));

  // Data should've arrived now
  expect(buf.length).toBe(36);
});


test('MTU overflow', async () => {
  let n   = nagle({ aggressive: true, mtu: 16, burst: false }),
      buf = Buffer.alloc(0);

  n.on('data', function(chunk) {
    buf = Buffer.concat([buf,chunk]);
  });

  // Start
  expect(buf.length).toBe(0);
  n.write('Hello World\n');
  expect(buf.length).toBe(0);

  // Add some time
  await new Promise(r=>setTimeout(r,100));

  // Write more data (overflows mtu)
  n.write('Hello World\n');
  expect(buf.length).toBe(16);

  // Wait for the rest of the data
  await new Promise(r=>setTimeout(r,300));

  // Should have received everything now
  expect(buf.length).toBe(24);
});


test('Burst behavior', async () => {
  let n   = nagle({ aggressive: true, mtu: 16, burst: true }),
      buf = Buffer.alloc(0);

  n.on('data', function(chunk) {
    buf = Buffer.concat([buf,chunk]);
  });

  // Start
  expect(buf.length).toBe(0);
  n.write('Hello World\n');
  expect(buf.length).toBe(0);

  // Add some time
  await new Promise(r=>setTimeout(r,100));

  // Write more data (overflows mtu)
  n.write('Hello World\n');
  expect(buf.length).toBe(24);

  // Wait for the rest of the data
  await new Promise(r=>setTimeout(r,300));

  // Should have received everything now
  expect(buf.length).toBe(24);
});
