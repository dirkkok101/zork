/**
 * Integration tests for ItemDataLoader type distribution functionality
 * Tests real file I/O operations and validates actual type distribution against documentation
 */

import { ItemDataLoader } from '../../../../../src/data_loaders/ItemDataLoader';
import { ItemType, Size } from '../../../../../src/types/ItemTypes';

// Import setup to ensure fs/promises is not mocked
import '../setup';

describe('ItemDataLoader - Type Distribution Integration', () => {
  let loader: ItemDataLoader;
  
  beforeEach(() => {
    // Use actual data path for integration testing
    loader = new ItemDataLoader('data/items/');
  });

  describe('Item type distribution validation', () => {
    it('should validate TOOL type dominance as documented', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      const toolItems = allItems.filter(item => item.type === ItemType.TOOL);
      
      // Assert - TOOL should be dominant (documented as 164 items, 76.6%)
      expect(toolItems.length).toBeGreaterThan(100);
      
      const toolPercentage = (toolItems.length / allItems.length) * 100;
      expect(toolPercentage).toBeGreaterThan(60); // At least 60%
      
      console.log(`TOOL items: ${toolItems.length}/${allItems.length} (${toolPercentage.toFixed(1)}%)`);
      
      // Validate tool items have proper structure
      toolItems.slice(0, 10).forEach(tool => { // Check first 10 for performance
        expect(tool.type).toBe(ItemType.TOOL);
        expect(typeof tool.id).toBe('string');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.portable).toBe('boolean');
        expect(typeof tool.weight).toBe('number');
      });
    });

    it('should validate CONTAINER type distribution', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      const containerItems = allItems.filter(item => item.type === ItemType.CONTAINER);
      
      // Assert - CONTAINER should be significant (documented as 36 items)
      expect(containerItems.length).toBeGreaterThan(20);
      expect(containerItems.length).toBeLessThan(60);
      
      const containerPercentage = (containerItems.length / allItems.length) * 100;
      console.log(`CONTAINER items: ${containerItems.length}/${allItems.length} (${containerPercentage.toFixed(1)}%)`);
      
      // Containers often have capacity properties
      const containersWithCapacity = containerItems.filter(container => 
        container.properties.capacity !== undefined
      );
      
      if (containersWithCapacity.length > 0) {
        console.log(`  Containers with capacity: ${containersWithCapacity.length}/${containerItems.length}`);

        // Validate capacity values are reasonable
        containersWithCapacity.forEach(container => {
          expect(typeof container.properties.capacity).toBe('number');
          expect(container.properties.capacity).toBeGreaterThanOrEqual(0); // Allow 0 for lids and doors
          expect(container.properties.capacity).toBeLessThanOrEqual(1000); // Allow exactly 1000
        });
      }
    });

    it('should validate FOOD type distribution', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      const foodItems = allItems.filter(item => item.type === ItemType.FOOD);
      
      // Assert - FOOD should be small (documented as 7 items)
      expect(foodItems.length).toBeGreaterThan(0);
      expect(foodItems.length).toBeLessThan(20);
      
      const foodPercentage = (foodItems.length / allItems.length) * 100;
      console.log(`FOOD items: ${foodItems.length}/${allItems.length} (${foodPercentage.toFixed(1)}%)`);
      
      // Food items should typically be portable and consumable
      const portableFoodCount = foodItems.filter(food => food.portable).length;
      const foodPortabilityRate = portableFoodCount / foodItems.length;
      
      if (foodItems.length > 0) {
        expect(foodPortabilityRate).toBeGreaterThan(0.5); // Most food should be portable
        console.log(`  Portable food: ${portableFoodCount}/${foodItems.length} (${(foodPortabilityRate * 100).toFixed(1)}%)`);
      }
    });

    it('should validate WEAPON type distribution', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      const weaponItems = allItems.filter(item => item.type === ItemType.WEAPON);
      
      // Assert - WEAPON should be small (documented as 5 items)
      expect(weaponItems.length).toBeGreaterThan(0);
      expect(weaponItems.length).toBeLessThan(15);
      
      const weaponPercentage = (weaponItems.length / allItems.length) * 100;
      console.log(`WEAPON items: ${weaponItems.length}/${allItems.length} (${weaponPercentage.toFixed(1)}%)`);
      
      // Weapons should have reasonable properties
      weaponItems.forEach(weapon => {
        expect(weapon.type).toBe(ItemType.WEAPON);
        expect(weapon.weight).toBeGreaterThan(0); // Weapons should have weight
        // Note: Some weapons might not be portable (e.g., fixed weapons)
        expect(typeof weapon.portable).toBe('boolean');
        
        // Many weapons might have damage or value properties
        if (weapon.properties.damage) {
          expect(typeof weapon.properties.damage).toBe('number');
          expect(weapon.properties.damage).toBeGreaterThan(0);
        }
      });
    });

    it('should validate LIGHT_SOURCE type distribution', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      const lightItems = allItems.filter(item => item.type === ItemType.LIGHT_SOURCE);
      
      // Assert - LIGHT_SOURCE should be very small (documented as 2 items)
      expect(lightItems.length).toBeGreaterThan(0);
      expect(lightItems.length).toBeLessThan(10);
      
      const lightPercentage = (lightItems.length / allItems.length) * 100;
      console.log(`LIGHT_SOURCE items: ${lightItems.length}/${allItems.length} (${lightPercentage.toFixed(1)}%)`);
      
      // Light sources should have specific properties
      lightItems.forEach(lightSource => {
        expect(lightSource.type).toBe(ItemType.LIGHT_SOURCE);
        expect(lightSource.portable).toBe(true); // Light sources should be portable
        
        // Light sources might have timer properties
        if (lightSource.properties.lightTimer) {
          expect(typeof lightSource.properties.lightTimer).toBe('number');
          expect(lightSource.properties.lightTimer).toBeGreaterThan(0);
        }
      });
    });

    it('should validate TREASURE type distribution', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      const treasureItems = allItems.filter(item => item.type === ItemType.TREASURE);
      
      // Assert - TREASURE enum exists but documented as 0 items
      expect(treasureItems.length).toBeGreaterThanOrEqual(0);
      
      const treasurePercentage = treasureItems.length > 0 ? 
        (treasureItems.length / allItems.length) * 100 : 0;
      console.log(`TREASURE items: ${treasureItems.length}/${allItems.length} (${treasurePercentage.toFixed(1)}%)`);
      
      // If treasures exist, they should have value properties
      treasureItems.forEach(treasure => {
        expect(treasure.type).toBe(ItemType.TREASURE);
        
        if (treasure.properties.treasurePoints || treasure.properties.value) {
          if (treasure.properties.treasurePoints) {
            expect(typeof treasure.properties.treasurePoints).toBe('number');
            expect(treasure.properties.treasurePoints).toBeGreaterThan(0);
          }
          if (treasure.properties.value) {
            expect(typeof treasure.properties.value).toBe('number');
            expect(treasure.properties.value).toBeGreaterThan(0);
          }
        }
      });
    });
  });

  describe('Size distribution validation', () => {
    it('should validate TINY size dominance as documented', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      const tinyItems = allItems.filter(item => item.size === Size.TINY);
      
      // Assert - TINY should dominate (documented as 154/214 = 72%)
      const tinyPercentage = (tinyItems.length / allItems.length) * 100;
      expect(tinyPercentage).toBeGreaterThan(60); // At least 60%
      
      console.log(`TINY items: ${tinyItems.length}/${allItems.length} (${tinyPercentage.toFixed(1)}%)`);
      
      // Tiny items should generally be lighter
      const tinyWeights = tinyItems.map(item => item.weight);
      const averageTinyWeight = tinyWeights.reduce((sum, w) => sum + w, 0) / tinyWeights.length;
      
      expect(averageTinyWeight).toBeLessThan(50); // Tiny items should be relatively light
      console.log(`  Average TINY weight: ${averageTinyWeight.toFixed(2)}`);
    });

    it('should validate progressive size distribution', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      
      const sizeDistribution = {
        [Size.TINY]: allItems.filter(item => item.size === Size.TINY).length,
        [Size.SMALL]: allItems.filter(item => item.size === Size.SMALL).length,
        [Size.MEDIUM]: allItems.filter(item => item.size === Size.MEDIUM).length,
        [Size.LARGE]: allItems.filter(item => item.size === Size.LARGE).length,
        [Size.HUGE]: allItems.filter(item => item.size === Size.HUGE).length
      };
      
      console.log('Size distribution:');
      Object.entries(sizeDistribution).forEach(([size, count]) => {
        const percentage = (count / allItems.length) * 100;
        console.log(`  ${size}: ${count} (${percentage.toFixed(1)}%)`);
      });
      
      // Assert progressive distribution (each size should be less common than the previous)
      expect(sizeDistribution[Size.TINY]).toBeGreaterThan(sizeDistribution[Size.SMALL]);
      expect(sizeDistribution[Size.SMALL]).toBeGreaterThan(sizeDistribution[Size.MEDIUM]);
      expect(sizeDistribution[Size.MEDIUM]).toBeGreaterThan(sizeDistribution[Size.LARGE]);
      expect(sizeDistribution[Size.LARGE]).toBeGreaterThan(sizeDistribution[Size.HUGE]);
      
      // Validate documented counts are reasonable
      expect(sizeDistribution[Size.TINY]).toBeGreaterThan(100); // Should be majority
      expect(sizeDistribution[Size.SMALL]).toBeGreaterThan(10);  // Should have some
      expect(sizeDistribution[Size.HUGE]).toBeGreaterThan(0);    // Should exist
    });

    it('should validate size-weight correlation', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      
      // Calculate average weight by size
      const weightBySize: Record<Size, number[]> = {
        [Size.TINY]: [],
        [Size.SMALL]: [],
        [Size.MEDIUM]: [],
        [Size.LARGE]: [],
        [Size.HUGE]: []
      };
      
      allItems.forEach(item => {
        weightBySize[item.size].push(item.weight);
      });
      
      const averageWeightBySize: Record<Size, number> = {} as Record<Size, number>;
      Object.entries(weightBySize).forEach(([size, weights]) => {
        if (weights.length > 0) {
          averageWeightBySize[size as Size] = weights.reduce((sum, w) => sum + w, 0) / weights.length;
        }
      });
      
      console.log('Average weight by size:');
      Object.entries(averageWeightBySize).forEach(([size, avgWeight]) => {
        console.log(`  ${size}: ${avgWeight.toFixed(2)}`);
      });
      
      // Assert general size-weight correlation
      // (allowing for some variance, as magical items might not follow physics)
      if (averageWeightBySize[Size.TINY] && averageWeightBySize[Size.SMALL]) {
        // TINY should generally be lighter than SMALL
        expect(averageWeightBySize[Size.TINY]).toBeLessThan(averageWeightBySize[Size.SMALL] + 20);
      }
      
      if (averageWeightBySize[Size.LARGE] && averageWeightBySize[Size.MEDIUM]) {
        // LARGE should generally be heavier than MEDIUM
        expect(averageWeightBySize[Size.LARGE]).toBeGreaterThan(averageWeightBySize[Size.MEDIUM] - 10);
      }
    });
  });

  describe('Cross-type analysis', () => {
    it('should validate type-size combinations make sense', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      
      // Analyze type-size combinations
      const typeSizeCombinations: Record<string, number> = {};
      
      allItems.forEach(item => {
        const combination = `${item.type}-${item.size}`;
        typeSizeCombinations[combination] = (typeSizeCombinations[combination] || 0) + 1;
      });
      
      console.log('Type-Size combinations (showing top 10):');
      const sortedCombinations = Object.entries(typeSizeCombinations)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      sortedCombinations.forEach(([combination, count]) => {
        console.log(`  ${combination}: ${count}`);
      });
      
      // Validate some logical combinations exist
      expect(typeSizeCombinations['TOOL-TINY']).toBeGreaterThan(10); // Should have many tiny tools
      expect(typeSizeCombinations['CONTAINER-SMALL'] || 0).toBeGreaterThan(0); // Should have some containers
      
      // Validate no impossible combinations (this is more about data consistency)
      Object.entries(typeSizeCombinations).forEach(([, count]) => {
        expect(count).toBeGreaterThan(0); // If it exists, it should have at least 1
        expect(count).toBeLessThan(allItems.length); // Sanity check
      });
    });

    it('should validate type-property relationships', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      
      // Analyze property patterns by type
      const typePropertyAnalysis: Partial<Record<ItemType, any>> = {};
      
      // Initialize analysis for all types
      Object.values(ItemType).forEach(type => {
        typePropertyAnalysis[type] = { withValue: 0, withCapacity: 0, total: 0 };
      });
      
      allItems.forEach(item => {
        const analysis = typePropertyAnalysis[item.type];
        if (analysis) {
          analysis.total++;
          
          if (item.properties.value !== undefined) {
            analysis.withValue++;
          }
          if (item.properties.capacity !== undefined) {
            analysis.withCapacity++;
          }
        }
      });
      
      console.log('Type-Property analysis:');
      Object.entries(typePropertyAnalysis).forEach(([type, analysis]) => {
        if (analysis.total > 0) {
          const valueRate = (analysis.withValue / analysis.total * 100).toFixed(1);
          const capacityRate = (analysis.withCapacity / analysis.total * 100).toFixed(1);
          console.log(`  ${type}: ${analysis.total} items, ${valueRate}% with value, ${capacityRate}% with capacity`);
        }
      });
      
      // Validate logical property patterns
      const containerAnalysis = typePropertyAnalysis[ItemType.CONTAINER];
      if (containerAnalysis.total > 0) {
        // Containers should have higher capacity property rate than other types
        const containerCapacityRate = containerAnalysis.withCapacity / containerAnalysis.total;
        expect(containerCapacityRate).toBeGreaterThan(0.1); // At least 10% of containers should have capacity
      }
      
      const treasureAnalysis = typePropertyAnalysis[ItemType.TREASURE];
      if (treasureAnalysis.total > 0) {
        // Treasures should have higher value property rate
        const treasureValueRate = treasureAnalysis.withValue / treasureAnalysis.total;
        expect(treasureValueRate).toBeGreaterThan(0.5); // Most treasures should have value
      }
    });

    it('should validate interaction complexity by type', async () => {
      // Act
      const allItems = await loader.loadAllItems();
      
      // Analyze interaction patterns by type
      const interactionAnalysis: Partial<Record<ItemType, any>> = {};
      
      // Initialize analysis for all types
      Object.values(ItemType).forEach(type => {
        interactionAnalysis[type] = { totalInteractions: 0, itemsWithInteractions: 0, total: 0 };
      });
      
      allItems.forEach(item => {
        const analysis = interactionAnalysis[item.type];
        if (analysis) {
          analysis.total++;
          analysis.totalInteractions += item.interactions.length;
          
          if (item.interactions.length > 0) {
            analysis.itemsWithInteractions++;
          }
        }
      });
      
      console.log('Interaction complexity by type:');
      Object.entries(interactionAnalysis).forEach(([type, analysis]) => {
        if (analysis.total > 0) {
          const avgInteractions = (analysis.totalInteractions / analysis.total).toFixed(1);
          const interactionRate = (analysis.itemsWithInteractions / analysis.total * 100).toFixed(1);
          console.log(`  ${type}: avg ${avgInteractions} interactions, ${interactionRate}% have interactions`);
        }
      });
      
      // Validate interaction patterns make sense
      Object.values(interactionAnalysis).forEach(analysis => {
        if (analysis.total > 0) {
          expect(analysis.totalInteractions).toBeGreaterThanOrEqual(0);
          expect(analysis.itemsWithInteractions).toBeLessThanOrEqual(analysis.total);
          expect(analysis.itemsWithInteractions).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });
});