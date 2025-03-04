// Event generation system for the game

class EventGenerator {
  constructor() {
    this.eventTemplates = {
      exploration: [
        {
          type: "asteroid-discovery",
          title: "Asteroid Discovery",
          descriptionTemplate: "Your exploration vessels have discovered a sizable asteroid field near {location}. Initial scans indicate {resource} deposits.",
          probability: 0.2,
          minTurn: 5
        },
        {
          type: "new-planet",
          title: "Planet Discovered",
          descriptionTemplate: "Your astronomers have identified a previously unknown planet in the {location} system. It appears to be a {planetType} world.",
          probability: 0.1,
          minTurn: 10
        },
        {
          type: "cosmic-anomaly",
          title: "Cosmic Anomaly",
          descriptionTemplate: "A strange energy signature has been detected in the {location} region. Scientists are eager to investigate.",
          probability: 0.05,
          minTurn: 15
        }
      ],
      
      technological: [
        {
          type: "research-breakthrough",
          title: "Research Breakthrough",
          descriptionTemplate: "Your scientists have made an unexpected breakthrough in {technology} research.",
          probability: 0.15,
          minTurn: 8
        },
        {
          type: "ancient-artifact",
          title: "Ancient Artifact",
          descriptionTemplate: "Excavation teams on {location} have uncovered what appears to be an artifact of unknown origin. It may contain valuable technological insights.",
          probability: 0.08,
          minTurn: 20
        }
      ],
      
      economic: [
        {
          type: "resource-boom",
          title: "Resource Boom",
          descriptionTemplate: "Efficiency improvements have led to a sudden increase in {resource} production on {location}.",
          probability: 0.1,
          minTurn: 12
        },
        {
          type: "market-fluctuation",
          title: "Market Fluctuation",
          descriptionTemplate: "Economic fluctuations have affected the value of {resource} across your empire.",
          probability: 0.12,
          minTurn: 25
        }
      ],
      
      population: [
        {
          type: "population-growth",
          title: "Population Boom",
          descriptionTemplate: "Favorable conditions on {location} have led to accelerated population growth.",
          probability: 0.08,
          minTurn: 15
        },
        {
          type: "health-crisis",
          title: "Health Concern",
          descriptionTemplate: "Health officials on {location} report an emerging medical situation. Your attention is required.",
          probability: 0.07,
          minTurn: 30
        }
      ]
    };
  }
  
  // Generate random events based on game state
  generateRandomEvents(gameState, count = 1) {
    const events = [];
    const categories = Object.keys(this.eventTemplates);
    
    for (let i = 0; i < count; i++) {
      // Select random category
      const category = categories[Math.floor(Math.random() * categories.length)];
      const templates = this.eventTemplates[category];
      
      // Filter templates by probability and minimum turn
      const eligibleTemplates = templates.filter(template => {
        return Math.random() < template.probability && gameState.turnNumber >= template.minTurn;
      });
      
      if (eligibleTemplates.length > 0) {
        // Select random template from eligible ones
        const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
        
        // Generate event from template
        const event = this.createEventFromTemplate(template, gameState);
        events.push(event);
      }
    }
    
    return events;
  }
  
  // Create a specific event from a template
  createEventFromTemplate(template, gameState) {
    const event = {
      id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: template.type,
      title: template.title,
      createdAt: Date.now(),
      processed: false
    };
    
    // Fill in template variables
    let description = template.descriptionTemplate;
    
    // Replace {location} with a random location from the game state
    if (description.includes("{location}")) {
      const locations = [];
      
      gameState.starSystems.forEach(system => {
        locations.push(system.name);
        system.planets.forEach(planet => {
          locations.push(planet.name);
        });
      });
      
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      description = description.replace("{location}", randomLocation);
    }
    
    // Replace {resource} with a random resource
    if (description.includes("{resource}")) {
      const resources = ["energy", "mineral", "knowledge", "rare element"];
      const randomResource = resources[Math.floor(Math.random() * resources.length)];
      description = description.replace("{resource}", randomResource);
    }
    
    // Replace {technology} with a random technology
    if (description.includes("{technology}")) {
      const technologies = gameState.technologies
        .filter(tech => !tech.completed)
        .map(tech => tech.name);
      
      if (technologies.length > 0) {
        const randomTech = technologies[Math.floor(Math.random() * technologies.length)];
        description = description.replace("{technology}", randomTech);
      } else {
        description = description.replace("{technology}", "advanced scientific");
      }
    }
    
    // Replace {planetType} with a random planet type
    if (description.includes("{planetType}")) {
      const planetTypes = ["rocky", "gas giant", "ice", "terrestrial", "desert", "oceanic"];
      const randomType = planetTypes[Math.floor(Math.random() * planetTypes.length)];
      description = description.replace("{planetType}", randomType);
    }
    
    event.description = description;
    
    // Add category-specific data
    switch (template.type) {
      case "asteroid-discovery":
        event.mineralBonus = Math.floor(Math.random() * 200) + 50;
        break;
        
      case "research-breakthrough":
        event.knowledgeBonus = Math.floor(Math.random() * 150) + 50;
        // Find an in-progress technology to boost
        const inProgressTechs = gameState.technologies.filter(tech => !tech.completed && tech.progress > 0);
        if (inProgressTechs.length > 0) {
          const techToBoost = inProgressTechs[Math.floor(Math.random() * inProgressTechs.length)];
          event.technologyId = techToBoost.id;
          event.progressBoost = Math.floor(Math.random() * 20) + 10;
        }
        break;
        
      case "resource-boom":
        event.resourceType = ["energy", "minerals", "knowledge"][Math.floor(Math.random() * 3)];
        event.productionBoost = Math.floor(Math.random() * 30) + 10;
        event.duration = Math.floor(Math.random() * 5) + 3;
        break;
    }
    
    return event;
  }
}

export default new EventGenerator();

