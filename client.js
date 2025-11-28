import { OPCUAClient, AttributeIds } from "node-opcua";

const endpointUrl = "opc.tcp://shailesh.local:4840/UA/MyLittleServer";

async function main() {
    const client = OPCUAClient.create({
        applicationName: "MyOPCUAClient",
        endpointMustExist: false
    });

    try {
        await client.connect(endpointUrl);
        console.log("Connected to", endpointUrl);

        const session = await client.createSession();
        console.log("Session created");

        const nodeId = "ns=1;s=MyDevice.Temperature";

        const dataValue = await session.read({
            nodeId,
            attributeId: AttributeIds.Value
        });
        console.log("Temperature =", dataValue.value.value);

        const newTemp = 40.5;
        await session.writeSingleNode(nodeId, {
            dataType: "Double",
            value: newTemp
        });
        console.log("New Temperature written:", newTemp);

        await session.close();
        await client.disconnect();
        console.log("Disconnected");
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
