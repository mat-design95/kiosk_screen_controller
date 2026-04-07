import { StorageService } from './storage';
import { WindowManagerService } from './windowManager';

let checkInterval: NodeJS.Timeout | null = null;
let isCurrentlyNight = false;

function checkNightMode() {
  const store = StorageService.getStore();
  if (!store || !store.nightModeSettings.enabled) {
    if (isCurrentlyNight) endNightMode();
    return;
  }

  const { startTime, endTime } = store.nightModeSettings;
  if (!startTime || !endTime) return;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  let isNightNow = false;
  if (startTotal < endTotal) {
    // Fx 10:00 til 14:00 (samme dag)
    isNightNow = currentMinutes >= startTotal && currentMinutes < endTotal;
  } else {
    // Fx 22:00 til 06:00 (krydser midnat)
    isNightNow = currentMinutes >= startTotal || currentMinutes < endTotal;
  }

  if (isNightNow && !isCurrentlyNight) {
    startNightMode();
  } else if (!isNightNow && isCurrentlyNight) {
    endNightMode();
  }
}

function startNightMode() {
  isCurrentlyNight = true;
  console.log("Night mode aktiveret");
  WindowManagerService.setNightModeForAll(true);
}

function endNightMode() {
  isCurrentlyNight = false;
  console.log("Night mode deaktiveret");
  WindowManagerService.setNightModeForAll(false);
}

export const SchedulerService = {
  start() {
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = setInterval(checkNightMode, 60000); // Tjekker minuttal fast
    checkNightMode(); // Tjek direkte ved startup
  },
  
  stop() {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }
};
