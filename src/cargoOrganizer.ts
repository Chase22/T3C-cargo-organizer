export interface Item {
  name: string;
  quantity: number;
}

export interface Container {
  id: number;
  items: Item[];
  totalCrates: number;
}

export const MAX_CRATES_PER_CONTAINER = 60;

export function parseInput(input: string): Item[] {
  // Format: _/Quantity crates :_: Name
  const lines = input.split('\n').filter(line => line.trim());
  return lines.map((line, index) => {
    const match = line.match(/^\d+\/(\d+)\s+crates\s+:[^:]*:\s*(.+)$/);
    if (!match) {
      throw new Error(`Invalid line format at line ${index + 1}: "${line}"`);
    }
    return { name: match[2].trim(), quantity: parseInt(match[1], 10) };
  });
}

export function initializeContainers(): Container[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    items: [],
    totalCrates: 0,
  }));
}

export function getAvailableSpace(container: Container): number {
  return MAX_CRATES_PER_CONTAINER - container.totalCrates;
}


export function addItemToContainer(container: Container, item: Item, quantity: number): number {
  const availableSpace = getAvailableSpace(container);
  const amountToAdd = Math.min(quantity, availableSpace);

  if (amountToAdd > 0) {
    const existingItem = container.items.find(i => i.name === item.name);
    if (existingItem) {
      existingItem.quantity += amountToAdd;
    } else {
      container.items.push({
        name: item.name,
        quantity: amountToAdd,
      });
    }
    container.totalCrates += amountToAdd;
  }

  return amountToAdd;
}

