require("console-stamp")(console, {
  pattern: "yyyy-mm-dd HH:MM:ss.l",
  label: false
});

const Accessory = require("../").Accessory;
const Service = require("../").Service;
const Characteristic = require("../").Characteristic;
const uuid = require("../").uuid;
const Gate = require("../controllers/Gate");

// Create a new instance of a Particle controlled gate.
const gate = new Gate();

// Generate a consistent UUID that will remain the same even when restarting the
// server.
const gateUUID = uuid.generate("hap-nodejs:accessories:gate");

// This is the Accessory that will be returned to HAP-NodeJS.
const gateAccessory = (exports.accessory = new Accessory("Gate", gateUUID));

// Add properties for publishing
gateAccessory.username = "B2:AC:6E:98:DE:0A";
gateAccessory.pincode = "031-45-154";

// Set some basic properties
gateAccessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Imecotron")
  .setCharacteristic(Characteristic.Model, "Electric Gate")
  .setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

// Listen for "identify" events for this Accessory
gateAccessory.on("identify", (paired, callback) => {
  callback();
});

// Add the Garage Door Opener service and listen for "set" events from iOS
gateAccessory
  .addService(Service.GarageDoorOpener, "Gate")
  .setCharacteristic(
    Characteristic.CurrentDoorState,
    Characteristic.CurrentDoorState.CLOSED
  )
  .getCharacteristic(Characteristic.TargetDoorState)
  .on("set", async (value, callback) => {
    if (value === Characteristic.TargetDoorState.OPEN) {
      try {
        await gate.open();
        gateAccessory
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(
            Characteristic.CurrentDoorState,
            Characteristic.CurrentDoorState.OPEN
          );
        callback();
        console.info("Gate opened");
      } catch (err) {
        console.error(`Error when opening gate: ${err.message}`);
        callback(err);
      }
    } else if (value === Characteristic.TargetDoorState.CLOSED) {
      try {
        await gate.close();
        gateAccessory
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(
            Characteristic.CurrentDoorState,
            Characteristic.CurrentDoorState.CLOSED
          );
        callback();
        console.info("Gate closed");
      } catch (err) {
        console.error(`Error when closing gate: ${err.message}`);
        callback(err);
      }
    }
  });

function getCurrentDoorState(state) {
  switch (state) {
    case Gate.STATES.open:
      return Characteristic.CurrentDoorState.OPEN;
    case Gate.STATES.closed:
      return Characteristic.CurrentDoorState.CLOSED;
    case Gate.STATES.opening:
      return Characteristic.CurrentDoorState.OPENING;
    case Gate.STATES.closing:
      return Characteristic.CurrentDoorState.CLOSING;
    case Gate.STATES.stoppedOpening:
    case Gate.STATES.stoppedClosing:
      return Characteristic.CurrentDoorState.STOPPED;
    default:
      throw new Error(`Unknown state: ${state}`);
  }
}

// Intercept requests for the current state.
gateAccessory
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on("get", async callback => {
    try {
      const state = await gate.getState();
      const currentDoorState = getCurrentDoorState(state);
      callback(null, currentDoorState);
    } catch (err) {
      console.error(`Error when getting door state: ${err.message}`);
      callback(err);
    }
  });
