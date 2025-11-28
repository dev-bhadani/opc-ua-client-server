import {
    OPCUAServer,
    Variant,
    DataType,
    StatusCodes
} from "node-opcua";

async function startServer() {
    const server = new OPCUAServer({
        port: 4840,
        resourcePath: "/UA/MyLittleServer",
        buildInfo: {
            productName: "MySampleOPCUAServer",
            buildNumber: "1",
            buildDate: new Date()
        }
    });

    await server.initialize();
    console.log("OPC UA Server initialized");

    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MyDevice"
    });

    let temperature = 25.0;
    namespace.addVariable({
        componentOf: device,
        browseName: "Temperature",
        nodeId: "ns=1;s=MyDevice.Temperature",
        dataType: "Double",
        minimumSamplingInterval: 100,
        value: {
            get: () => new Variant({ dataType: DataType.Double, value: temperature }),
            set: (variant) => {
                temperature = variant.value;
                console.log("Temperature set to:", temperature);
                return StatusCodes.Good;
            }
        }
    });

    let pressure = 1.0;
    namespace.addVariable({
        componentOf: device,
        browseName: "Pressure",
        nodeId: "ns=1;s=MyDevice.Pressure",
        dataType: "Double",
        minimumSamplingInterval: 100,
        value: {
            get: () => new Variant({ dataType: DataType.Double, value: pressure })
        }
    });

    await server.start();
    console.log("Server listening on:", server.getEndpointUrl());

    setInterval(() => {
        pressure += (Math.random() - 0.5) * 0.05;
    }, 1000);
}

startServer().catch((err) => {
    console.error("Error:", err);
});
