const Particle = require("particle-api-js");

const PARTICLE_ACCESS_TOKEN = "6baeae8b2473b84ead5e102a8d2a59212def08b6";
const DEVICE_ID = "230032000a47343337373738";

const particle = new Particle();

class Gate {
  async getState() {
    const data = await particle.getVariable({
      deviceId: DEVICE_ID,
      name: "state",
      auth: PARTICLE_ACCESS_TOKEN
    });
    return data.body.result;
  }

  open() {
    return particle.callFunction({
      deviceId: DEVICE_ID,
      name: "open",
      auth: PARTICLE_ACCESS_TOKEN
    });
  }

  close() {
    return particle.callFunction({
      deviceId: DEVICE_ID,
      name: "close",
      auth: PARTICLE_ACCESS_TOKEN
    });
  }
}

Gate.STATES = {
  closed: 0,
  opening: 1,
  openLocked: 2,
  open: 3,
  closing: 4,
  closedLocked: 5,
  stoppedOpening: 6,
  stoppedClosing: 7
};

exports = module.exports = Gate;
