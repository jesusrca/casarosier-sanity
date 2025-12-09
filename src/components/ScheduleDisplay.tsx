import { motion } from 'motion/react';

export interface TimeSlot {
  time: string;
  availablePlaces: number | null;
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

interface ScheduleDisplayProps {
  schedules: DaySchedule[];
  description?: string;
  showPlaces?: boolean;
}

export function ScheduleDisplay({ schedules, description, showPlaces = true }: ScheduleDisplayProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-hidden">
      <h3 className="text-xl sm:text-2xl mb-4">TURNOS:</h3>
      
      {description && (
        <div className="mb-6 space-y-2">
          <p className="text-sm sm:text-base text-foreground/80">{description}</p>
          {showPlaces && <p className="text-sm sm:text-base text-foreground/80">Elige el horario que mejor se adapte a ti.</p>}
        </div>
      )}

      <div className="space-y-6">
        {schedules.map((daySchedule, dayIndex) => (
          <motion.div
            key={daySchedule.day}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
          >
            <h4 className="text-primary mb-3 text-base sm:text-lg">{daySchedule.day}</h4>
            <div className="space-y-2">
              {daySchedule.slots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0 gap-2"
                >
                  <span className="text-foreground/80 text-sm sm:text-base flex-1">{slot.time}</span>
                  {showPlaces && (
                    <>
                      <div className="flex-1 min-w-0 mx-2 sm:mx-3 border-b border-dotted border-foreground/20"></div>
                      <span className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                        {slot.availablePlaces !== null 
                          ? `${slot.availablePlaces} ${slot.availablePlaces === 1 ? 'plaza' : 'plazas'}`
                          : 'Consultar'}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}