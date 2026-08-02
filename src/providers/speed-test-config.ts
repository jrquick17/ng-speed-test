import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { SpeedTestFile } from '../models/speed-test-file.model';

export interface SpeedTestConfig {
  /**
   * URL used for the pre-flight connectivity check that runs before every speed test and every
   * isOnline() / getNetworkStatus() emission. When not provided, no third-party host is
   * contacted for connectivity verification - the library relies on navigator.onLine and on the
   * actual file fetch failing (with a real, attributable error) if the network is unreachable.
   */
  connectivityCheckUrl?: string;
  /** Timeout in ms for the connectivity check, if connectivityCheckUrl is set. Defaults to 3000. */
  connectivityCheckTimeout?: number;
  /** Overrides the built-in default test file for calls that do not supply their own. */
  file?: Partial<SpeedTestFile>;
  /** Timeout in ms for the file download of a single iteration. Defaults to 15000. */
  timeout?: number;
}

export const SPEED_TEST_CONFIG = new InjectionToken<SpeedTestConfig>('SPEED_TEST_CONFIG');

/**
 * Configures SpeedTestService. Optional - every field has a working default and this call is
 * not required to use the library. Pass connectivityCheckUrl only if you want an extra,
 * network-verified connectivity check in addition to navigator.onLine; ng-speed-test does not
 * contact any third-party host on its own unless you configure one here.
 */
export function provideSpeedTest(config: SpeedTestConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SPEED_TEST_CONFIG, useValue: config }
  ]);
}
