/**
 * Display Connection Service
 * Manages display connections with intelligent polling, exponential backoff, and timeout detection
 */

export interface DisplayStatus {
  status: string;
  isPaired: boolean;
  organisationId: string | null;
  deviceName: string | null;
  dayPlan: any | null;
  wasReset?: boolean;
  resetReason?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  lastSeen: Date | null;
  consecutiveFailures: number;
  currentInterval: number;
}

export class DisplayConnectionService {
  private deviceId: string;
  private pollInterval: number = 5000; // Start at 5 seconds
  private maxInterval: number = 60000; // Max 60 seconds
  private minInterval: number = 2000; // Min 2 seconds when active
  private timeout: number = 300000; // 5 minutes timeout
  private pollTimer: number | null = null;
  private lastSuccessTime: Date | null = null;
  private consecutiveFailures: number = 0;
  private isActive: boolean = false;
  private onStatusUpdate: (status: DisplayStatus) => void;
  private onConnectionChange: (connected: boolean) => void;
  private onTimeout: () => void;

  constructor(
    deviceId: string,
    callbacks: {
      onStatusUpdate: (status: DisplayStatus) => void;
      onConnectionChange: (connected: boolean) => void;
      onTimeout: () => void;
    }
  ) {
    this.deviceId = deviceId;
    this.onStatusUpdate = callbacks.onStatusUpdate;
    this.onConnectionChange = callbacks.onConnectionChange;
    this.onTimeout = callbacks.onTimeout;
  }

  /**
   * Start polling for status updates
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.consecutiveFailures = 0;
    this.pollInterval = this.minInterval;
    
    // Poll immediately
    this.poll();
  }

  /**
   * Stop polling
   */
  stop(): void {
    this.isActive = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Poll for display status
   */
  private async poll(): Promise<void> {
    if (!this.isActive) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second request timeout

      const response = await fetch(`${apiUrl}/displays/pairing/status/${this.deviceId}`, {
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Device not found - major issue
          this.handleDeviceNotFound();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data: DisplayStatus = await response.json();
      
      // Success - reset failures and update state
      this.handleSuccess(data);

    } catch (error: any) {
      this.handleFailure(error);
    }

    // Schedule next poll if still active
    if (this.isActive) {
      this.pollTimer = window.setTimeout(() => this.poll(), this.pollInterval);
    }
  }

  /**
   * Handle successful poll
   */
  private handleSuccess(data: DisplayStatus): void {
    const wasDisconnected = this.consecutiveFailures > 0;
    
    this.consecutiveFailures = 0;
    this.lastSuccessTime = new Date();
    
    // Adjust polling interval based on activity
    if (data.isPaired && data.dayPlan) {
      // Active display - poll more frequently
      this.pollInterval = 3000;
    } else if (data.isPaired) {
      // Paired but no day plan - moderate polling
      this.pollInterval = 5000;
    } else {
      // Not paired - slower polling
      this.pollInterval = 10000;
    }

    // Notify if connection was restored
    if (wasDisconnected) {
      this.onConnectionChange(true);
    }

    // Notify status update
    this.onStatusUpdate(data);
  }

  /**
   * Handle failed poll with exponential backoff
   */
  private handleFailure(error: any): void {
    console.error('Display poll failed:', error);
    
    this.consecutiveFailures++;

    // Check for timeout
    if (this.lastSuccessTime) {
      const timeSinceSuccess = Date.now() - this.lastSuccessTime.getTime();
      if (timeSinceSuccess > this.timeout) {
        this.handleTimeout();
        return;
      }
    }

    // Exponential backoff
    this.pollInterval = Math.min(
      this.pollInterval * 1.5,
      this.maxInterval
    );

    // Notify connection issues after 3 failures
    if (this.consecutiveFailures === 3) {
      this.onConnectionChange(false);
    }
  }

  /**
   * Handle device not found
   */
  private handleDeviceNotFound(): void {
    console.error('Device not found - clearing local state');
    this.stop();
    localStorage.removeItem('displayId');
    localStorage.removeItem('displayPaired');
    localStorage.removeItem('displayOrgId');
    localStorage.removeItem('assignedDayPlan');
    
    // Force reload to reinitialize
    window.location.reload();
  }

  /**
   * Handle connection timeout
   */
  private handleTimeout(): void {
    console.error('Display connection timed out');
    this.stop();
    this.onTimeout();
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return {
      isConnected: this.consecutiveFailures === 0,
      lastSeen: this.lastSuccessTime,
      consecutiveFailures: this.consecutiveFailures,
      currentInterval: this.pollInterval
    };
  }

  /**
   * Force a refresh of the display status
   */
  refresh(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }
    this.pollInterval = this.minInterval;
    this.poll();
  }

  /**
   * Update device ID (e.g., after reinitialization)
   */
  updateDeviceId(newDeviceId: string): void {
    this.deviceId = newDeviceId;
    this.consecutiveFailures = 0;
    this.lastSuccessTime = null;
    this.refresh();
  }
}

/**
 * Create a display connection service instance
 */
export function createDisplayConnection(
  deviceId: string,
  callbacks: {
    onStatusUpdate: (status: DisplayStatus) => void;
    onConnectionChange: (connected: boolean) => void;
    onTimeout: () => void;
  }
): DisplayConnectionService {
  return new DisplayConnectionService(deviceId, callbacks);
}
