export default class {

  constructor({
    panic = true, panicThreshold = 1000/15, panicCallback = () => false,
    update = t => true, draw = t => true, autopause = true
  } = {}) {
    this.loop = null;
    this.panic = panic;
    this.panicThreshold = panicThreshold;
    this.panicCallback = panicCallback;
    this.update = update;
    this.draw = draw;
    this.elapsedTime = 0;
    this.lastDelta = 0;
    this.timers = new Map();
    if (!autopause) return;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.isRunning()) {
        this.stop();
      } else if (!document.hidden && !this.isRunning()) {
        this.start();
      }
    });
  }

  start() {
    this.loop = requestAnimationFrame(now => {
      this.lastTickTime = now;
      this._tick(now);
    });
  }

  stop() {
    cancelAnimationFrame(this.loop);
    this.loop = null;
  }

  toggle() {
    this.isRunning() ? this.stop() : this.start();
  }

  isRunning() {
    return this.loop != null;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  setUpdate(update = t => true){
    this.update = update;
  }

  setDraw(draw = t => true){
    this.draw = draw;
  }

  clearTimeout(callback) {
    this.timers.delete(callback);
  }

  clearInterval(callback) {
    this.timers.delete(callback);
  }

  setTimeout(timeout, callback) {
    let relTime = this.elapsedTime + timeout;
    this.timers.set(callback, relTime);
    return callback;
  }

  setInterval(timeout, callback) {
    let internallCallback = missedBy => {
      this.setTimeout(timeout - missedBy, internallCallback);
      callback(missedBy);
    };
    this.setTimeout(timeout, internallCallback);
    return internallCallback;
  }

  _tick(now) {
    this.loop = requestAnimationFrame(now => this._tick(now));
    let deltaTime = now - this.lastTickTime;
    this.lastTickTime = now;
    if (this.panic && deltaTime > this.panicThreshold && !this.panicCallback()) return;
    this.elapsedTime += deltaTime;
    // check timers
    for (const [callback, relTime] of this.timers) {
      if (relTime <= this.elapsedTime) {
        this.timers.delete(callback);
        callback(relTime - this.elapsedTime);
      }
    }
    this.update(deltaTime, this.elapsedTime, this.lastDelta);
    this.draw(deltaTime, this.elapsedTime, this.lastDelta);
    this.lastDelta = deltaTime;
  }

}