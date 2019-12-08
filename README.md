[![npm version](https://badge.fury.io/js/media-element-syncer.svg)](https://badge.fury.io/js/media-element-syncer)
# Media Element Syncer

Synchronise two or more HTML5 media elements. Similar to the [unimplemented `MediaController` api](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controller).

## How?

This works by continuously adjusing the `playbackRate` of the media elements, or performing a seek operation if the difference is too big.

## Installation

```
npm install --save media-element-syncer
```

## Usage

All media elements passed to `addChild` will remain synchronised with the source element.

`MediaElementSyncer` is eligible for garbage collection when there are no children.

```js
import { MediaElementSyncer } from 'media-element-syncer';

const source = document.getElementById('source');
const destination1 = document.getElementById('destination1');
const destination2 = document.getElementById('destination2');
const syncer = new MediaElementSyncer(source);
syncer.addChild(destination1);
syncer.addChild(destination2);

// syncer.removeChild(destination1);
```

## Configuration

The optional second param to `MediaElementSyncer` takes an object which has the following optional properties:

- `refreshInterval`: how often to resync the elements. _(default: 200ms)_
- `correctionTime`: how many milliseconds into the future to aim for being in sync. _(default: 500ms)_
- `seekThreshold`: if the time is out by more than this amount, a seek will be performed instead of adjusting the `playbackRate`. _(default: 1000ms)_

## Demo

The code for the demo is [here](/src/demo.html) and there is a hosted version [here](https://clever-pike-bb0ab3.netlify.com/demo.html).
