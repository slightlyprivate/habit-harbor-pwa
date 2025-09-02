import { useMemo, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

import type { Habit } from '../data/db'

interface StreakChartProps {
  habits?: Pick<Habit, 'id' | 'name' | 'streak'>[]
}

export default function StreakChart({ habits = [] }: StreakChartProps) {
  const chartRef = useRef<ChartJS<'bar'>>(null)

  const data = useMemo(() => ({
    labels: habits.map(habit => habit.name),
    datasets: [
      {
        label: 'Current Streak (days)',
        data: habits.map(habit => habit.streak),
        // Neutral slate tones for better dark mode contrast
        backgroundColor: 'rgba(100, 116, 139, 0.6)', // slate-500
        borderColor: 'rgba(71, 85, 105, 1)', // slate-600
        borderWidth: 1,
      },
    ],
  }), [habits])

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Habit Streaks',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }), [])

  return (
    <div className="w-full">
      {habits.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <p>No habits to display. Add some habits to see your progress!</p>
        </div>
      ) : (
        <Bar ref={chartRef} data={data} options={options} />
      )}
    </div>
  )
}
