export type AppErrorCode =
  | "network"
  | "server"
  | "invalid-data"
  | "not-found"
  | "rate-limited"
  | "forbidden"
  | "sign-in"
  | "credentials"
  | "account-exists"
  | "weak-password"
  | "too-many-attempts"
  | "wrong-role"
  | "unknown";

type UserMessage = { en: string; sw: string };

const userMessages: Record<AppErrorCode, UserMessage> = {
  network: {
    en: "We could not reach the server. Check your internet connection and try again.",
    sw: "Hatukuweza kufikia seva. Angalia mtandao wako kisha ujaribu tena.",
  },
  server: {
    en: "The server is busy right now. Please try again in a moment.",
    sw: "Seva ina shughuli nyingi sasa. Tafadhali jaribu tena baada ya muda mfupi.",
  },
  "invalid-data": {
    en: "The data we received was not in the expected format.",
    sw: "Data tuliyopokea haikuwa katika muundo uliotarajiwa.",
  },
  "not-found": {
    en: "We could not find what you were looking for.",
    sw: "Hatukupata ulichokuwa unatafuta.",
  },
  "rate-limited": {
    en: "A payment prompt was just sent to this number. Wait a minute, then try again.",
    sw: "Ombi la malipo limetumwa kwa nambari hii sasa hivi. Subiri dakika moja kisha ujaribu tena.",
  },
  forbidden: {
    en: "You do not have access to this. If you are a student, ask your teacher for help.",
    sw: "Huna ruhusa ya kufikia hili. Kama wewe ni mwanafunzi, muulize mwalimu wako akusaidie.",
  },
  "sign-in": {
    en: "Sign-in did not finish. Please try again.",
    sw: "Kuingia hakukukamilika. Tafadhali jaribu tena.",
  },
  credentials: {
    en: "That email and password do not match an account. Check them and try again.",
    sw: "Barua pepe na nenosiri hilo haviendani na akaunti yoyote. Viangalie kisha ujaribu tena.",
  },
  "account-exists": {
    en: "An account with this email already exists. Log in instead.",
    sw: "Akaunti yenye barua pepe hii tayari ipo. Ingia badala yake.",
  },
  "weak-password": {
    en: "Choose a longer password: at least 8 characters.",
    sw: "Chagua nenosiri refu zaidi: angalau herufi 8.",
  },
  "too-many-attempts": {
    en: "Too many tries. Wait a few minutes, then try again.",
    sw: "Majaribio mengi mno. Subiri dakika chache kisha ujaribu tena.",
  },
  "wrong-role": {
    en: "This account is not an educator account. Use the sign-in option for your account type.",
    sw: "Akaunti hii si ya mwalimu. Tumia chaguo la kuingia linalolingana na aina ya akaunti yako.",
  },
  unknown: {
    en: "Something went wrong. Please try again.",
    sw: "Hitilafu imetokea. Tafadhali jaribu tena.",
  },
};

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
  }

  get retryable() {
    return this.code === "network" || this.code === "server";
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof TypeError || error instanceof DOMException) {
    return new AppError("network", "Request failed", { cause: error });
  }
  return new AppError("unknown", "Unexpected error", { cause: error });
}

export function getUserMessage(error: AppError): UserMessage {
  return userMessages[error.code];
}

export function logError(context: string, error: unknown) {
  console.error(`[${context}]`, error);
}
