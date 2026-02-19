import {
  parseInput,
  initializeContainers,
  getAvailableSpace,
  addItemToContainer,
  Item,
  Container,
} from './cargoOrganizer';

const TEST_DATA = `0/60 crates :RifleAmmo: 7.62mm
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

class UIManager {
  private readonly inputField: HTMLTextAreaElement;
  private readonly distributeButton: HTMLButtonElement;
  private readonly outputTextarea: HTMLTextAreaElement;
  private readonly copyButton: HTMLButtonElement;

  constructor() {
    this.inputField = document.getElementById('input-field') as HTMLTextAreaElement;
    this.distributeButton = document.getElementById('distribute-button') as HTMLButtonElement;
    this.outputTextarea = document.getElementById('output-textarea') as HTMLTextAreaElement;
    this.copyButton = document.getElementById('copy-button') as HTMLButtonElement;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.distributeButton.addEventListener('click', () => this.handleDistribute());
    this.inputField.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.handleDistribute();
      }
    });

    const loadTestDataButton = document.getElementById('load-test-data-button') as HTMLButtonElement;
    loadTestDataButton.addEventListener('click', () => this.handleLoadTestData());

    this.copyButton.addEventListener('click', () => this.handleCopy());
  }

  private handleLoadTestData(): void {
    this.inputField.value = TEST_DATA;
    this.handleDistribute();
  }

  private handleCopy(): void {
    const output = this.outputTextarea.value;
    if (!output) {
      alert('No output to copy');
      return;
    }

    const markdownOutput = `\`\`\`\n${output}\n\`\`\``;

    navigator.clipboard.writeText(markdownOutput).then(() => {
      // Provide visual feedback
      const originalText = this.copyButton.textContent;
      this.copyButton.textContent = 'Copied!';
      this.copyButton.disabled = true;

      setTimeout(() => {
        this.copyButton.textContent = originalText;
        this.copyButton.disabled = false;
      }, 2000);
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  }

  private handleDistribute(): void {
    const input = this.inputField.value.trim();
    if (!input) {
      alert('Please paste some cargo data');
      return;
    }

    let items: Item[];
    try {
      items = parseInput(input);
    } catch (error) {
      alert(`Error parsing input: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    // Initialize fresh containers
    const containers = initializeContainers();

    // Try to distribute items
    const success = this.distributeItems(containers, items);

    if (!success) {
      alert('Error: Items cannot fit into 12 containers (max 720 crates total)');
      return;
    }

    this.renderOutput(containers);
  }

  private distributeItems(containers: Container[], items: Item[]): boolean {
    // Calculate total crates
    const totalCrates = items.reduce((sum, item) => sum + item.quantity, 0);
    const maxCapacity = 12 * 60;

    if (totalCrates > maxCapacity) {
      return false;
    }

    // Sort items by quantity descending for better distribution
    const sortedItems = [...items].sort((a, b) => b.quantity - a.quantity);

    // Distribute each item type
    for (const item of sortedItems) {
      let remaining = item.quantity;

      // Find containers with the most available space and fewest item types
      while (remaining > 0) {
        // Get available containers sorted by available space (descending)
        const availableContainers = containers
          .filter((c) => getAvailableSpace(c) > 0)
          .sort((a, b) => {
            const aSpace = getAvailableSpace(a);
            const bSpace = getAvailableSpace(b);
            // Sort by available space descending, then by item count ascending
            return bSpace - aSpace || a.items.length - b.items.length;
          });

        if (availableContainers.length === 0) {
          return false; // No space left
        }

        const container = availableContainers[0];
        const space = getAvailableSpace(container);
        const toAdd = Math.min(remaining, space);

        addItemToContainer(container, item, toAdd);
        remaining -= toAdd;
      }
    }

    return true;
  }

  private renderOutput(containers: Container[]): void {
    const lines: string[] = [];

    // Sort containers by number of items (ascending - fewer items first), then by container ID
    const sortedContainers = [...containers]
      .filter(c => c.items.length > 0)
      .sort((a, b) => {
        // Primary sort: by number of items (fewer first)
        if (a.items.length !== b.items.length) {
          return a.items.length - b.items.length;
        }
        // Secondary sort: by container ID (in order)
        return a.id - b.id;
      });

    sortedContainers.forEach(container => {
      if (container.items.length === 1) {
        // Single item format: Container {number}: {quantity} crates {item}
        const item = container.items[0];
        lines.push(`Container ${container.id}: ${item.quantity} crates ${item.name}`);
      } else {
        // Multiple items format
        lines.push(`┌ Container ${container.id}`);
        container.items.forEach(item => {
          lines.push(`│ ${item.quantity} crates ${item.name}`);
        });
        lines.push(`└`);
      }
    });

    this.outputTextarea.value = lines.join('\n');
  }
}


// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
  new UIManager();
});

