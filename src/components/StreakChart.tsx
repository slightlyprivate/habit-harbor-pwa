import { useEffect, useRef } from 'react'
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

interface Habit {
  id: string
  name: string
  streak: number
}

interface StreakChartProps {
  habits?: Habit[]
}

export default function StreakChart({ habits = [] }: StreakChartProps) {
  const chartRef = useRef<ChartJS<'bar'>>(null)

  useEffect(() => {
    // Update chart when habits change
    if (chartRef.current) {
      chartRef.current.update()
    }
  }, [habits])

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No habits to display. Add some habits to see your progress!</p>
      </div>
    )
  }

  const data = {
    labels: habits.map(habit => habit.name),
    datasets: [
      {
        label: 'Current Streak (days)',
        data: habits.map(habit => habit.streak),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
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
  }

  return (
    <div className="w-full">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  )
}
