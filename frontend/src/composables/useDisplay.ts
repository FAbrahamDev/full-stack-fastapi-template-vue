import { ref, computed, onMounted, onUnmounted } from "vue";

// Default breakpoint thresholds
const defaultThresholds = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

// Default mobile breakpoint
const defaultMobileBreakpoint = "md";

export interface DisplayOptions {
  mobileBreakpoint?: number | keyof typeof defaultThresholds;
  thresholds?: typeof defaultThresholds;
  name?: string;
}

export interface Platform {
  android: boolean;
  ios: boolean;
  cordova: boolean;
  electron: boolean;
  chrome: boolean;
  edge: boolean;
  firefox: boolean;
  opera: boolean;
  win: boolean;
  mac: boolean;
  linux: boolean;
  touch: boolean;
  ssr: boolean;
}

export function useDisplay(options: DisplayOptions = {}) {
  const {
    thresholds = defaultThresholds,
    mobileBreakpoint = defaultMobileBreakpoint,
  } = options;

  const height = ref(0);
  const width = ref(0);
  const platform = ref<Platform>({
    android: false,
    ios: false,
    cordova: false,
    electron: false,
    chrome: false,
    edge: false,
    firefox: false,
    opera: false,
    win: false,
    mac: false,
    linux: false,
    touch: false,
    ssr: false,
  });

  // Breakpoint states
  const xs = computed(() => width.value < thresholds.sm);
  const sm = computed(
    () => width.value >= thresholds.sm && width.value < thresholds.md,
  );
  const md = computed(
    () => width.value >= thresholds.md && width.value < thresholds.lg,
  );
  const lg = computed(
    () => width.value >= thresholds.lg && width.value < thresholds.xl,
  );
  const xl = computed(
    () => width.value >= thresholds.xl && width.value < thresholds.xxl,
  );
  const xxl = computed(() => width.value >= thresholds.xxl);

  // Breakpoint composites
  const smAndDown = computed(() => width.value < thresholds.md);
  const smAndUp = computed(() => width.value >= thresholds.sm);
  const mdAndDown = computed(() => width.value < thresholds.lg);
  const mdAndUp = computed(() => width.value >= thresholds.md);
  const lgAndDown = computed(() => width.value < thresholds.xl);
  const lgAndUp = computed(() => width.value >= thresholds.lg);
  const xlAndDown = computed(() => width.value < thresholds.xxl);
  const xlAndUp = computed(() => width.value >= thresholds.xl);

  // Current breakpoint name
  const name = computed(() => {
    if (xs.value) return "xs";
    if (sm.value) return "sm";
    if (md.value) return "md";
    if (lg.value) return "lg";
    if (xl.value) return "xl";
    return "xxl";
  });

  // Mobile state
  const mobile = computed(() => {
    if (typeof mobileBreakpoint === "number") {
      return width.value < mobileBreakpoint;
    }

    const breakpointValue = thresholds[mobileBreakpoint];
    return width.value < breakpointValue;
  });

  // Display classes for component integration
  const displayClasses = computed(() => {
    const classes: string[] = [];

    if (options.name) {
      if (mobile.value) classes.push(`${options.name}--mobile`);
      classes.push(`${options.name}--${name.value}`);
    }

    return classes;
  });

  // Update dimensions
  const update = () => {
    height.value = window.innerHeight;
    width.value = window.innerWidth;
  };

  // Platform detection
  const detectPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    platform.value = {
      android: /android/.test(userAgent),
      ios: /iphone|ipad|ipod/.test(userAgent),
      cordova: !!(window as any).cordova,
      electron: /electron/.test(userAgent),
      chrome: /chrome/.test(userAgent),
      edge: /edge/.test(userAgent),
      firefox: /firefox/.test(userAgent),
      opera: /opera/.test(userAgent),
      win: /win/.test(userAgent),
      mac: /mac/.test(userAgent),
      linux: /linux/.test(userAgent),
      touch: "ontouchstart" in window,
      ssr: false,
    };
  };

  // Lifecycle hooks
  onMounted(() => {
    update();
    detectPlatform();
    window.addEventListener("resize", update, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return {
    // Dimensions
    height,
    width,

    // Breakpoints
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,

    // Breakpoint composites
    smAndDown,
    smAndUp,
    mdAndDown,
    mdAndUp,
    lgAndDown,
    lgAndUp,
    xlAndDown,
    xlAndUp,

    // Platform
    platform,
    mobile,

    // Names and classes
    name,
    displayClasses,

    // Thresholds
    thresholds,
  };
}
