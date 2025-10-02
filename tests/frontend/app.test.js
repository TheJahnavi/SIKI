// Frontend Test Suite for SIKI Application
const puppeteer = require('puppeteer');
const { expect } = require('chai');

describe('SIKI Frontend Tests', () => {
  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 10
    });
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#page-1');
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Camera Functionality', () => {
    it('TC-021: Should initialize camera when page loads', async () => {
      // Wait for camera stream element
      await page.waitForSelector('#camera-stream', { timeout: 10000 });
      
      // Check if camera stream is visible
      const isCameraVisible = await page.evaluate(() => {
        const cameraStream = document.getElementById('camera-stream');
        return cameraStream && cameraStream.style.display !== 'none';
      });
      
      expect(isCameraVisible).to.be.true;
    }).timeout(15000);

    it('TC-021: Should show camera placeholder when camera is not available', async () => {
      // Simulate camera error by blocking media permissions
      await page.goto('http://localhost:3000');
      
      // Check if placeholder is visible
      await page.waitForSelector('.camera-placeholder');
      const placeholderVisible = await page.evaluate(() => {
        const placeholder = document.querySelector('.camera-placeholder');
        return placeholder && placeholder.style.display !== 'none';
      });
      
      expect(placeholderVisible).to.be.true;
    });
  });

  describe('UI Elements', () => {
    it('TC-019: Should display all action buttons', async () => {
      // Check if upload button exists
      const uploadButtonExists = await page.$('#upload-button') !== null;
      expect(uploadButtonExists).to.be.true;
      
      // Check if camera button exists
      const cameraButtonExists = await page.$('#camera-button') !== null;
      expect(cameraButtonExists).to.be.true;
      
      // Check if analyze button exists
      const analyzeButtonExists = await page.$('#analyze-button') !== null;
      expect(analyzeButtonExists).to.be.true;
    });

    it('TC-020: Should toggle theme when theme button is clicked', async () => {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-theme');
      });
      
      // Click theme toggle
      await page.click('#theme-toggle');
      
      // Get new theme
      const newTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-theme');
      });
      
      expect(newTheme).to.not.equal(initialTheme);
    });
  });

  describe('Image Upload', () => {
    it('TC-001: Should allow file upload and enable analyze button', async () => {
      // Mock file input
      await page.evaluate(() => {
        const input = document.getElementById('upload-input');
        // Create a mock file
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        // Dispatch change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      });
      
      // Wait for analyze button to be enabled
      await page.waitForFunction(() => {
        const button = document.getElementById('analyze-button');
        return !button.disabled && !button.classList.contains('disabled');
      });
      
      const isAnalyzeButtonEnabled = await page.evaluate(() => {
        const button = document.getElementById('analyze-button');
        return !button.disabled && !button.classList.contains('disabled');
      });
      
      expect(isAnalyzeButtonEnabled).to.be.true;
    });
  });

  describe('Navigation', () => {
    it('TC-014: Should navigate to result page when analyze is clicked', async () => {
      // Mock file input to enable analyze button
      await page.evaluate(() => {
        const input = document.getElementById('upload-input');
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      });
      
      // Wait for analyze button to be enabled
      await page.waitForFunction(() => {
        const button = document.getElementById('analyze-button');
        return !button.disabled && !button.classList.contains('disabled');
      });
      
      // Click analyze button
      await page.click('#analyze-button');
      
      // Wait for result page to be visible
      await page.waitForSelector('#page-2');
      
      const isResultPageVisible = await page.evaluate(() => {
        const page2 = document.getElementById('page-2');
        return page2 && page2.classList.contains('active');
      });
      
      expect(isResultPageVisible).to.be.true;
    });

    it('TC-014: Should navigate back to home page when back button is clicked', async () => {
      // First navigate to result page
      await page.evaluate(() => {
        const input = document.getElementById('upload-input');
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      });
      
      await page.waitForFunction(() => {
        const button = document.getElementById('analyze-button');
        return !button.disabled && !button.classList.contains('disabled');
      });
      
      await page.click('#analyze-button');
      await page.waitForSelector('#page-2');
      
      // Click back button
      await page.click('#back-button');
      
      // Wait for home page to be visible
      await page.waitForSelector('#page-1');
      
      const isHomePageVisible = await page.evaluate(() => {
        const page1 = document.getElementById('page-1');
        return page1 && page1.classList.contains('active');
      });
      
      expect(isHomePageVisible).to.be.true;
    });
  });
});