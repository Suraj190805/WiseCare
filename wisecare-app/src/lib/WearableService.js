'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────
// Wearable Bluetooth Service
// Connects to BLE health devices (smartwatches, bands)
// Reads: Heart Rate, SpO2, Temperature, Steps, Battery
// Includes simulation mode for demo
// ─────────────────────────────────────────────────────

const WearableContext = createContext(null);

// Standard BLE Service UUIDs
const BLE_SERVICES = {
  HEART_RATE: 0x180D,
  BATTERY: 0x180F,
  DEVICE_INFO: 0x180A,
  HEALTH_THERMOMETER: 0x1809,
  BLOOD_PRESSURE: 0x1810,
  // Generic Access for device name
  GENERIC_ACCESS: 0x1800,
};

// Standard BLE Characteristic UUIDs
const BLE_CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: 0x2A37,
  BATTERY_LEVEL: 0x2A19,
  TEMPERATURE_MEASUREMENT: 0x2A1C,
  MANUFACTURER_NAME: 0x2A29,
  MODEL_NUMBER: 0x2A24,
  FIRMWARE_REVISION: 0x2A26,
  BLOOD_PRESSURE_MEASUREMENT: 0x2A35,
  DEVICE_NAME: 0x2A00,
};

// ── Simulation Data Generators ──
function generateHeartRate(base = 72) {
  return Math.round(base + (Math.random() - 0.5) * 12);
}

function generateSpO2(base = 97) {
  return Math.round(Math.min(100, Math.max(93, base + (Math.random() - 0.5) * 4)));
}

function generateTemperature(base = 98.2) {
  return parseFloat((base + (Math.random() - 0.5) * 0.8).toFixed(1));
}

function generateSteps(timeOfDay) {
  // More steps as day progresses
  const hour = new Date().getHours();
  const baseSteps = Math.floor(hour * 450 + Math.random() * 200);
  return Math.max(0, baseSteps);
}

function generateCalories(steps) {
  return Math.round(steps * 0.04 + Math.random() * 20);
}

function generateBloodPressure() {
  const systolic = Math.round(125 + (Math.random() - 0.5) * 16);
  const diastolic = Math.round(80 + (Math.random() - 0.5) * 10);
  return { systolic, diastolic, display: `${systolic}/${diastolic}` };
}

function generateBattery() {
  const hour = new Date().getHours();
  return Math.max(15, Math.min(100, 95 - Math.floor(hour * 3.5) + Math.floor(Math.random() * 5)));
}


export function WearableProvider({ children }) {
  // ── Connection State ──
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected | scanning | connecting | connected
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [btSupported, setBtSupported] = useState(false);
  const [error, setError] = useState(null);

  // ── Live Data State ──
  const [heartRate, setHeartRate] = useState(null);
  const [spo2, setSpO2] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [steps, setSteps] = useState(null);
  const [calories, setCalories] = useState(null);
  const [bloodPressure, setBloodPressure] = useState(null);
  const [battery, setBattery] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // ── History State (for charts) ──
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [spo2History, setSpO2History] = useState([]);
  const [stepsHistory, setStepsHistory] = useState([]);

  // ── Refs ──
  const deviceRef = useRef(null);
  const serverRef = useRef(null);
  const simulationRef = useRef(null);
  const hrCharRef = useRef(null);

  // ── Check BLE support on mount ──
  useEffect(() => {
    if (typeof window !== 'undefined' && 'bluetooth' in navigator) {
      setBtSupported(true);
    }

    // Load persisted device info from last session
    try {
      const stored = localStorage.getItem('wisecare_wearable_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.heartRateHistory) setHeartRateHistory(data.heartRateHistory);
        if (data.spo2History) setSpO2History(data.spo2History);
        if (data.stepsHistory) setStepsHistory(data.stepsHistory);
      }
    } catch {}

    return () => {
      stopSimulation();
      disconnectDevice();
    };
  }, []);

  // ── Persist history data ──
  useEffect(() => {
    try {
      localStorage.setItem('wisecare_wearable_data', JSON.stringify({
        heartRateHistory: heartRateHistory.slice(-50),
        spo2History: spo2History.slice(-50),
        stepsHistory: stepsHistory.slice(-24),
      }));
    } catch {}
  }, [heartRateHistory, spo2History, stepsHistory]);

  // ── Real BLE Connection ──
  const connectDevice = useCallback(async () => {
    if (!btSupported) {
      setError('Bluetooth is not supported in this browser. Use Chrome on desktop or Android.');
      return false;
    }

    try {
      setConnectionStatus('scanning');
      setError(null);

      // Request BLE device with health services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [BLE_SERVICES.HEART_RATE] },
          { services: [BLE_SERVICES.BATTERY] },
          { namePrefix: 'Mi' },       // Xiaomi bands
          { namePrefix: 'Galaxy' },    // Samsung watches
          { namePrefix: 'Apple' },     // Apple Watch
          { namePrefix: 'Fitbit' },    // Fitbit
          { namePrefix: 'Amazfit' },   // Amazfit watches
          { namePrefix: 'Band' },      // Generic bands
          { namePrefix: 'Watch' },     // Generic watches
        ],
        optionalServices: [
          BLE_SERVICES.HEART_RATE,
          BLE_SERVICES.BATTERY,
          BLE_SERVICES.DEVICE_INFO,
          BLE_SERVICES.HEALTH_THERMOMETER,
          BLE_SERVICES.GENERIC_ACCESS,
        ]
      });

      deviceRef.current = device;
      setConnectionStatus('connecting');

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setConnectionStatus('disconnected');
        setDeviceInfo(prev => prev ? { ...prev, connected: false } : null);
      });

      // Connect to GATT server
      const server = await device.gatt.connect();
      serverRef.current = server;

      // Get device info
      const info = {
        name: device.name || 'Unknown Device',
        id: device.id,
        connected: true,
        type: 'BLE Wearable',
        manufacturer: 'Unknown',
        model: 'Unknown',
        firmware: 'Unknown',
      };

      // Try to read device info service
      try {
        const diService = await server.getPrimaryService(BLE_SERVICES.DEVICE_INFO);
        try {
          const mfr = await diService.getCharacteristic(BLE_CHARACTERISTICS.MANUFACTURER_NAME);
          const mfrValue = await mfr.readValue();
          info.manufacturer = new TextDecoder().decode(mfrValue);
        } catch {}
        try {
          const model = await diService.getCharacteristic(BLE_CHARACTERISTICS.MODEL_NUMBER);
          const modelValue = await model.readValue();
          info.model = new TextDecoder().decode(modelValue);
        } catch {}
        try {
          const fw = await diService.getCharacteristic(BLE_CHARACTERISTICS.FIRMWARE_REVISION);
          const fwValue = await fw.readValue();
          info.firmware = new TextDecoder().decode(fwValue);
        } catch {}
      } catch {}

      setDeviceInfo(info);
      setIsSimulated(false);
      setConnectionStatus('connected');

      // ── Subscribe to Heart Rate Notifications ──
      try {
        const hrService = await server.getPrimaryService(BLE_SERVICES.HEART_RATE);
        const hrChar = await hrService.getCharacteristic(BLE_CHARACTERISTICS.HEART_RATE_MEASUREMENT);
        hrCharRef.current = hrChar;

        hrChar.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value;
          // Heart Rate Measurement format (BLE spec)
          const flags = value.getUint8(0);
          const is16Bit = flags & 0x01;
          const hr = is16Bit ? value.getUint16(1, true) : value.getUint8(1);

          setHeartRate(hr);
          setHeartRateHistory(prev => [...prev.slice(-49), {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: hr,
            timestamp: Date.now(),
          }]);
          setLastSync(new Date());
        });

        await hrChar.startNotifications();
      } catch (e) {
        console.log('Heart rate service not available:', e.message);
      }

      // ── Read Battery Level ──
      try {
        const batService = await server.getPrimaryService(BLE_SERVICES.BATTERY);
        const batChar = await batService.getCharacteristic(BLE_CHARACTERISTICS.BATTERY_LEVEL);
        const batValue = await batChar.readValue();
        setBattery(batValue.getUint8(0));
      } catch {}

      setLastSync(new Date());
      return true;
    } catch (e) {
      if (e.name === 'NotFoundError') {
        setError('No device selected. Please try again and select your wearable device.');
      } else {
        setError(`Connection failed: ${e.message}`);
      }
      setConnectionStatus('disconnected');
      return false;
    }
  }, [btSupported]);

  // ── Disconnect Device ──
  const disconnectDevice = useCallback(() => {
    if (deviceRef.current && deviceRef.current.gatt.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current = null;
    serverRef.current = null;
    hrCharRef.current = null;
    setConnectionStatus('disconnected');
    stopSimulation();
  }, []);

  // ── Simulation Mode (for demo without real device) ──
  const startSimulation = useCallback(() => {
    setIsSimulated(true);
    setConnectionStatus('connecting');
    setError(null);

    // Simulate connection delay
    setTimeout(() => {
      setDeviceInfo({
        name: 'CareWatch Pro',
        id: 'sim_' + Date.now(),
        connected: true,
        type: 'Smart Watch',
        manufacturer: 'CareCompanion',
        model: 'CareWatch Pro X1',
        firmware: 'v2.4.1',
        simulated: true,
      });
      setConnectionStatus('connected');

      // Initial data burst
      const hr = generateHeartRate();
      const sp = generateSpO2();
      const temp = generateTemperature();
      const st = generateSteps();
      const cal = generateCalories(st);
      const bp = generateBloodPressure();
      const bat = generateBattery();

      setHeartRate(hr);
      setSpO2(sp);
      setTemperature(temp);
      setSteps(st);
      setCalories(cal);
      setBloodPressure(bp);
      setBattery(bat);
      setLastSync(new Date());

      // Add initial history
      const now = new Date();
      const initialHistory = [];
      for (let i = 11; i >= 0; i--) {
        const t = new Date(now - i * 5 * 60000);
        initialHistory.push({
          time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: generateHeartRate(),
          timestamp: t.getTime(),
        });
      }
      setHeartRateHistory(initialHistory);

      const initialSpO2 = [];
      for (let i = 5; i >= 0; i--) {
        const t = new Date(now - i * 10 * 60000);
        initialSpO2.push({
          time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: generateSpO2(),
          timestamp: t.getTime(),
        });
      }
      setSpO2History(initialSpO2);

      // Start live updates
      simulationRef.current = setInterval(() => {
        const newHr = generateHeartRate();
        const newSp = generateSpO2();
        const newTemp = generateTemperature();
        const newSt = generateSteps();
        const newCal = generateCalories(newSt);

        setHeartRate(newHr);
        setSpO2(newSp);
        setTemperature(newTemp);
        setSteps(newSt);
        setCalories(newCal);
        setLastSync(new Date());

        setHeartRateHistory(prev => [...prev.slice(-49), {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: newHr,
          timestamp: Date.now(),
        }]);

        // SpO2 updates less frequently
        if (Math.random() > 0.6) {
          setSpO2History(prev => [...prev.slice(-49), {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: newSp,
            timestamp: Date.now(),
          }]);
        }

        // BP updates occasionally
        if (Math.random() > 0.85) {
          setBloodPressure(generateBloodPressure());
        }

        // Battery drains slowly
        if (Math.random() > 0.9) {
          setBattery(prev => Math.max(5, (prev || 80) - 1));
        }
      }, 3000);

    }, 1500);
  }, []);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
  }, []);

  // ── Get formatted vitals for SharedDataStore ──
  const getVitalsForStore = useCallback(() => {
    const data = {};
    if (heartRate) {
      data.heartRate = {
        current: heartRate,
        unit: 'bpm',
        trend: 'stable',
        history: heartRateHistory.slice(-7).map(h => h.value),
        source: 'wearable',
      };
    }
    if (spo2) {
      data.spo2 = {
        current: spo2,
        unit: '%',
        trend: 'stable',
        source: 'wearable',
      };
    }
    if (temperature) {
      data.temperature = {
        current: temperature,
        unit: '°F',
        trend: 'stable',
        source: 'wearable',
      };
    }
    if (bloodPressure) {
      data.bloodPressure = {
        current: bloodPressure.display,
        unit: 'mmHg',
        trend: 'stable',
        source: 'wearable',
      };
    }
    return data;
  }, [heartRate, spo2, temperature, bloodPressure, heartRateHistory]);

  const value = {
    // Connection
    connectionStatus,
    deviceInfo,
    isSimulated,
    btSupported,
    error,
    // Actions
    connectDevice,
    disconnectDevice,
    startSimulation,
    stopSimulation,
    // Live Data
    heartRate,
    spo2,
    temperature,
    steps,
    calories,
    bloodPressure,
    battery,
    lastSync,
    // History
    heartRateHistory,
    spo2History,
    stepsHistory,
    // Integration
    getVitalsForStore,
  };

  return (
    <WearableContext.Provider value={value}>
      {children}
    </WearableContext.Provider>
  );
}

export function useWearable() {
  const ctx = useContext(WearableContext);
  if (!ctx) {
    return {
      connectionStatus: 'disconnected',
      deviceInfo: null,
      isSimulated: false,
      btSupported: false,
      error: null,
      connectDevice: async () => false,
      disconnectDevice: () => {},
      startSimulation: () => {},
      stopSimulation: () => {},
      heartRate: null,
      spo2: null,
      temperature: null,
      steps: null,
      calories: null,
      bloodPressure: null,
      battery: null,
      lastSync: null,
      heartRateHistory: [],
      spo2History: [],
      stepsHistory: [],
      getVitalsForStore: () => ({}),
    };
  }
  return ctx;
}
