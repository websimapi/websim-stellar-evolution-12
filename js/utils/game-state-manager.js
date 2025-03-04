import { calculateResourceProduction, updateGameStateForTimePassed } from '../main.js';

class GameStateManager {
  constructor() {
    this.multiplayer = null;
    this.currentState = null;
    this.stateListeners = [];
  }
  
  initialize(websocket) {
    this.multiplayer = websocket;
    
    // Subscribe to game state changes
    this.multiplayer.collection('gameState').subscribe(states => {
      if (states && states.length > 0) {
        const latestState = states[0];
        
        // Update state with time-based progression
        const updatedState = updateGameStateForTimePassed(latestState);
        
        // Only update in DB if changes were made
        if (updatedState.timestampLastUpdated !== latestState.timestampLastUpdated) {
          this.saveState(updatedState);
        }
        
        this.currentState = updatedState;
        this.notifyListeners();
      }
    });
  }
  
  async saveState(state) {
    if (!this.multiplayer) return;
    
    try {
      if (state.id) {
        await this.multiplayer.collection('gameState').update(state.id, state);
      } else {
        await this.multiplayer.collection('gameState').create(state);
      }
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  }
  
  getCurrentState() {
    return this.currentState;
  }
  
  addStateListener(listener) {
    this.stateListeners.push(listener);
  }
  
  removeStateListener(listener) {
    this.stateListeners = this.stateListeners.filter(l => l !== listener);
  }
  
  notifyListeners() {
    for (const listener of this.stateListeners) {
      listener(this.currentState);
    }
  }
  
  // Get resource production rates for display
  getProductionRates() {
    if (!this.currentState) return null;
    return calculateResourceProduction(this.currentState);
  }
  
  // Generate a summarized state for AI prompt (to reduce token usage)
  getStateForPrompt() {
    if (!this.currentState) return null;
    
    // Create a simplified version with only necessary information
    const { resources, starSystems, technologies, events, turnNumber, lastCommand, commandHistory } = this.currentState;
    
    return {
      resources,
      starSystemCount: starSystems.length,
      colonizedPlanets: starSystems.reduce((count, system) => {
        return count + system.planets.filter(planet => planet.colonized).length;
      }, 0),
      recentDiscoveries: starSystems
        .filter(s => s.discovered)
        .slice(-3)
        .map(s => s.name),
      completedTechnologies: technologies
        .filter(t => t.completed)
        .map(t => t.name),
      researchInProgress: technologies
        .filter(t => !t.completed && t.progress > 0)
        .map(t => ({ name: t.name, progress: t.progress })),
      unprocessedEvents: events
        .filter(e => !e.processed)
        .slice(-5),
      turnNumber,
      lastCommand,
      recentCommands: commandHistory.slice(-5)
    };
  }
}

export default new GameStateManager();

