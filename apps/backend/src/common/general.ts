import { environment } from "./environment";

// Database options
export enum DatabaseOptions {
    DATABASE_TYPE = 'postgres'
}

// Define max number of concurrent jobs to process
export enum QueueConcurrency {
    EMAILS = 10,
    NOTIFICATIONS = 10,
    REPORTS = 10,
}

// Define BullMQ configurations
export enum BullMQOptions {
    ATTEMPTS = 3,
    BACKOFF_TYPE = 'exponential',
    BACKOFF_DELAY = 1000,
    REMOVE_ON_COMPLETE_COUNT = 1000,
    REMOVE_ON_FAIL_COUNT = 5000,
}

// Define core job actions
export enum CoreJobActions {
    SEND_NOTIFICATION = 'send-notification',
    SEND_EMAIL = 'send-email',
}

// Define encryption options
export enum EncryptionOptions {
    SALT_ROUNDS = 10,
}

// Pagination configs
export enum PaginationOptions {
    DEFAULT_ORIGIN = '',
    DEFAULT_LIMIT = 20,
    DEFAULT_MAX_LIMIT = 100,
}

// Default rate limit options
export enum RateLimitDefaultOptions {
    ONE_SECOND = 1000,
    ONE_MINUTE = 6000,
    LIMIT = 100,
}

// Define auth options
export const AuthOptions = {
    JWT_SECRET: environment.JWT_SECRET,
    ACCESS_TOKEN_EXPIRY: '1d',
} as const
