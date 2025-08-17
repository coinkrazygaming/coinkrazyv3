// Development mode configuration to prevent React hooks corruption
export const DEV_MODE_CONFIG = {
  // Disable features that cause React hooks issues during development
  DISABLE_TOOLTIPS: true,
  DISABLE_TOASTS: true,
  DISABLE_SONNER: true,
  DISABLE_HMR_RECOVERY: true,
  FORCE_PAGE_RELOAD_ON_HMR: true,
  
  // Safe component rendering flags
  USE_SAFE_WRAPPERS: true,
  SUPPRESS_HOOK_ERRORS: true,
  
  // Logging
  LOG_SAFE_MODE: true,
};

// Check if we're in development mode with React hooks issues
export const isReactHooksIssue = (): boolean => {
  return process.env.NODE_ENV === 'development' && (
    !React || 
    typeof React.useState !== 'function' ||
    typeof React.useContext !== 'function'
  );
};

// Safe component render check
export const shouldUseSafeMode = (): boolean => {
  return DEV_MODE_CONFIG.USE_SAFE_WRAPPERS && (
    process.env.NODE_ENV === 'development' || isReactHooksIssue()
  );
};

export const logSafeMode = (component: string, reason: string) => {
  if (DEV_MODE_CONFIG.LOG_SAFE_MODE) {
    console.log(`[SAFE MODE] ${component}: ${reason}`);
  }
};
