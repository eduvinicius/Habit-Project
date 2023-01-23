import * as Checkbox from '@radix-ui/react-checkbox';
import dayjs from 'dayjs';
import { Check } from 'phosphor-react';
import {useEffect, useState} from 'react'
import { api } from '../lib/axios';

interface HabitsListProps {
  date: Date;
  onCompletedChanged: (completed: number) => void;
}

interface HabitsInfo {
  possibleHabits: Array<{
    id: string,
    title: string,
    created_at: string;
  }>,
  completedHabits: string[]
}

const HabitsList = ({date, onCompletedChanged}: HabitsListProps) => {

  const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>();

  useEffect(() => {
    api.get('/day', {
      params: {
        date:date.toISOString(),
      }
    }).then(res => {
      setHabitsInfo(res.data)
    })
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    await api.patch(`/habits/${habitId}/toggle`)

    // the "!" sign is useful to tell TS that the stater will not be undefined (the data will come)
    const isHabitAlreadyCompleted = habitsInfo!.completedHabits.includes(habitId)

    let completedHabits: string[] = []

    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter((id) => id !== habitId)

    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId]
    }

    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits,
    })
  
    onCompletedChanged(completedHabits.length)
  };

  const isDateInPast = dayjs(date).endOf('day').isBefore(new Date());

  return (
     <div className='mt-6 flex flex-col gap-3'>
      {habitsInfo?.possibleHabits.map((habit) => {
        return (
          <Checkbox.Root
            key={habit.id}
            onCheckedChange={() => handleToggleHabit(habit.id) }
            defaultChecked={habitsInfo.completedHabits.includes(habit.id)}
            disabled={isDateInPast}
            className='flex items-center gap-3 group disabled:cursor-not-allowed'
          >
            <div className='h-8 w-8 rounded-lg flex items-center 
              justify-center bg-zinc-900 border-2 border-zinc-800 
              group-data-[state=checked]:bg-green-500
              group-data-[state=checked]:border-green-500 transition-colors'
            >
              <Checkbox.Indicator>
                <Check size={20} className='text-white' />
              </Checkbox.Indicator>
            </div>
          
            <span className='font-semibold text-xl text-white leading-tight 
              group-data-[state=checked]:line-through
              group-data-[state=checked]:text-zinc-400'
            >
              {habit.title}
            </span>
          </Checkbox.Root>
        )
      })}
 
     </div>
  )
}

export default HabitsList;