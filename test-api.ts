/**
 * OpenRouter API Test Script
 * Tests the AI enhancement system with the Grok free model
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { OpenRouterClient } from './src/clients/OpenRouterClient';
import { PromptBuilder } from './src/utils/PromptBuilder';
import { Scene } from './src/types/SceneTypes';
import { Item } from './src/types/ItemTypes';
import { Monster } from './src/types/Monster';

async function testAPI() {
  console.log('🧪 Testing OpenRouter API Connection...\n');

  // Create client
  const client = new OpenRouterClient();

  // Check if configured
  if (!client.isConfigured()) {
    console.error('❌ API key not configured! Check your .env file.');
    process.exit(1);
  }
  console.log('✅ API key loaded successfully\n');

  // Test 1: Simple API call
  console.log('📡 Test 1: Simple API Call');
  console.log('─'.repeat(50));
  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant. Respond with valid JSON only.'
      },
      {
        role: 'user' as const,
        content: 'Say hello in JSON format with a "message" field'
      }
    ];

    const response = await client.callAPI(messages);
    console.log('Response:', response);
    const parsed = JSON.parse(response);
    console.log('✅ Simple API call successful!\n');
  } catch (error) {
    console.error('❌ Simple API call failed:', error);
    process.exit(1);
  }

  // Test 2: Scene Expansion
  console.log('🏰 Test 2: Scene Expansion (Fantasy Style)');
  console.log('─'.repeat(50));
  try {
    // Create a mock scene similar to "West of House"
    const mockScene: Scene = {
      id: 'west_of_house',
      title: 'West of House',
      description: 'You are standing in an open field west of a white house, with a boarded front door.',
      exits: [
        { direction: 'north', to: 'north_of_house' },
        { direction: 'south', to: 'south_of_house' },
        { direction: 'west', to: 'forest' }
      ],
      items: [],
      lighting: 'daylight' as any,
      tags: [],
      state: {}
    };

    const messages = PromptBuilder.buildScenePrompt(
      mockScene,
      'Aragorn',
      'fantasy',
      [],
      []
    );

    console.log('Sending prompt to Grok...');
    const response = await client.callAPI(messages);
    console.log('\nGrok Response:');
    console.log(response);

    // Try to parse as JSON
    const parsed = JSON.parse(response);
    console.log('\n✅ Scene expansion successful!');
    console.log('Generated title:', parsed.displayName);
    console.log('Description preview:', parsed.description?.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Scene expansion failed:', error);
    process.exit(1);
  }

  // Test 3: Item Expansion
  console.log('\n🗝️ Test 3: Item Expansion (Fantasy Style)');
  console.log('─'.repeat(50));
  try {
    const mockItem: Item = {
      id: 'brass_lantern',
      name: 'brass lantern',
      aliases: ['lantern', 'lamp'],
      description: 'A brass lantern',
      examineText: 'The brass lantern is currently turned off.',
      type: 'LIGHT_SOURCE' as any,
      portable: true,
      visible: true,
      weight: 5,
      size: 'SMALL' as any,
      tags: [],
      properties: {} as any,
      interactions: [],
      currentLocation: 'inventory',
      state: {},
      flags: {}
    };

    const messages = PromptBuilder.buildItemPrompt(
      mockItem,
      'You stand in a mystical chamber',
      'Aragorn',
      'fantasy'
    );

    console.log('Sending prompt to Grok...');
    const response = await client.callAPI(messages);
    console.log('\nGrok Response:');
    console.log(response);

    const parsed = JSON.parse(response);
    console.log('\n✅ Item expansion successful!');
    console.log('Generated name:', parsed.displayName);
  } catch (error) {
    console.error('❌ Item expansion failed:', error);
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('🎉 All API tests passed successfully!');
  console.log('═'.repeat(50));
  console.log('\nYour OpenRouter integration is working correctly.');
  console.log('You can now use AI-enhanced mode in the game!\n');
}

// Run tests
testAPI().catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});
