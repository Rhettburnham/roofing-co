// Performance monitoring utility for development
export class PerformanceMonitor {
  constructor() {
    this.componentRenders = new Map();
    this.recentLogs = [];
    this.maxLogs = 100;
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  trackRender(componentName, props = {}) {
    if (!this.isEnabled) return;

    const timestamp = Date.now();
    const renderInfo = {
      timestamp,
      component: componentName,
      propsKeys: Object.keys(props),
      propsCount: Object.keys(props).length
    };

    // Track render count for this component
    const renderCount = this.componentRenders.get(componentName) || 0;
    this.componentRenders.set(componentName, renderCount + 1);

    // Add to recent logs
    this.recentLogs.push(renderInfo);
    if (this.recentLogs.length > this.maxLogs) {
      this.recentLogs.shift();
    }

    // Warn if component is rendering excessively
    if (renderCount > 5 && renderCount % 5 === 0) {
      console.warn(`🔥 ${componentName} has rendered ${renderCount} times. Consider optimization.`);
    }

    return renderCount;
  }

  trackEffect(componentName, effectName, dependencies = []) {
    if (!this.isEnabled) return;

    console.log(`🔄 ${componentName} - ${effectName} effect running with deps:`, dependencies);
  }

  getStats() {
    if (!this.isEnabled) return null;

    const sortedComponents = Array.from(this.componentRenders.entries())
      .sort(([,a], [,b]) => b - a);

    return {
      totalComponents: this.componentRenders.size,
      totalRenders: Array.from(this.componentRenders.values()).reduce((sum, count) => sum + count, 0),
      topRenderingComponents: sortedComponents.slice(0, 10),
      recentActivity: this.recentLogs.slice(-20)
    };
  }

  logStats() {
    if (!this.isEnabled) return;

    const stats = this.getStats();
    console.group('📊 Performance Monitor Stats');
    console.log('Total Components:', stats.totalComponents);
    console.log('Total Renders:', stats.totalRenders);
    console.log('Top Rendering Components:', stats.topRenderingComponents);
    console.groupEnd();
  }

  reset() {
    this.componentRenders.clear();
    this.recentLogs = [];
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for tracking component renders
export const useRenderTracking = (componentName, props = {}) => {
  if (process.env.NODE_ENV === 'development') {
    performanceMonitor.trackRender(componentName, props);
  }
};

// React hook for tracking useEffect calls
export const useEffectTracking = (componentName, effectName, dependencies = []) => {
  if (process.env.NODE_ENV === 'development') {
    performanceMonitor.trackEffect(componentName, effectName, dependencies);
  }
};

// Utility to detect excessive re-renders
export const detectExcessiveRenders = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const stats = performanceMonitor.getStats();
  const excessive = stats.topRenderingComponents.filter(([name, count]) => count > 10);
  
  if (excessive.length > 0) {
    console.warn('🚨 Components with excessive renders detected:');
    excessive.forEach(([name, count]) => {
      console.warn(`  - ${name}: ${count} renders`);
    });
  }
};

// Auto-run stats logging every 30 seconds in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    detectExcessiveRenders();
  }, 30000);
} 