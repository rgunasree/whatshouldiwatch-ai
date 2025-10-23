// Simple smoke tests for WhatShouldIWatch.ai
// Run with: node tests/smoke.test.js

const path = require('path');
const { generateRecommendationsFor, showsDatabase, MovieAPI } = require(path.resolve(__dirname, '../script.js'));

async function run() {
  const moods = Object.keys(showsDatabase);
  const times = ['quick', 'movie', 'binge', 'episode'];
  let failures = 0;

  // Basic generation tests
  for (const mood of moods) {
    for (const time of times) {
      const recs = generateRecommendationsFor(mood, time);
      if (!Array.isArray(recs)) {
        console.error(`FAIL: ${mood}/${time} did not return an array`);
        failures++;
        continue;
      }
      if (recs.length > 0) {
        const s = recs[0];
        const hasFields = s.title && s.type && s.platform && s.description;
        if (!hasFields) {
          console.error(`FAIL: ${mood}/${time} missing fields in first recommendation`, s);
          failures++;
        }
      }
      console.log(`OK: ${mood}/${time} -> ${recs.length} rec(s)`);
    }
  }

  // Enhancement test on one sample if available
  const sampleMood = moods.find(m => showsDatabase[m]?.movie?.length);
  if (sampleMood) {
    const sampleShow = showsDatabase[sampleMood].movie[0];
    try {
      const enhanced = await MovieAPI.enhanceShowData(sampleShow);
      if (!enhanced || !enhanced.title) {
        console.error('FAIL: Enhancement returned invalid result');
        failures++;
      } else {
        console.log('OK: Enhancement produced result for', enhanced.title);
      }
    } catch (e) {
      console.error('FAIL: Enhancement threw error', e);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\nTests finished with ${failures} failure(s).`);
    process.exit(1);
  } else {
    console.log('\nAll smoke tests passed.');
  }
}

run();
