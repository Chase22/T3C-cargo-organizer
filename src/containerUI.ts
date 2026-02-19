export class ContainerUI {
  constructor(
    public box: HTMLElement,
    public itemsDiv: HTMLElement,
    public counter: HTMLElement
  ) {}
}

export function createContainerUI(containerId: number, containersGrid: HTMLElement): ContainerUI {
  const containerBox = document.createElement('div');
  containerBox.className = 'container-box';
  containerBox.id = `container-${containerId}`;

  const headerDiv = document.createElement('div');
  headerDiv.className = 'container-header';

  const containerNumber = document.createElement('div');
  containerNumber.className = 'container-number';
  containerNumber.textContent = `Container ${containerId}`;

  const counter = document.createElement('div');
  counter.className = 'container-counter';
  counter.id = `counter-${containerId}`;

  headerDiv.appendChild(containerNumber);
  headerDiv.appendChild(counter);

  const itemsDiv = document.createElement('div');
  itemsDiv.className = 'container-items';
  itemsDiv.id = `container-items-${containerId}`;

  containerBox.appendChild(headerDiv);
  containerBox.appendChild(itemsDiv);

  containersGrid.appendChild(containerBox);

  return new ContainerUI(containerBox, itemsDiv, counter);
}

