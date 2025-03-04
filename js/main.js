// Core game logic and utility functions
// This file handles non-React functionality and game state calculations

// Calculate resource production per turn based on colonies and facilities
function calculateResourceProduction(gameState) {
  let production = {
    energy: 0,
    minerals: 0,
    knowledge: 0,
    population: 0
  };
  
  // Add base production from all colonized planets
  gameState.starSystems.forEach(system => {
    system.planets.forEach(planet => {
      if (planet.colonized) {
        production.energy += planet.resources.energy || 0;
        production.minerals += planet.resources.minerals || 0;
        production.knowledge += planet.resources.knowledge || 0;
        
        // Population growth is 2% per turn for now
        production.population += Math.floor(planet.population * 0.02);
      }
    });
  });
  
  // Apply technology modifiers
  gameState.technologies.forEach(tech => {
    if (tech.completed) {
      // Apply specific technology bonuses
      if (tech.id === "solar-power" && tech.level >= 1) {
        production.energy *= 1.2; // 20% boost to energy from solar power
      }
      
      if (tech.id === "advanced-mining" && tech.level >= 1) {
        production.minerals *= 1.3; // 30% boost to minerals
      }
      
      if (tech.id === "scientific-method" && tech.level >= 1) {
        production.knowledge *= 1.5; // 50% boost to knowledge
      }
    }
  });
  
  return production;
}

// Update game state based on time passed in real world
function updateGameStateForTimePassed(gameState) {
  const now = Date.now();
  const millisPassed = now - gameState.timestampLastUpdated;
  const hoursPassed = millisPassed / (1000 * 60 * 60);
  
  // Only update if significant time has passed (more than 10 minutes)
  if (hoursPassed > 0.15) {
    // Calculate resource production for time passed
    const production = calculateResourceProduction(gameState);
    const turnsFraction = hoursPassed / 2; // Each turn represents 2 hours
    
    // Update resources based on production rates and time passed
    gameState.resources.energy += Math.floor(production.energy * turnsFraction);
    gameState.resources.minerals += Math.floor(production.minerals * turnsFraction);
    gameState.resources.knowledge += Math.floor(production.knowledge * turnsFraction);
    gameState.resources.population += Math.floor(production.population * turnsFraction);
    
    // Update turn counter
    gameState.turnNumber += Math.floor(turnsFraction);
    
    // Update timestamp
    gameState.timestampLastUpdated = now;
    
    // Trigger random events based on time passed
    if (Math.random() < turnsFraction * 0.05) { // 5% chance per turn to trigger event
      generateRandomEvent(gameState);
    }
  }
  
  return gameState;
}

// Generate a random event based on current game state
function generateRandomEvent(gameState) {
  const eventTypes = [
    "resource-discovery",
    "scientific-breakthrough",
    "population-event",
    "cosmic-phenomenon"
  ];
  
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  let event = {
    id: `event-${Date.now()}`,
    type: eventType,
    discovered: Date.now(),
    processed: false
  };
  
  // Customize event based on type
  switch(eventType) {
    case "resource-discovery":
      event.description = "Your scouts have discovered an unexpected resource deposit.";
      event.resourceType = ["energy", "minerals"][Math.floor(Math.random() * 2)];
      event.amount = Math.floor(Math.random() * 200) + 50;
      break;
      
    case "scientific-breakthrough":
      event.description = "Your scientists have made an unexpected breakthrough.";
      event.knowledgeBonus = Math.floor(Math.random() * 100) + 20;
      break;
      
    case "population-event":
      if (Math.random() > 0.5) {
        event.description = "A population boom has occurred in your colonies.";
        event.populationChange = Math.floor(gameState.resources.population * 0.03);
      } else {
        event.description = "A minor health crisis has affected your population.";
        event.populationChange = -Math.floor(gameState.resources.population * 0.01);
      }
      break;
      
    case "cosmic-phenomenon":
      event.description = "A cosmic phenomenon has been detected near your colonies.";
      event.knowledgeOpportunity = Math.floor(Math.random() * 50) + 10;
      break;
  }
  
  // Add event to game state
  gameState.events.push(event);
  
  return event;
}

// Utility functions
export {
  calculateResourceProduction,
  updateGameStateForTimePassed,
  generateRandomEvent
};

