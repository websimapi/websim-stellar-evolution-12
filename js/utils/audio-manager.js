// Audio management system

class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.narrationVolume = 1.0;
    this.narrationEnabled = true;
    this.initialized = false;
  }
  
  async init() {
    try {
      // Load basic sound effects
      this.sounds = {
        command: new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFSgDMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYHAAAAAAAABUqyxbmUAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'),
        discovery: new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFSgDMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYHAAAAAAAABUqoMTZzAAAAAAAAAAAAAAAAAAAA')
      };
      
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }
  
  playSound(name) {
    if (!this.initialized) {
      this.init();
      return;
    }
    
    const sound = this.sounds[name];
    if (sound) {
      sound.volume = this.sfxVolume;
      sound.currentTime = 0;
      sound.play().catch(err => console.error("Error playing sound:", err));
    }
  }
  
  async speakText(text, voiceType = 'narrator') {
    if (!this.narrationEnabled || !this.initialized || !text) return;
    
    try {
      // In a real implementation, this would connect to a TTS API
      // For now we'll just log the text that would be spoken
      console.log(`Speaking as ${voiceType}: ${text}`);
    } catch (error) {
      console.error("Error with text-to-speech:", error);
    }
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }
  
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  setNarrationVolume(volume) {
    this.narrationVolume = Math.max(0, Math.min(1, volume));
  }
  
  toggleNarration(enabled) {
    this.narrationEnabled = enabled;
  }
}

export default new AudioManager();

