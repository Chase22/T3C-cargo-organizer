import {
  parseInput,
  initializeContainers,
  getAvailableSpace,
  sortItemsInContainer,
  addItemToContainer,
  Item,
  Container,
} from './cargoOrganizer';


describe('Cargo Organization', () => {
  let containers: Container[];

  beforeEach(() => {
    containers = initializeContainers();
  });

  describe('initializeContainers', () => {
    it('should initialize 12 empty containers', () => {
      expect(containers).toHaveLength(12);
      expect(containers.every(c => c.items.length === 0)).toBe(true);
      expect(containers.every(c => c.totalCrates === 0)).toBe(true);
    });
  });

  describe('parseInput', () => {
    it('should parse single item correctly', () => {
      const input = '0/60 crates :RifleAmmo: 7.62mm';
      const items = parseInput(input);

      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({ name: '7.62mm', quantity: 60 });
    });

    it('should parse multiple items correctly', () => {
      const input = `0/60 crates :RifleAmmo: 7.62mm
0/30 crates :Bandages: Bandage
0/120 crates :Shirts: Shirts`;

      const items = parseInput(input);

      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({ name: '7.62mm', quantity: 60 });
      expect(items[1]).toEqual({ name: 'Bandage', quantity: 30 });
      expect(items[2]).toEqual({ name: 'Shirts', quantity: 120 });
    });

    it('should ignore empty lines', () => {
      const input = `0/60 crates :RifleAmmo: 7.62mm

0/30 crates :Bandages: Bandage`;

      const items = parseInput(input);
      expect(items).toHaveLength(2);
    });

    it('should ignore non-matching lines and parse valid items', () => {
      const input = `0/60 crates :RifleAmmo: 7.62mm
This is not a valid item line
0/30 crates :Bandages: Bandage
Some other text here`;

      const items = parseInput(input);
      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({ name: '7.62mm', quantity: 60 });
      expect(items[1]).toEqual({ name: 'Bandage', quantity: 30 });
    });

    it('should fail when input contains no valid items', () => {
      const input = `This is just some text
No valid items here
Just random lines`;

      expect(() => parseInput(input)).toThrow('No valid items found in input');
    });

    it('should trim item names', () => {
      const input = '0/60 crates :RifleAmmo:   7.62mm   ';
      const items = parseInput(input);

      expect(items[0].name).toBe('7.62mm');
    });

    it('should parse Discord format with backticks and emoji icons', () => {
      const input = '`0`/`75` crates <:MGAmmo:1410191741499215952> *12.7mm*';
      const items = parseInput(input);

      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({ name: '12.7mm', quantity: 75 });
    });

    it('should parse multiple Discord format items correctly', () => {
      const input = `\`0\`/\`75\` crates <:MGAmmo:1410191741499215952> *12.7mm*
\`0\`/\`60\` crates <:SMGAmmo:1410191812722688031> *9mm*
\`0\`/\`30\` crates <:Bandages:1410202677802958858> *Bandage*`;

      const items = parseInput(input);

      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({ name: '12.7mm', quantity: 75 });
      expect(items[1]).toEqual({ name: '9mm', quantity: 60 });
      expect(items[2]).toEqual({ name: 'Bandage', quantity: 30 });
    });

    it('should parse Discord format with numbered list items', () => {
      const input = `1.  \`0\`/\`75\` crates <:MGAmmo:1410191741499215952> *12.7mm*
2.  \`0\`/\`75\` crates <:LightArtilleryAmmo:1410191733312065666> *120mm*
3.  \`0\`/\`60\` crates <:SMGAmmo:1410191812722688031> *9mm*`;

      const items = parseInput(input);

      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({ name: '12.7mm', quantity: 75 });
      expect(items[1]).toEqual({ name: '120mm', quantity: 75 });
      expect(items[2]).toEqual({ name: '9mm', quantity: 60 });
    });
  });

  describe('getAvailableSpace', () => {
    it('should return 60 for empty container', () => {
      const space = getAvailableSpace(containers[0]);
      expect(space).toBe(60);
    });

    it('should return remaining space after adding items', () => {
      addItemToContainer(containers[0], { name: 'Test', quantity: 25 }, 25);
      const space = getAvailableSpace(containers[0]);
      expect(space).toBe(35);
    });

    it('should return 0 for full container', () => {
      addItemToContainer(containers[0], { name: 'Test', quantity: 60 }, 60);
      const space = getAvailableSpace(containers[0]);
      expect(space).toBe(0);
    });
  });

  describe('addItemToContainer', () => {
    it('should add item to empty container', () => {
      const added = addItemToContainer(containers[0], { name: 'Test', quantity: 30 }, 30);

      expect(added).toBe(30);
      expect(containers[0].items).toHaveLength(1);
      expect(containers[0].items[0]).toEqual({ name: 'Test', quantity: 30 });
      expect(containers[0].totalCrates).toBe(30);
    });

    it('should add multiple different items to same container', () => {
      addItemToContainer(containers[0], { name: 'Item1', quantity: 30 }, 30);
      addItemToContainer(containers[0], { name: 'Item2', quantity: 20 }, 20);

      expect(containers[0].items).toHaveLength(2);
      expect(containers[0].totalCrates).toBe(50);
    });

    it('should increase quantity of existing item in container', () => {
      addItemToContainer(containers[0], { name: 'Test', quantity: 30 }, 30);
      addItemToContainer(containers[0], { name: 'Test', quantity: 20 }, 20);

      expect(containers[0].items).toHaveLength(1);
      expect(containers[0].items[0].quantity).toBe(50);
      expect(containers[0].totalCrates).toBe(50);
    });

    it('should not exceed container capacity', () => {
      const added = addItemToContainer(containers[0], { name: 'Test', quantity: 100 }, 100);

      expect(added).toBe(60);
      expect(containers[0].totalCrates).toBe(60);
    });

    it('should partially add item when container space is limited', () => {
      addItemToContainer(containers[0], { name: 'Item1', quantity: 40 }, 40);
      const added = addItemToContainer(containers[0], { name: 'Item2', quantity: 30 }, 30);

      expect(added).toBe(20);
      expect(containers[0].totalCrates).toBe(60);
    });

    it('should return 0 when container is full', () => {
      addItemToContainer(containers[0], { name: 'Item1', quantity: 60 }, 60);
      const added = addItemToContainer(containers[0], { name: 'Item2', quantity: 30 }, 30);

      expect(added).toBe(0);
    });

    it('should work with different containers', () => {
      addItemToContainer(containers[0], { name: 'Test', quantity: 30 }, 30);
      addItemToContainer(containers[4], { name: 'Test', quantity: 40 }, 40);
      addItemToContainer(containers[11], { name: 'Test', quantity: 50 }, 50);

      expect(containers[0].totalCrates).toBe(30);
      expect(containers[4].totalCrates).toBe(40);
      expect(containers[11].totalCrates).toBe(50);
    });

    it('should handle zero quantity gracefully', () => {
      const added = addItemToContainer(containers[0], { name: 'Test', quantity: 0 }, 0);

      expect(added).toBe(0);
      expect(containers[0].items).toHaveLength(0);
    });

    it('should handle large quantities correctly', () => {
      const added = addItemToContainer(containers[0], { name: 'Test', quantity: 1000 }, 1000);

      expect(added).toBe(60);
      expect(containers[0].totalCrates).toBe(60);
    });
  });

  describe('sortItemsInContainer', () => {
    it('should sort items by quantity in descending order', () => {
      const container: Container = {
        items: [
          { name: 'Item1', quantity: 10 },
          { name: 'Item2', quantity: 30 },
          { name: 'Item3', quantity: 20 },
        ],
        totalCrates: 60,
      };

      sortItemsInContainer(container);

      expect(container.items[0]).toEqual({ name: 'Item2', quantity: 30 });
      expect(container.items[1]).toEqual({ name: 'Item3', quantity: 20 });
      expect(container.items[2]).toEqual({ name: 'Item1', quantity: 10 });
    });

    it('should sort items after adding to container', () => {
      addItemToContainer(containers[0], { name: 'Item1', quantity: 10 }, 10);
      addItemToContainer(containers[0], { name: 'Item2', quantity: 30 }, 30);
      addItemToContainer(containers[0], { name: 'Item3', quantity: 20 }, 20);

      expect(containers[0].items[0]).toEqual({ name: 'Item2', quantity: 30 });
      expect(containers[0].items[1]).toEqual({ name: 'Item3', quantity: 20 });
      expect(containers[0].items[2]).toEqual({ name: 'Item1', quantity: 10 });
    });

    it('should maintain sort order when adding to existing item', () => {
      addItemToContainer(containers[0], { name: 'Item1', quantity: 10 }, 10);
      addItemToContainer(containers[0], { name: 'Item2', quantity: 30 }, 30);
      addItemToContainer(containers[0], { name: 'Item1', quantity: 5 }, 5);

      expect(containers[0].items[0]).toEqual({ name: 'Item2', quantity: 30 });
      expect(containers[0].items[1]).toEqual({ name: 'Item1', quantity: 15 });
    });
  });

  describe('integration tests', () => {
    it('should distribute test data without errors', () => {
      const input = `0/60 crates :RifleAmmo: 7.62mm
0/60 crates :SMGAmmo: 9mm
0/60 crates :RifleC: Argenti
0/60 crates :Bandages: Bandage
0/30 crates :Binoculars: Binos
0/30 crates :GasMaskFilter: Filter
0/60 crates :RifleLightC: Fuscina
0/15 crates :ExplosiveLightC: Hydra
0/60 crates :SMGHeavyC: Lionclaw
0/30 crates :GasMask: Mask
0/30 crates :FirstAidKit: Medkit
0/30 crates :BloodPlasma: Plasma
0/45 crates :Radio: Radio
0/120 crates :SoldierSupplies: Shirts
0/30 crates :TraumaKit: Trauma Kit`;

      const items = parseInput(input);
      expect(items).toHaveLength(15);

      // Calculate total crates
      const totalCrates = items.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalCrates).toBeLessThanOrEqual(12 * 60); // Should fit in 12 containers
    });

    it('should correctly track container totals after multiple additions', () => {
      addItemToContainer(containers[0], { name: 'Item1', quantity: 25 }, 25);
      addItemToContainer(containers[0], { name: 'Item2', quantity: 20 }, 20);
      addItemToContainer(containers[1], { name: 'Item3', quantity: 30 }, 30);

      expect(containers[0].totalCrates).toBe(45);
      expect(containers[1].totalCrates).toBe(30);
    });

    it('should maintain data integrity across multiple operations', () => {
      const item1: Item = { name: 'Item1', quantity: 40 };
      const item2: Item = { name: 'Item2', quantity: 35 };

      addItemToContainer(containers[0], item1, 40);
      addItemToContainer(containers[0], item2, 20); // Only 20 can fit
      addItemToContainer(containers[1], item2, 15); // Rest goes to container 2

      expect(containers[0].totalCrates).toBe(60);
      expect(containers[0].items[0].quantity).toBe(40);
      expect(containers[0].items[1].quantity).toBe(20);

      expect(containers[1].totalCrates).toBe(15);
      expect(containers[1].items[0].quantity).toBe(15);
    });
  });
});

