# Fading Footprints: A Tale of Lost Wildlife and Species on the Brink

## Overview
**Fading Footprints** is a data visualization project created as a visual contest entry. It tells the compelling story of extinct and endangered animal species worldwide, emphasizing the critical role of **biodiversity** and **keystone species** in ecosystems. Using **scrolly-telling techniques**, **interactive globe visualizations**, and **data-driven charts**, the project aims to raise awareness and inspire action for wildlife conservation.


## Project Objectives
- Highlight the consequences of species extinction and endangerment due to **human activity**, **climate change**, and **habitat destruction**.
- Showcase the ecological importance of **keystone species**, with a focus on the **Grey Wolves in Yellowstone National Park** case study.
- Engage audiences emotionally and intellectually through **innovative visualizations** and **storytelling**.
- Bridge the gap between awareness and action by making biodiversity loss tangible and impactful.

## Key Features
- **Interactive Scrolly-Telling Narrative**:
  - Dynamically reveals ecological stories with synchronized animations and text overlays.
  - Features a case study of **Grey Wolves**, with a moving SVG wolf that transitions to signify extinction (black-and-white with red "X" eyes) and recovery.
- **Globe-Based Exploration**:
  - A **3D interactive globe** visualizes the global distribution of endangered species.
- **Data Visualizations**:
  - **Donut Chart**: Shows the percentage distribution of reasons for species endangerment.
  - **Line Chart**: Tracks population trends over time, highlighting conservation impacts.
  - **Flower Glyph Visualization**: A novel representation of **IUCN Summary Statistics**, with color-coded petals and tooltips for detailed subtype data.
- **Linked Visualizations**:
  - Interconnected **choropleth maps**, **donut charts**, and **line charts** provide a multi-dimensional view of endangerment factors and trends.
- **Case Study - Grey Wolves in Yellowstone**:
  - Details the ecological disruption from wolf extinction in the early 20th century and the transformative recovery after their **1995 reintroduction**.
  - Uses a **timeline chart** and scrolly-telling to illustrate cascading ecosystem effects.

## Datasets
- **IUCN Red List of Threatened Species**: Provides conservation status, geojson data, and population trends.
- **IUCN Summary Statistics**: Used for custom biodiversity visualizations.
- **Internet Sources**: Supplements the narrative with additional ecological context.

## Technical Details
- **Technologies Used**:
  - **HTML**, **CSS**, and **JavaScript** for web-based visualizations.
  - Libraries like **D3.js** (or similar) for interactive charts and globe rendering.
  - **Custom SVGs** for animations, including the Grey Wolf visualization.
- **Visualization Techniques**:
  - Scrolly-telling for dynamic storytelling.
  - Interactive tooltips and smooth transitions between visualization modes (e.g., **Total vs. Difference**).
  - Optimized for performance to ensure seamless user interaction.
- **Challenges Overcome**:
  - Balancing **data accuracy** with engaging storytelling.
  - Optimizing complex animations and globe visualizations for performance.
  - Iterative refinement for **user engagement** and **clarity**.

## Future Improvements
- **Enhanced Interactivity**: Allow users to explore custom timelines or filter by species, regions, or factors.
- **User-Driven Storylines**: Enable personalized narrative creation based on user-selected data.
- **Mobile Optimization**: Improve responsiveness for broader accessibility.
- **Expanded Scope**: Include additional species and ecosystems for comparative insights.
- **Accessibility**: Add narration, captions, and multilingual support.
- **Gamification**: Introduce quizzes or challenges to enhance learning.

## Installation and Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/shruthic06/Fading-Footprints-A-Tale-of-Lost-Wildlife-and-Species-on-the-Brink.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd Fading-Footprints-A-Tale-of-Lost-Wildlife-and-Species-on-the-Brink
   ```
3. **Install Dependencies** (if applicable, e.g., for JavaScript libraries):
   ```bash
   npm install
   ```
4. **Run the Application**:
   - Open `index.html` in a browser or use a local server:
     ```bash
     npm start
     ```
     or
     ```bash
     python -m http.server 8000
     ```
   - Access the project at `http://localhost:8000`.

## Usage
- Explore the **interactive globe** to view global species distribution.
- Scroll through the **scrolly-telling narrative** to learn about the **Grey Wolves** case study and other endangered species.
- Hover over visualizations (e.g., **flower glyphs**, **donut charts**) to access detailed data via tooltips.
- Review **population trends** and **endangerment factors** through interconnected charts.

## References
- [IUCN Red List of Threatened Species](https://www.iucnredlist.org/)
- [IUCN Summary Statistics](https://www.iucnredlist.org/resources/summary-statistics)
- Additional internet sources for ecological and conservation data

