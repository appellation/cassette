export enum Code {
  // voice channel codes
  NO_VOICE_CHANNEL,
  NOT_JOINABLE,
  NOT_SPEAKABLE,

  // voice connection errors
  NO_VOICE_CONNECTION,

  // playlist errors
  NO_CURRENT_SONG,
}

class CassetteError extends Error {
  public readonly code: Code;
  constructor(code: Code) {
    super(Code[code]);
    this.code = code;
  }
}

export default CassetteError;
