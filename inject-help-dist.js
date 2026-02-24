const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');

function injectHelpIntoDistribution() {
  const helpMarkdownPath = path.join(__dirname, 'src', 'HELP.md');
  const distIndexPath = path.join(__dirname, 'dist', 'index.html');

  // Check if dist directory exists
  if (!fs.existsSync(distIndexPath)) {
    console.log('⚠ dist/index.html not found. Build may not have completed yet.');
    return;
  }

  try {
    // Read and parse markdown
    const markdown = fs.readFileSync(helpMarkdownPath, 'utf-8');
    const htmlContent = marked(markdown);

    // Read the bundled index.html
    const htmlContent_file = fs.readFileSync(distIndexPath, 'utf-8');

    // Parse HTML using JSDOM
    const dom = new JSDOM(htmlContent_file);
    const document = dom.window.document;

    // Find the help-content div
    const helpContentDiv = document.getElementById('help-content');

    if (!helpContentDiv) {
      console.error('✗ Could not find #help-content element in dist/index.html');
      process.exit(1);
    }

    // Set the innerHTML with the rendered markdown
    helpContentDiv.innerHTML = htmlContent;

    // Serialize the modified DOM back to HTML
    const modifiedHtml = dom.serialize();

    // Write back the modified dist/index.html
    fs.writeFileSync(distIndexPath, modifiedHtml);

    fs.copyFileSync(path.join(__dirname, 'img', 'right.png'), path.join(__dirname, 'dist', 'right.png'))

    console.log('✓ Injected help content into dist/index.html');
  } catch (error) {
    console.error('✗ Error injecting help content:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  injectHelpIntoDistribution();
}

module.exports = injectHelpIntoDistribution;

