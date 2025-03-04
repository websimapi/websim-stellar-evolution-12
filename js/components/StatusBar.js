function StatusBar({ gameState }) {
  if (!gameState) {
    return (
      <div className="status-bar">
        <div>Initializing systems...</div>
      </div>
    );
  }
  
  const { resources } = gameState;
  
  return (
    <div className="status-bar">
      <div className="resource-display">
        <ResourceDisplay 
          icon="⚡" 
          value={Math.floor(resources.energy)} 
          label="Energy" 
        />
        <ResourceDisplay 
          icon="🪨" 
          value={Math.floor(resources.minerals)} 
          label="Minerals" 
        />
        <ResourceDisplay 
          icon="📚" 
          value={Math.floor(resources.knowledge)} 
          label="Knowledge" 
        />
        <ResourceDisplay 
          icon="👤" 
          value={formatPopulation(resources.population)} 
          label="Population" 
        />
      </div>
      
      <div className="turn-display">
        Cycle: {gameState.turnNumber}
      </div>
    </div>
  );
}

// Helper function to format large population numbers
function formatPopulation(population) {
  if (population >= 1000000000) {
    return (population / 1000000000).toFixed(1) + 'B';
  } else if (population >= 1000000) {
    return (population / 1000000).toFixed(1) + 'M';
  } else if (population >= 1000) {
    return (population / 1000).toFixed(1) + 'K';
  }
  return population;
}

export default StatusBar;

