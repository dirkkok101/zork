/**
 * Simple test to verify mocking setup works
 */

import { readFile } from 'fs/promises';

// Mock should already be set up by test_setup.ts
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('Mock Setup Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully mock readFile', async () => {
    // Arrange
    const testData = { test: 'data' };
    mockReadFile.mockResolvedValue(JSON.stringify(testData));

    // Act
    const result = await readFile('test-path');

    // Assert
    expect(mockReadFile).toHaveBeenCalledWith('test-path');
    expect(result).toBe(JSON.stringify(testData));
  });

  it('should handle mock errors', async () => {
    // Arrange
    const testError = new Error('Test error');
    mockReadFile.mockRejectedValue(testError);

    // Act & Assert
    await expect(readFile('error-path')).rejects.toThrow('Test error');
    expect(mockReadFile).toHaveBeenCalledWith('error-path');
  });
});