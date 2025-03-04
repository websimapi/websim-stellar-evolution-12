const { useState, useEffect, useRef } = React;

function App() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [terminalContent, setTerminalContent] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const terminalRef = useRef(null);
  const multiplayer = useRef(null);

  useEffect(() => {
    // Initialize multiplayer connection
    multiplayer.current = new WebsimSocket();
    
    // Get creator username for personalization
    const fetchCreator = async () => {
      try {
        const creator = await window.websim.getCreatedBy();
        initializeGame(creator.username);
      } catch (error) {
        console.error("Error fetching creator info:", error);
        initializeGame("Explorer");
      }
    };
    
    fetchCreator();
    
    // Subscribe to multiplayer game state updates
    multiplayer.current.collection('gameState').subscribe(function(states) {
      if (states && states.length > 0) {
        const latestState = states[0];
        setGameState(latestState);
      } else if (!initialized) {
        // If no state exists, create initial state
        createInitialGameState();
      }
    });
    
    return () => {
      // Cleanup
    };
  }, []);
  
  // Initialize the game with default state
  const createInitialGameState = async () => {
    const initialState = {
      resources: {
        energy: 1000,
        minerals: 500,
        knowledge: 100,
        population: 1000000000
      },
      starSystems: [
        {
          id: "sol",
          name: "Sol",
          discovered: true,
          explored: 0.2,
          planets: [
            {
              id: "earth",
              name: "Earth",
              type: "terrestrial",
              colonized: true,
              resources: {
                energy: 10,
                minerals: 5,
                knowledge: 1
              },
              population: 1000000000,
              facilities: []
            },
            {
              id: "mars",
              name: "Mars",
              type: "terrestrial",
              colonized: false,
              resources: {
                energy: 0,
                minerals: 0,
                knowledge: 0
              },
              population: 0,
              facilities: []
            }
          ]
        }
      ],
      technologies: [
        {
          id: "basic-rocketry",
          name: "Basic Rocketry",
          level: 1,
          completed: true
        },
        {
          id: "solar-power",
          name: "Solar Power",
          level: 1,
          completed: true
        }
      ],
      events: [],
      turnNumber: 1,
      lastCommand: "",
      commandHistory: [],
      timestampLastUpdated: Date.now()
    };
    
    try {
      await multiplayer.current.collection('gameState').create(initialState);
      setGameState(initialState);
      setInitialized(true);
      
      // Add intro message
      const introMessage = {
        type: "system",
        text: "Welcome to Stellar Evolution. You are the leader of a fledgling civilization on Earth. Your decisions will shape the destiny of your species as they reach for the stars. Type your commands below to begin your journey."
      };
      
      setTerminalContent(prev => [...prev, introMessage]);
    } catch (error) {
      console.error("Error creating initial game state:", error);
    }
  };
  
  // Initialize game with creator's username
  const initializeGame = (username) => {
    setTerminalContent(prev => [
      ...prev, 
      {
        type: "system",
        text: `Welcome, ${username}. Initializing Stellar Evolution. Please wait while we prepare your civilization...`
      }
    ]);
    setInitialized(true);
  };
  
  // Process a command from the user
  const processCommand = async (command) => {
    if (!command.trim()) return;
    
    // Add the command to the terminal
    setTerminalContent(prev => [
      ...prev, 
      {
        type: "command",
        text: command
      }
    ]);
    
    setLoading(true);
    
    try {
      // Update command history in game state
      const updatedState = {
        ...gameState,
        lastCommand: command,
        commandHistory: [...gameState.commandHistory, command].slice(-10),
        timestampLastUpdated: Date.now()
      };
      
      // Prepare the request for the LLM
      const llmRequest = {
        gameState: updatedState,
        userCommand: command,
        timestamp: Date.now()
      };
      
      // Process the command with the AI
      const completion = await websim.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are the core game engine for "Stellar Evolution", a space exploration and civilization-building game. 
                     You must return a valid JSON response for every command following this structure:
                     {
                       "response": {
                         "action": {
                           "type": "ACTION_TYPE",
                           "subtype": "ACTION_SUBTYPE",
                           "target": "target-id",
                           "resources": {},
                           "timeToComplete": number,
                           "success": boolean
                         },
                         "gameStateChanges": {},
                         "narrative": {
                           "mainText": "Main response text",
                           "detailText": "Optional details",
                           "tone": "positive/neutral/negative/urgent",
                           "imagePrompt": "Image prompt text"
                         },
                         "uiUpdates": {}
                       }
                     }
                     
                     Valid action types: EXPLORATION, RESEARCH, CONSTRUCTION, COLONIZATION, PRODUCTION, DIPLOMACY, MANAGEMENT, COMBAT, SPECIAL_EVENT.
                     Keep narratives engaging but concise. Only generate images for significant discoveries or events.
                     Your response should advance the game state logically based on the player's command.`
          },
          {
            role: "user",
            content: JSON.stringify(llmRequest)
          }
        ],
        json: true
      });
      
      // Parse LLM response
      const gameResponse = JSON.parse(completion.content);
      
      // Update game state with changes
      if (gameResponse.response && gameResponse.response.gameStateChanges) {
        const newState = {
          ...updatedState,
          ...gameResponse.response.gameStateChanges
        };
        
        // Save updated state
        await multiplayer.current.collection('gameState').update(gameState.id, newState);
        setGameState(newState);
      }
      
      // Generate image if needed
      let imageUrl = null;
      if (gameResponse.response.narrative && gameResponse.response.narrative.imagePrompt) {
        try {
          const imageResult = await websim.imageGen({
            prompt: gameResponse.response.narrative.imagePrompt,
            aspect_ratio: "16:9"
          });
          imageUrl = imageResult.url;
        } catch (error) {
          console.error("Error generating image:", error);
        }
      }
      
      // Add response to terminal
      setTerminalContent(prev => [
        ...prev,
        {
          type: "response",
          tone: gameResponse.response.narrative.tone || "neutral",
          text: gameResponse.response.narrative.mainText,
          detailText: gameResponse.response.narrative.detailText,
          imageUrl: imageUrl,
          action: gameResponse.response.action
        }
      ]);
      
    } catch (error) {
      console.error("Error processing command:", error);
      
      // Add error message to terminal
      setTerminalContent(prev => [
        ...prev,
        {
          type: "response",
          tone: "negative",
          text: "I'm sorry, there was an error processing your command. Please try again."
        }
      ]);
    }
    
    setLoading(false);
  };
  
  return (
    <>
      <StatusBar gameState={gameState} />
      <Terminal 
        content={terminalContent} 
        loading={loading} 
        ref={terminalRef} 
      />
      <CommandInput 
        onSubmit={processCommand} 
        disabled={loading || !gameState} 
      />
    </>
  );
}

export default App;

