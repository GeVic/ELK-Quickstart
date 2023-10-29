const sendLogToLogstash = async (log: string) => {
  const conn = await Deno.connect({ hostname: 'localhost', port: 5044 }); // Connects to Logstash on localhost:5044
  await conn.write(new TextEncoder().encode(log + '\n')); // Sends the log message followed by a newline character
  conn.close(); // Closes the connection
};

try {
  await sendLogToLogstash('API call successful II'); // Sends a log message
} catch (error) {
  sendLogToLogstash(`API call failed II: ${error}`); // Sends an error log message if an error occurs
}

export {}; // Makes this file a module to allow top-level await
