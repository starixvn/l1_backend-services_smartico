import { JackPotTemperature } from '../types/jackpot';

interface TemperatureIndicatorProps {
  temperature: JackPotTemperature;
  showLabel?: boolean;
}

/**
 * Displays a visual temperature indicator for a jackpot pool.
 */
export function TemperatureIndicator({ temperature, showLabel = true }: TemperatureIndicatorProps) {
  const getTemperatureConfig = (temp: JackPotTemperature) => {
    switch (temp) {
      case JackPotTemperature.COLD:
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: '🧊',
          label: 'Cold',
          description: 'Pool is growing slowly'
        };
      case JackPotTemperature.WARM:
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '☀️',
          label: 'Warm',
          description: 'Pool halfway to explosion'
        };
      case JackPotTemperature.HOT:
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: '🔥',
          label: 'Hot',
          description: 'Pool in explosion range',
          animate: true
        };
      case JackPotTemperature.BURNING:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '🌋',
          label: 'Burning',
          description: 'Explosion imminent!',
          animate: true
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '❓',
          label: 'Unknown',
          description: 'Unknown temperature'
        };
    }
  };

  const config = getTemperatureConfig(temperature);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color}`}
      aria-label={`Pool temperature: ${config.label}. ${config.description}`}
      title={config.description}
    >
      <span className={`text-lg ${config.animate ? 'animate-pulse' : ''}`}>
        {config.icon}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {config.label}
        </span>
      )}
    </div>
  );
}
