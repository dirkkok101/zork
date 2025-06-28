/**
 * Integration tests for MonsterDataLoader data integrity functionality
 * Tests real file I/O operations and validates all 9 monsters load correctly
 */

import { MonsterDataLoader } from '../../../../../src/data_loaders/MonsterDataLoader';
import { MonsterType, MonsterState } from '../../../../../src/types/MonsterTypes';

// Import setup to ensure fs/promises is not mocked
import '../setup';

describe('MonsterDataLoader - Data Integrity Integration', () => {
  let loader: MonsterDataLoader;
  
  beforeEach(() => {
    // Use actual data path for integration testing
    loader = new MonsterDataLoader('data/monsters/');
  });

  describe('Real data loading', () => {
    it('should load all 9 monsters from actual data files', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Assert basic structure
      expect(allMonsters.length).toBe(9);
      
      console.log(`Loaded ${allMonsters.length} monsters from real data files`);
      
      // Validate each monster has required properties
      allMonsters.forEach(monster => {
        expect(typeof monster.id).toBe('string');
        expect(monster.id.length).toBeGreaterThan(0);
        expect(typeof monster.name).toBe('string');
        expect(monster.name.length).toBeGreaterThan(0);
        expect(typeof monster.description).toBe('string');
        expect(typeof monster.examineText).toBe('string');
        expect(Object.values(MonsterType)).toContain(monster.type);
        expect(Object.values(MonsterState)).toContain(monster.state);
        expect(typeof monster.health).toBe('number');
        expect(typeof monster.maxHealth).toBe('number');
        expect(Array.isArray(monster.inventory)).toBe(true);
        expect(Array.isArray(monster.synonyms)).toBe(true);
        expect(typeof monster.flags).toBe('object');
        expect(typeof monster.properties).toBe('object');
      });
    });

    it('should have unique monster IDs across all monsters', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Assert unique IDs
      const monsterIds = allMonsters.map(monster => monster.id);
      const uniqueIds = new Set(monsterIds);
      
      expect(uniqueIds.size).toBe(allMonsters.length);
      
      // Check for any duplicates
      const duplicates = monsterIds.filter((id, index) => monsterIds.indexOf(id) !== index);
      expect(duplicates).toEqual([]);
    });

    it('should validate actual type distribution matches documentation', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Group monsters by type
      const monstersByType: Partial<Record<MonsterType, any[]>> = {};
      
      // Initialize with empty arrays for found types
      Object.values(MonsterType).forEach(type => {
        monstersByType[type] = [];
      });
      
      allMonsters.forEach(monster => {
        if (monstersByType[monster.type]) {
          monstersByType[monster.type]!.push(monster);
        }
      });
      
      // Validate distributions based on interface documentation
      console.log('Type distribution:');
      Object.entries(monstersByType).forEach(([type, monsters]) => {
        if (monsters && monsters.length > 0) {
          console.log(`  ${type}: ${monsters.length} monsters`);
        }
      });
      
      // HUMANOID should have 5 monsters (thief, troll, cyclops, gnome_of_zurich, guardian_of_zork)
      expect((monstersByType[MonsterType.HUMANOID] || []).length).toBe(5);
      
      // CREATURE should have 2 monsters (ghost, volcano_gnome)
      expect((monstersByType[MonsterType.CREATURE] || []).length).toBe(2);
      
      // ENVIRONMENTAL should have 2 monsters (grue, vampire_bat)
      expect((monstersByType[MonsterType.ENVIRONMENTAL] || []).length).toBe(2);
      
      // Validate that we have monsters in exactly 3 types
      const nonEmptyTypes = Object.values(monstersByType).filter(monsters => monsters && monsters.length > 0).length;
      expect(nonEmptyTypes).toBe(3);
    });

    it('should validate known monster IDs are present', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      const monsterIds = allMonsters.map(monster => monster.id);
      
      // Expected monsters based on actual data
      const expectedMonsters = [
        'thief', 'troll', 'cyclops', 'gnome_of_zurich', 'guardian_of_zork', // HUMANOID
        'ghost', 'volcano_gnome', // CREATURE  
        'grue', 'vampire_bat' // ENVIRONMENTAL
      ];
      
      // Assert all expected monsters are present
      expectedMonsters.forEach(expectedId => {
        expect(monsterIds).toContain(expectedId);
      });
      
      console.log(`Found expected monsters: ${expectedMonsters.join(', ')}`);
    });
  });

  describe('Monster property validation', () => {
    it('should validate health distributions are reasonable', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Analyze health distribution
      const healths = allMonsters.map(monster => monster.health);
      const minHealth = Math.min(...healths);
      const maxHealth = Math.max(...healths);
      const avgHealth = healths.reduce((sum, h) => sum + h, 0) / healths.length;
      
      console.log(`Health distribution: min=${minHealth}, max=${maxHealth}, avg=${avgHealth.toFixed(2)}`);
      
      // Basic health validation
      expect(minHealth).toBeGreaterThan(0);
      expect(maxHealth).toBeLessThan(10000); // Reasonable upper bound
      expect(avgHealth).toBeGreaterThan(0);
      
      // Health should not exceed maxHealth
      allMonsters.forEach(monster => {
        expect(monster.health).toBeLessThanOrEqual(monster.maxHealth);
        expect(monster.maxHealth).toBeGreaterThan(0);
      });
    });

    it('should validate combat strength properties', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Analyze combat strength
      const monstersWithCombat = allMonsters.filter(monster => monster.combatStrength !== undefined);
      
      console.log(`Monsters with combat strength: ${monstersWithCombat.length}/${allMonsters.length}`);
      
      if (monstersWithCombat.length > 0) {
        monstersWithCombat.forEach(monster => {
          expect(typeof monster.combatStrength).toBe('number');
          expect(monster.combatStrength).toBeGreaterThan(0);
          expect(monster.combatStrength).toBeLessThan(20000); // Some monsters like guardian_of_zork have very high combat strength
        });
      }
    });

    it('should validate movement patterns', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Analyze movement patterns
      const movementPatternCounts: Record<string, number> = {};
      
      allMonsters.forEach(monster => {
        const pattern = monster.movementPattern || 'NONE';
        movementPatternCounts[pattern] = (movementPatternCounts[pattern] || 0) + 1;
      });
      
      console.log('Movement pattern distribution:');
      Object.entries(movementPatternCounts).forEach(([pattern, count]) => {
        console.log(`  ${pattern}: ${count} monsters`);
      });
      
      // Validate movement patterns are valid string values (if defined)
      const validMovementPatterns = ['stationary', 'random', 'patrol', 'follow', 'flee'];
      allMonsters.forEach(monster => {
        if (monster.movementPattern) {
          expect(validMovementPatterns).toContain(monster.movementPattern);
        }
      });
    });

    it('should validate MDL properties are present', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Analyze MDL properties
      let behaviorFunctionCount = 0;
      let movementDemonCount = 0;
      let meleeMessagesCount = 0;
      
      allMonsters.forEach(monster => {
        if (monster.behaviorFunction) {
          behaviorFunctionCount++;
          expect(typeof monster.behaviorFunction).toBe('string');
        }
        if (monster.movementDemon) {
          movementDemonCount++;
          expect(typeof monster.movementDemon).toBe('string');
        }
        if (monster.meleeMessages && Object.keys(monster.meleeMessages).length > 0) {
          meleeMessagesCount++;
          expect(typeof monster.meleeMessages).toBe('object');
          expect(monster.meleeMessages).not.toBeNull();
        }
      });
      
      console.log(`MDL properties:`);
      console.log(`  Behavior functions: ${behaviorFunctionCount}/${allMonsters.length}`);
      console.log(`  Movement demons: ${movementDemonCount}/${allMonsters.length}`);
      console.log(`  Melee messages: ${meleeMessagesCount}/${allMonsters.length}`);
      
      // At least some monsters should have MDL properties
      expect(behaviorFunctionCount + movementDemonCount + meleeMessagesCount).toBeGreaterThan(0);
    });
  });

  describe('Monster state validation', () => {
    it('should validate monster states are valid', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Analyze state distribution
      const stateCounts: Record<MonsterState, number> = {
        [MonsterState.IDLE]: 0,
        [MonsterState.ALERT]: 0,
        [MonsterState.HOSTILE]: 0,
        [MonsterState.FLEEING]: 0,
        [MonsterState.FRIENDLY]: 0,
        [MonsterState.DEAD]: 0,
        [MonsterState.GUARDING]: 0,
        [MonsterState.WANDERING]: 0,
        [MonsterState.LURKING]: 0,
        [MonsterState.SLEEPING]: 0
      };
      
      allMonsters.forEach(monster => {
        stateCounts[monster.state]++;
      });
      
      console.log('Monster state distribution:');
      Object.entries(stateCounts).forEach(([state, count]) => {
        if (count > 0) {
          console.log(`  ${state}: ${count} monsters`);
        }
      });
      
      // Most monsters should start in some valid state
      const totalActiveStates = stateCounts[MonsterState.IDLE] + 
                                stateCounts[MonsterState.ALERT] + 
                                stateCounts[MonsterState.GUARDING] + 
                                stateCounts[MonsterState.WANDERING] + 
                                stateCounts[MonsterState.LURKING] + 
                                stateCounts[MonsterState.SLEEPING];
      expect(totalActiveStates).toBeGreaterThan(0);
    });

    it('should validate monster locations', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Analyze location assignments
      const locatedMonsters = allMonsters.filter(monster => monster.currentSceneId);
      const startingLocations = allMonsters.filter(monster => monster.startingSceneId);
      
      console.log(`Monsters with current locations: ${locatedMonsters.length}/${allMonsters.length}`);
      console.log(`Monsters with starting locations: ${startingLocations.length}/${allMonsters.length}`);
      
      // Validate location strings are reasonable
      locatedMonsters.forEach(monster => {
        expect(typeof monster.currentSceneId).toBe('string');
        expect(monster.currentSceneId!.length).toBeGreaterThan(0);
      });
      
      startingLocations.forEach(monster => {
        expect(typeof monster.startingSceneId).toBe('string');
        expect(monster.startingSceneId!.length).toBeGreaterThan(0);
      });
    });

    it('should validate inventory structures', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Analyze inventory
      const monstersWithInventory = allMonsters.filter(monster => monster.inventory.length > 0);
      
      console.log(`Monsters with inventory: ${monstersWithInventory.length}/${allMonsters.length}`);
      
      if (monstersWithInventory.length > 0) {
        monstersWithInventory.forEach(monster => {
          expect(Array.isArray(monster.inventory)).toBe(true);
          monster.inventory.forEach(item => {
            expect(typeof item).toBe('string');
            expect(item.length).toBeGreaterThan(0);
          });
        });
      }
    });
  });

  describe('Data consistency validation', () => {
    it('should validate all monsters have consistent property structures', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Check for consistent property structures
      allMonsters.forEach(monster => {
        // Validate required fields exist and are correct types
        expect(monster).toHaveProperty('id');
        expect(monster).toHaveProperty('name');
        expect(monster).toHaveProperty('description');
        expect(monster).toHaveProperty('examineText');
        expect(monster).toHaveProperty('type');
        expect(monster).toHaveProperty('state');
        expect(monster).toHaveProperty('health');
        expect(monster).toHaveProperty('maxHealth');
        expect(monster).toHaveProperty('inventory');
        expect(monster).toHaveProperty('synonyms');
        expect(monster).toHaveProperty('flags');
        expect(monster).toHaveProperty('properties');
        
        // Validate that properties objects are valid
        expect(typeof monster.properties).toBe('object');
        expect(monster.properties).not.toBeNull();
        expect(typeof monster.flags).toBe('object');
        expect(monster.flags).not.toBeNull();
      });
    });

    it('should validate no monsters have corrupted or missing critical data', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Find monsters with potential data issues
      const issues: string[] = [];
      
      allMonsters.forEach(monster => {
        // Check for empty or suspicious data
        if (!monster.id || monster.id.trim().length === 0) {
          issues.push(`Monster has empty ID: ${JSON.stringify(monster)}`);
        }
        if (!monster.name || monster.name.trim().length === 0) {
          issues.push(`Monster ${monster.id} has empty name`);
        }
        if (!monster.description || monster.description.trim().length === 0) {
          issues.push(`Monster ${monster.id} has empty description`);
        }
        if (monster.health < 0) {
          issues.push(`Monster ${monster.id} has negative health: ${monster.health}`);
        }
        if (monster.maxHealth <= 0) {
          issues.push(`Monster ${monster.id} has invalid maxHealth: ${monster.maxHealth}`);
        }
        if (!Array.isArray(monster.inventory)) {
          issues.push(`Monster ${monster.id} has non-array inventory`);
        }
        if (!Array.isArray(monster.synonyms)) {
          issues.push(`Monster ${monster.id} has non-array synonyms`);
        }
      });
      
      // Report issues but don't fail if there are minor ones
      if (issues.length > 0) {
        console.warn(`Found ${issues.length} data issues:`);
        issues.slice(0, 3).forEach(issue => console.warn(`  - ${issue}`));
        if (issues.length > 3) {
          console.warn(`  ... and ${issues.length - 3} more issues`);
        }
      }
      
      // Only fail for critical issues (more than 10% of monsters)
      expect(issues.length).toBeLessThan(allMonsters.length * 0.1);
    });

    it('should validate monster type-specific properties', async () => {
      // Act
      const allMonsters = await loader.loadAllMonsters();
      
      // Group by type and validate type-specific characteristics
      const humanoids = allMonsters.filter(monster => monster.type === MonsterType.HUMANOID);
      const creatures = allMonsters.filter(monster => monster.type === MonsterType.CREATURE);
      const environmental = allMonsters.filter(monster => monster.type === MonsterType.ENVIRONMENTAL);
      
      console.log(`Type-specific validation:`);
      console.log(`  Humanoids: ${humanoids.length} (should be intelligent, may have inventory)`);
      console.log(`  Creatures: ${creatures.length} (should be animalistic)`);
      console.log(`  Environmental: ${environmental.length} (should be incorporeal/environmental)`);
      
      // Basic type validation
      expect(humanoids.length).toBe(5);
      expect(creatures.length).toBe(2);
      expect(environmental.length).toBe(2);
      
      // Humanoids might have more complex behaviors
      humanoids.forEach(humanoid => {
        expect(humanoid.type).toBe(MonsterType.HUMANOID);
        // Humanoids might be more likely to have inventory or behavior functions
      });
      
      // Environmental monsters might have special properties
      environmental.forEach(envMonster => {
        expect(envMonster.type).toBe(MonsterType.ENVIRONMENTAL);
        // Environmental monsters might have unique movement or behavior patterns
      });
    });
  });

  describe('Performance with real data', () => {
    it('should load all monsters within reasonable time', async () => {
      // Act & Assert
      const startTime = Date.now();
      const allMonsters = await loader.loadAllMonsters();
      const duration = Date.now() - startTime;
      
      expect(allMonsters.length).toBe(9);
      expect(duration).toBeLessThan(100); // Should load 9 monsters within 100ms
      
      console.log(`Loaded ${allMonsters.length} monsters in ${duration}ms`);
    });

    it('should handle multiple consecutive loads efficiently', async () => {
      // Act - Load multiple times to test consistency
      const results: { count: number; duration: number }[] = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        const allMonsters = await loader.loadAllMonsters();
        const duration = Date.now() - startTime;
        
        results.push({ count: allMonsters.length, duration });
      }
      
      // Assert consistency
      results.forEach((result, index) => {
        expect(result.count).toBe(9);
        expect(result.duration).toBeLessThan(200);
        console.log(`Load ${index + 1}: ${result.count} monsters in ${result.duration}ms`);
      });
      
      // All loads should return same count
      const counts = results.map(r => r.count);
      const uniqueCounts = new Set(counts);
      expect(uniqueCounts.size).toBe(1);
    });
  });
});