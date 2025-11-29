OPC UA Client–Server

This project demonstrates a simple implementation of an OPC UA Server and Client using Node.js and the node-opcua library.
It provides a minimal, working example of how to expose and read industrial data points over the OPC UA protocol.

------------------------------------------------------------
Features
------------------------------------------------------------

- OPC UA Server exposing simulated variables:
  - Temperature
  - Pressure
- OPC UA Client connecting to the server to:
  - Read variable values
  - Write updated values to writable nodes
- Fully asynchronous and written in modern JavaScript (ES modules)
- Includes integration tests using Node’s built-in node:test

------------------------------------------------------------
Prerequisites
------------------------------------------------------------

- Node.js 20 or later
- npm (comes with Node)

------------------------------------------------------------
Installation
------------------------------------------------------------

    npm install

------------------------------------------------------------
Running the Server
------------------------------------------------------------

    npm run server

Example output:

    OPC UA Server initialized
    Server listening on: opc.tcp://localhost:4840/UA/MyLittleServer

------------------------------------------------------------
Running the Client
------------------------------------------------------------

In a separate terminal:

    npm run client

The client connects to the server and logs values for Temperature and Pressure.

------------------------------------------------------------
Running Tests
------------------------------------------------------------

    npm test

The integration tests start the server, connect the client, and verify read/write operations.

------------------------------------------------------------
License
------------------------------------------------------------

MIT License © 2025 Shaileshkumar Bhadani
