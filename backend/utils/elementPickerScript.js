// File: backend/utils/elementPickerScript.js

// This is a string containing the JavaScript that will be injected into the page
const elementPickerScript = `
(function() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.id = 'wem-element-picker-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  // Create control panel
  const controlPanel = document.createElement('div');
  controlPanel.id = 'wem-control-panel';
  controlPanel.style.position = 'fixed';
  controlPanel.style.top = '10px';
  controlPanel.style.right = '10px';
  controlPanel.style.padding = '10px';
  controlPanel.style.backgroundColor = 'white';
  controlPanel.style.border = '1px solid #ccc';
  controlPanel.style.borderRadius = '5px';
  controlPanel.style.zIndex = '1000000';
  controlPanel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  document.body.appendChild(controlPanel);

  // Extract page context ID from URL
  // This is a simplification - in a real app, this would be passed in a more robust way
  let pageContextId = '';
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('pageContextId')) {
  pageContextId = urlParams.get('pageContextId');
} else {
  // Try to extract from path (fallback)
  const pathParts = window.location.pathname.split('/');
  const pageContextIndex = pathParts.findIndex(part => part === 'pages');
  if (pageContextIndex >= 0 && pageContextIndex < pathParts.length - 1) {
    pageContextId = pathParts[pageContextIndex + 1];
  }
}
  // Add controls
  controlPanel.innerHTML = \`
    <div style="font-weight: bold; margin-bottom: 10px;">Web Element Monitor</div>
    <div style="margin-bottom: 5px;">
      <button id="wem-toggle-picker" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Start Picking</button>
    </div>
    <div id="wem-element-info" style="margin-top: 10px; font-size: 12px; display: none;">
      <div>Selected Element:</div>
      <div id="wem-element-tag" style="margin-top: 5px;"></div>
      <div id="wem-element-id" style="margin-top: 5px;"></div>
      <div id="wem-element-classes" style="margin-top: 5px;"></div>
      <div style="margin-top: 10px;">
        <input id="wem-element-name" type="text" placeholder="Element Name" style="width: 100%; padding: 5px; margin-bottom: 5px;">
        <textarea id="wem-element-description" placeholder="Element Description" style="width: 100%; padding: 5px; margin-bottom: 5px; height: 60px;"></textarea>
        <button id="wem-save-element" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Save Element</button>
        <div id="wem-save-status" style="margin-top: 5px; font-size: 12px;"></div>
      </div>
    </div>
  \`;

  // Variables to track state
  let isPickerActive = false;
  let hoveredElement = null;
  let selectedElement = null;
  let originalOutline = '';

  // Elements
  const toggleButton = document.getElementById('wem-toggle-picker');
  const elementInfo = document.getElementById('wem-element-info');
  const elementTag = document.getElementById('wem-element-tag');
  const elementId = document.getElementById('wem-element-id');
  const elementClasses = document.getElementById('wem-element-classes');
  const elementName = document.getElementById('wem-element-name');
  const elementDescription = document.getElementById('wem-element-description');
  const saveButton = document.getElementById('wem-save-element');
  const saveStatus = document.getElementById('wem-save-status');

  // Toggle picker activation
  toggleButton.addEventListener('click', function() {
    isPickerActive = !isPickerActive;
    
    if (isPickerActive) {
      toggleButton.innerHTML = 'Stop Picking';
      toggleButton.style.backgroundColor = '#dc3545';
      overlay.style.display = 'block';
    } else {
      toggleButton.innerHTML = 'Start Picking';
      toggleButton.style.backgroundColor = '#007bff';
      overlay.style.display = 'none';
      
      // Clear any highlighted element
      if (hoveredElement) {
        hoveredElement.style.outline = originalOutline;
        hoveredElement = null;
      }
      
      elementInfo.style.display = 'none';
    }
  });

  // Handle overlay mouse movement
  overlay.addEventListener('mousemove', function(e) {
    if (!isPickerActive) return;
    
    // Get the element under the pointer (excluding our overlay and control panel)
    overlay.style.pointerEvents = 'none';
    const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';
    
    if (elementUnderPointer && 
        elementUnderPointer !== overlay && 
        !controlPanel.contains(elementUnderPointer)) {
      
      // If we were hovering over a different element before, reset its style
      if (hoveredElement && hoveredElement !== elementUnderPointer) {
        hoveredElement.style.outline = originalOutline;
      }
      
      // Set the new hovered element
      hoveredElement = elementUnderPointer;
      originalOutline = hoveredElement.style.outline;
      hoveredElement.style.outline = '2px solid #007bff';
    }
  });

  // Handle element selection
  overlay.addEventListener('click', function(e) {
    if (!isPickerActive || !hoveredElement) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Set the selected element and update the info panel
    selectedElement = hoveredElement;
    
    elementTag.innerHTML = '<strong>Tag:</strong> ' + selectedElement.tagName.toLowerCase();
    elementId.innerHTML = '<strong>ID:</strong> ' + (selectedElement.id || 'none');
    elementClasses.innerHTML = '<strong>Classes:</strong> ' + (selectedElement.className || 'none');
    
    elementInfo.style.display = 'block';
    
    // Auto-generate a name based on the element properties
    let suggestedName = '';
    if (selectedElement.id) {
      suggestedName = selectedElement.tagName.toLowerCase() + '-' + selectedElement.id;
    } else if (selectedElement.className) {
      const firstClass = selectedElement.className.split(' ')[0];
      suggestedName = selectedElement.tagName.toLowerCase() + '-' + firstClass;
    } else {
      suggestedName = selectedElement.tagName.toLowerCase() + '-element';
    }
    
    elementName.value = suggestedName;
    elementDescription.value = 'Element picked from ' + document.title;
    
    // Clear previous save status
    saveStatus.innerHTML = '';
    saveStatus.style.color = '';
  });

  // Handle save button click
  saveButton.addEventListener('click', function() {
    if (!selectedElement) return;
    
    // Extract selectors
    const elementData = {
      pageContextId: pageContextId,
      name: elementName.value || 'Unnamed Element',
      description: elementDescription.value || 'Element picked from page',
      selectors: {
        css: getCssSelector(selectedElement),
        xpath: getXPath(selectedElement),
        id: selectedElement.id || ''
      },
      position: {
        x: selectedElement.getBoundingClientRect().left + window.scrollX,
        y: selectedElement.getBoundingClientRect().top + window.scrollY,
        width: selectedElement.offsetWidth,
        height: selectedElement.offsetHeight
      },
      content: selectedElement.textContent.trim().substring(0, 100),
      attributes: {}
    };
    
    // Collect attributes
    for (const attr of selectedElement.attributes) {
      elementData.attributes[attr.name] = attr.value;
    }
    
    // Send the data to the server
    saveElement(elementData)
      .then(response => {
        console.log('Element saved successfully:', response);
        saveStatus.innerHTML = 'Element saved successfully!';
        saveStatus.style.color = 'green';
        
        // Reset selection after a brief delay to show success message
        setTimeout(() => {
          selectedElement = null;
          elementInfo.style.display = 'none';
        }, 2000);
      })
      .catch(error => {
        console.error('Error saving element:', error);
        saveStatus.innerHTML = 'Error saving element: ' + error.message;
        saveStatus.style.color = 'red';
      });
  });
  
  // Helper function to send element data to server
  async function saveElement(elementData) {
    const apiUrl = 'http://localhost:9000/api/element-picker/create-element'; // Replace with your actual API endpoint
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elementData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save element');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save element:', error);
      throw error;
    }
  }
  
  // Helper function to generate CSS selector
  function getCssSelector(el) {
    if (el.id) return '#' + el.id;
    
    if (el.className) {
      const classes = el.className.split(' ').filter(c => c);
      if (classes.length) return el.tagName.toLowerCase() + '.' + classes.join('.');
    }
    
    return el.tagName.toLowerCase();
  }
  
  // Helper function to generate XPath
  function getXPath(element) {
    if (element.id) return '//*[@id="' + element.id + '"]';
    
    const paths = [];
    for (; element && element.nodeType === Node.ELEMENT_NODE; element = element.parentNode) {
      let index = 0;
      for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
          index++;
        }
      }
      const tagName = element.tagName.toLowerCase();
      const pathIndex = (index ? '[' + (index + 1) + ']' : '');
      paths.unshift(tagName + pathIndex);
    }
    return '/' + paths.join('/');
  }
})();
`;

module.exports = elementPickerScript;
