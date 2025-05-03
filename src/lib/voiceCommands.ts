
// Voice commands configuration
export const VOICE_COMMANDS = {
  // Playback controls
  PLAY: ['play', 'resume', 'start playing'],
  PAUSE: ['pause', 'stop', 'stop playing'],
  NEXT: ['next', 'skip', 'next song', 'next track', 'play next'],
  PREVIOUS: ['previous', 'back', 'previous song', 'go back', 'play previous'],
  
  // Account & Navigation
  LOGOUT: ['log out', 'sign out', 'logout', 'exit app', 'sign off', 'log off', 'logout now', 'exit account', 'sign me out'],
  EDIT_PROFILE: ['edit profile', 'open profile', 'update profile', 'change profile', 'modify profile', 'profile settings', 'my profile', 'show my profile', 'edit my profile', 'account settings'],
  CLOSE: ['close', 'close window', 'close dialog', 'exit', 'dismiss', 'close this', 'go back', 'cancel'],
  
  // Help & Guidance
  HELP: ['help', 'voice commands', 'what can i say', 'command list', 'show commands'],
};

// Command groups for UI presentation
export const COMMAND_GROUPS = {
  playback: [
    { name: "Play", variations: VOICE_COMMANDS.PLAY },
    { name: "Pause", variations: VOICE_COMMANDS.PAUSE },
    { name: "Next Song", variations: VOICE_COMMANDS.NEXT },
    { name: "Previous Song", variations: VOICE_COMMANDS.PREVIOUS },
  ],
  account: [
    { name: "Edit Profile", variations: VOICE_COMMANDS.EDIT_PROFILE },
    { name: "Logout", variations: VOICE_COMMANDS.LOGOUT },
  ],
  navigation: [
    { name: "Close", variations: VOICE_COMMANDS.CLOSE },
    { name: "Help", variations: VOICE_COMMANDS.HELP },
  ]
};
