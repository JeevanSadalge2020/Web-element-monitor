# Web Element Monitor (WEM) - Project Requirements Document

## Project Overview

Web Element Monitor (WEM) is a web application designed to track and monitor UI elements across multiple websites and pages. The system allows users to visually select important UI elements, monitor them for changes over time, and receive notifications when elements are modified, moved, or removed. This helps in detecting website changes that could potentially break automations, tests, or affect user experience.

## Business Requirements

### Problem Statement

Website updates can unexpectedly break automation scripts, cause test failures, or disrupt user workflows when critical UI elements change. Currently, developers and QA teams often discover these issues only after they cause problems in production.

### Solution

WEM provides an early warning system that monitors key UI elements, detects changes, and notifies teams before these changes cause downstream issues. The system distinguishes between superficial changes (like a CSS class update) and meaningful changes (like an element disappearing or moving significantly).

## Technical Requirements

### Core Architecture

- **Stack**: MERN (MongoDB, Express.js, React, Node.js)
- **Architecture**: MVC pattern
- **Browser Automation**: Playwright
- **Deployment**: Containerizable with Docker

### Key Features

#### 1. Multi-Page Element Selection

- Visual element picker that works across multiple pages
- Ability to toggle element picker on/off during navigation
- Group elements by page context

#### 2. Secure Credential Storage

- Encrypt and store login credentials
- Automatic login during monitoring runs
- Support for different authentication methods

#### 3. Element Tracking

- Track elements using multiple selectors (XPath, CSS, ID)
- Store element attributes, position, and content
- Detect element changes, moves, and removals

#### 4. Smart Change Detection

- Distinguish between meaningful and superficial changes
- Use fuzzy matching for resilient element finding
- Compare visual and structural properties

#### 5. Dashboard and Reporting

- Overview of all monitored sites and elements
- Status indicators for each element
- Change history and visualization
- Export options for reports

## Data Models

### Site

- Name, URL
- Encrypted credentials
- Login configuration
- Status and health metrics

### PageContext

- Reference to parent site
- Page name and URL
- Navigation steps to reach the page
- Order in the flow

### Element

- Name and description
- Reference to page context
- Selectors (XPath, CSS, ID)
- Attributes and content
- Position and dimensions
- Status information

### MonitoringRun

- Timestamp
- Results for each element
- Change details
- Overall health metrics

## User Stories

1. As a user, I want to add a website to monitor, so I can track important elements on that site.
2. As a user, I want to provide login credentials, so the system can access authenticated pages.
3. As a user, I want to navigate through a website and select elements on different pages, so I can monitor elements throughout a user flow.
4. As a user, I want to toggle the element picker on/off as I navigate, so I can interact normally with the site between selection sessions.
5. As a user, I want to view the status of all monitored elements in a dashboard, so I can quickly identify issues.
6. As a user, I want to see a visual comparison of changed elements, so I understand exactly what changed.
7. As a user, I want the system to automatically check elements on a schedule, so I don't have to manually trigger checks.

## Technical Workflow

1. **Site Setup**:

   - User adds a new website with URL and optional credentials
   - System stores the site configuration securely

2. **Element Selection**:

   - User starts an element selection session
   - System opens the site in a controlled browser
   - User navigates through the site, toggling the element picker as needed
   - Selected elements are saved with their context

3. **Monitoring**:

   - System periodically visits each site
   - For authenticated sites, system logs in using stored credentials
   - System navigates to each page context
   - Elements are located and their current state is compared to previous states
   - Changes are detected and classified as meaningful or superficial

4. **Reporting**:
   - Dashboard displays current status of all elements
   - Detailed view shows change history and comparison

## MVP Scope (12-Hour Implementation)

For the initial demo with a 12-hour development timeline, we'll focus on:

1. Basic site and element management
2. Visual element picker with toggle capability
3. Simple page context management
4. Manual monitoring trigger
5. Basic dashboard showing element status
6. Simple change visualization

### Out of Scope for MVP

- Scheduled automatic monitoring
- Advanced notification system
- Comprehensive reporting
- User management
- Advanced security features

## Implementation Plan

1. **Hours 1-3**: Project setup and core models
2. **Hours 3-6**: Browser automation and element picker
3. **Hours 6-8**: Basic element monitoring and change detection
4. **Hours 8-11**: Dashboard and UI implementation
5. **Hour 12**: Testing, bug fixes, and demo preparation

## Technical Considerations

- **Security**: Credentials must be encrypted at rest
- **Browser Management**: Efficient launching and managing of browser instances
- **Element Identification**: Robust strategies for finding elements even after minor changes
- **Performance**: Optimize for large numbers of elements and sites
- **Error Handling**: Graceful handling of site availability issues and navigation errors
