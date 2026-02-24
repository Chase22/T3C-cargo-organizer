export interface Item {
  name: string;
  quantity: number;
}

export interface Container {
  items: Item[];
  totalCrates: number;
}

export const MAX_CRATES_PER_CONTAINER = 60;

export function parseInput(input: string): Item[] {
  // Supports multiple formats:
  // Format 1: _/Quantity crates :_: Name
  // Format 2: `_`/`Quantity` crates <:Icon:ID> *Name*
  // Format 3: 1. `_`/`Quantity` crates <:Icon:ID> *Name* (with Discord list numbering)
  // Non-matching lines are silently ignored
  const lines = input.split('\n').filter(line => line.trim());
  const items: Item[] = [];

  for (const line of lines) {
    // Remove leading list numbering (e.g., "1. ", "2. ", etc.)
    const cleanedLine = line.replace(/^\d+\.\s+/, '');

    // Try Discord format first: `_`/`Quantity` crates <:Icon:ID> *Name*
    let match = cleanedLine.match(/`\d+`\/`(\d+)`\s+crates\s+<:[^:]*:\d+>\s+\*(.+?)\*/);
    if (match) {
      items.push({ name: match[2].trim(), quantity: parseInt(match[1], 10) });
      continue;
    }

    // Try simple format: _/Quantity crates :_: Name
    match = cleanedLine.match(/^\d+\/(\d+)\s+crates\s+:[^:]*:\s*(.+)$/);
    if (match) {
      items.push({ name: match[2].trim(), quantity: parseInt(match[1], 10) });
      continue;
    }

    // Line doesn't match any format - silently ignore it
  }

  if (items.length === 0) {
    throw new Error('No valid items found in input');
  }

  return items;
}

export function initializeContainers(): Container[] {
  return Array.from({ length: 12 }, () => ({
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

