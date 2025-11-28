import test from "node:test";
import assert from "node:assert/strict";
import {
  OPCUAClient,
  AttributeIds,
  StatusCodes
} from "node-opcua";
import { startServer } from "../server.js";

let server;
let endpointUrl;
let pressureTimer;
let client;
let session;

const TEMP_NODE_ID = "ns=1;s=MyDevice.Temperature";
const PRESSURE_NODE_ID = "ns=1;s=MyDevice.Pressure";

test.before(async () => {
  const started = await startServer();
  server = started.server;
  endpointUrl = started.endpointUrl;
  pressureTimer = started.pressureTimer;

  client = OPCUAClient.create({
    applicationName: "IntegrationTestClient",
    endpointMustExist: false
  });

  await client.connect(endpointUrl);
  session = await client.createSession();
});

test.after(async () => {
  if (session) {
    await session.close();
  }
  if (client) {
    await client.disconnect();
  }
  if (pressureTimer) {
    clearInterval(pressureTimer);
  }
  if (server) {
    await server.shutdown();
  }
});

test("Temperature: can read initial value", async () => {
  const dataValue = await session.read({
    nodeId: TEMP_NODE_ID,
    attributeId: AttributeIds.Value
  });

  assert.equal(
    dataValue.statusCode.value,
    StatusCodes.Good.value,
    "Read of Temperature node should succeed"
  );

  const value = dataValue.value.value;
  console.log("Initial Temperature:", value);
  assert.equal(typeof value, "number", "Temperature must be a number");
});

test("Temperature: write and read back new value", async () => {
  const initialValue = await session.read({
    nodeId: TEMP_NODE_ID,
    attributeId: AttributeIds.Value
  });
  const originalTemp = initialValue.value.value;

  const newTemp = originalTemp + 7.5;
  const writeStatus = await session.writeSingleNode(TEMP_NODE_ID, {
    dataType: "Double",
    value: newTemp
  });

  assert.equal(
    writeStatus.value,
    StatusCodes.Good.value,
    "Write to Temperature node should be Good"
  );

  const updatedValue = await session.read({
    nodeId: TEMP_NODE_ID,
    attributeId: AttributeIds.Value
  });

  assert.equal(
    updatedValue.value.value,
    newTemp,
    "Temperature should match the value written by the client"
  );
});

test("Pressure: can read value and it's read-only", async () => {
  const dataValue = await session.read({
    nodeId: PRESSURE_NODE_ID,
    attributeId: AttributeIds.Value
  });

  assert.equal(
    dataValue.statusCode.value,
    StatusCodes.Good.value,
    "Read of Pressure node should succeed"
  );

  const value = dataValue.value.value;
  console.log("Pressure value:", value);
  assert.equal(typeof value, "number", "Pressure must be a number");

  const writeStatus = await session.writeSingleNode(PRESSURE_NODE_ID, {
    dataType: "Double",
    value: value + 1
  });

  assert.equal(
    writeStatus.value,
    StatusCodes.BadNotWritable.value,
    "Pressure node should not be writable"
  );
});

test("Reading an invalid nodeId returns BadNodeIdUnknown", async () => {
  const invalidNodeId = "ns=1;s=This.Node.Does.Not.Exist";

  const dataValue = await session.read({
    nodeId: invalidNodeId,
    attributeId: AttributeIds.Value
  });

  assert.equal(
    dataValue.statusCode.value,
    StatusCodes.BadNodeIdUnknown.value,
    "Invalid nodeId should return BadNodeIdUnknown"
  );
});

test("Multiple clients can read Temperature concurrently", async () => {
  const secondClient = OPCUAClient.create({
    applicationName: "SecondIntegrationClient",
    endpointMustExist: false
  });

  await secondClient.connect(endpointUrl);
  const secondSession = await secondClient.createSession();

  try {
    const [value1, value2] = await Promise.all([
      session.read({
        nodeId: TEMP_NODE_ID,
        attributeId: AttributeIds.Value
      }),
      secondSession.read({
        nodeId: TEMP_NODE_ID,
        attributeId: AttributeIds.Value
      })
    ]);

    assert.equal(
      value1.statusCode.value,
      StatusCodes.Good.value,
      "First client read should be Good"
    );
    assert.equal(
      value2.statusCode.value,
      StatusCodes.Good.value,
      "Second client read should be Good"
    );

    const v1 = value1.value.value;
    const v2 = value2.value.value;

    assert.equal(typeof v1, "number", "First client Temperature must be a number");
    assert.equal(typeof v2, "number", "Second client Temperature must be a number");
  } finally {
    await secondSession.close();
    await secondClient.disconnect();
  }
});