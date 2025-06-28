// Debug script to check console.error calls
const { SceneDataLoader } = require('./src/data_loaders/SceneDataLoader.ts');

// Mock the same test scenario
const scenes = [
  { id: 'scene1', valid: true },
  { id: 'scene2', error: new Error('File not found') },
  { id: 'scene3', valid: true },
  { id: 'scene4', invalid: true },
  { id: 'scene5', valid: true }
];

const originalError = console.error;
const errorCalls = [];

console.error = (...args) => {
  errorCalls.push(args);
  originalError(...args);
};

console.log('Error calls captured:', errorCalls.length);
errorCalls.forEach((call, index) => {
  console.log(`Error ${index + 1}:`, call[0]);
});

console.error = originalError;