
type CommandHandler = (command: string) => void;

class VoiceCommandManager {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private handlers: Map<string, CommandHandler> = new Map();
  private commandKeywords: Map<string, string[]> = new Map();

  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    } else {
      console.warn("Speech recognition is not supported in this browser");
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.trim().toLowerCase();
      console.log('Voice command detected:', command);
      this.processCommand(command);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
    };
  }

  private processCommand(command: string) {
    for (const [action, keywords] of this.commandKeywords.entries()) {
      const match = keywords.some(keyword => command.includes(keyword.toLowerCase()));
      if (match) {
        const handler = this.handlers.get(action);
        if (handler) {
          handler(command);
          break;
        }
      }
    }
  }

  public registerCommand(action: string, keywords: string[], handler: CommandHandler) {
    this.handlers.set(action, handler);
    this.commandKeywords.set(action, keywords);
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        console.log("Voice command listening started");
      } catch (error) {
        console.error("Error starting voice recognition:", error);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log("Voice command listening stopped");
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public isActive(): boolean {
    return this.isListening;
  }
}

// Create a singleton instance
const voiceCommandManager = typeof window !== 'undefined' ? new VoiceCommandManager() : null;

export default voiceCommandManager;
