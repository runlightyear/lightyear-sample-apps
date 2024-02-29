import crypto from "crypto";
import "log-timestamp";

const SIZE = 500000;

const syncMap: { [sourceId: string]: { [targetId: string]: string } } = {};

console.log("Start creating syncMap");

for (let i = 0; i < SIZE; i++) {
  syncMap[crypto.randomUUID()] = { targetId: crypto.randomUUID() };
}

console.log("Finished creating syncMap");

console.log("Memory usage", process.memoryUsage());

console.log("Starting stringify");

const syncMapStr = JSON.stringify(syncMap);

console.log("Finished stringify");
