// Copyright 2023 Geoid
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.






// https://en.wikipedia.org/wiki/ISO_8601#Repeating_intervals
// https://github.com/smhg/date-interval-js/blob/master/src/interval.js


import createDuration from 'date-duration';

const toDate = value => {
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value === 'string' && value[0] !== 'P') {
    return new Date(value);
  }

  return value;
};
const durationToDate = (value, idx, all) => {
  if (typeof value === 'string' && value[0] === 'P') {
    if (idx === 0) {
      return createDuration(value).subtractFrom(all[1]);
    } else if (idx === 1) {
      return createDuration(value).addTo(all[0]);
    }
  }

  return value;
};

export default function createInterval () {
  if (arguments.length === 0 || !arguments[0]) {
    throw new Error('Time interval requires at least one valid argument');
  }

  const [start, end] = (arguments.length === 1 ? arguments[0].split('/') : [arguments[0], arguments[1]])
    .map(toDate)
    .map(durationToDate)
    .map(value => +value);

  const toString = () => `${(new Date(start)).toISOString()}/${(new Date(end)).toISOString()}`;

  const overlaps = interval => start < interval.end && interval.start < end;

  const union = function (interval) {
    if (overlaps(interval) || end === interval.start || interval.end === start) {
      return [createInterval(start <= interval.start ? start : interval.start, end >= interval.end ? end : interval.end)];
    }

    return [createInterval(start, end), createInterval(interval.start, interval.end)];
  };

  const diff = function (interval) {
    if (!overlaps(interval)) {
      return [createInterval(start, end)];
    }

    if (interval.start <= start) {
      // start before/together
      if (end > interval.end) {
        // end inside
        return [createInterval(interval.end, end)];
      }

      // end after/together
      return [];
    }

    // start inside
    if (interval.end < end) {
      // end inside
      return [createInterval(start, interval.start), createInterval(interval.end, end)];
    }

    // end after/together
    return [createInterval(start, interval.start)];
  };

  const intersection = function (interval) {
    if (!overlaps(interval)) {
      return;
    }

    if (interval.start <= start) {
      // start before/together
      if (end > interval.end) {
        // end inside
        return createInterval(start, interval.end);
      }

      // end after/together
      return createInterval(start, end);
    }

    // start inside
    if (interval.end < end) {
      // end inside
      return createInterval(interval.start, interval.end);
    }

    // end after/together
    return createInterval(interval.start, end);
  };

  return Object.freeze({
    start,
    end,
    toString,
    overlaps,
    union,
    diff,
    intersection
  });
}