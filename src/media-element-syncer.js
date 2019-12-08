const EVENTS = ['play', 'pause', 'seeking', 'seeked', 'playing', 'stalled'];

export class MediaElementSyncer {
  constructor(
    source,
    { refreshInterval = 200, correctionTime = 500, seekThreshold = 1000 } = {}
  ) {
    this._source = source;
    this._children = [];
    this._updateTimer = null;
    this._refreshInterval = refreshInterval;
    this._correctionTime = correctionTime / 1000;
    this._seekThreshold = seekThreshold / 1000;
    this._config = new Map();
    let collecting = false;
    this._eventHandler = () => {
      if (collecting) {
        return;
      }
      collecting = true;
      window.setTimeout(() => {
        collecting = false;
        this._update();
      }, 0);
    };
  }

  addChild(element, { offset = 0 } = {}) {
    if (this._children.indexOf(element) === -1) {
      if (!this._children.length) {
        this._addEventListeners(this._source);
      }
      this._config.set(element, { offset });
      this._children.push(element);
      this._addEventListeners(element);
      this._update();
    }
  }

  removeChild(element) {
    const index = this._children.indexOf(element);
    if (index >= 0) {
      this._config.delete(element);
      this._removeEventListeners(element);
      this._children.splice(index, 1);
      if (!this._children.length) {
        if (this._updateTimer) {
          window.clearTimeout(this._updateTimer);
          this._updateTimer = null;
        }
        this._removeEventListeners(this._source);
      }
    }
  }

  _update() {
    if (this._updateTimer) {
      window.clearTimeout(this._updateTimer);
    }

    if (!this._children.length) {
      return;
    }

    const sourceTime = this._source.currentTime;
    const sourcePlaybackRate = this._source.playbackRate;
    this._children.forEach(child => {
      try {
        const config = this._config.get(child);
        const targetTime = sourceTime + config.offset / 1000;
        const sourcePaused =
          this._source.paused ||
          this._source.ended ||
          targetTime < 0 ||
          targetTime >= child.duration;
        const currentTime = child.currentTime;
        const diff = targetTime - currentTime;
        const rate = Math.max(
          0,
          ((diff + this._correctionTime) / this._correctionTime) *
            sourcePlaybackRate
        );
        if (sourcePaused !== child.paused) {
          sourcePaused ? child.pause() : child.play();
        }
        if (sourcePaused || rate < 0 || Math.abs(diff) >= this._seekThreshold) {
          child.currentTime = targetTime;
          child.playbackRate = sourcePlaybackRate;
        } else {
          child.playbackRate = rate;
        }
      } catch (e) {
        window.setTimeout(() => {
          throw e;
        }, 0);
      }
    });

    this._updateTimer = window.setTimeout(
      () => this._update(),
      this._refreshInterval
    );
  }

  _addEventListeners(element) {
    EVENTS.forEach(eventName =>
      element.addEventListener(eventName, this._eventHandler)
    );
  }

  _removeEventListeners(element) {
    EVENTS.forEach(eventName =>
      element.removeEventListener(eventName, this._eventHandler)
    );
  }
}
