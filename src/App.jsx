import { useEffect, useMemo, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function AcademicSelector({ onEnter }) {
  const [year, setYear] = useState('2024-25')
  const [branch, setBranch] = useState('AI & ML')
  return (
    <div className="w-full max-w-2xl mx-auto bg-white/60 backdrop-blur rounded-xl p-6 shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-800">Student Event Performance Analyzer</h1>
      <p className="text-sm text-gray-600 mt-1">Select an academic year and branch to view students.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g., 2024-25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option>AI & ML</option>
            <option>CSE</option>
            <option>ECE</option>
            <option>EEE</option>
            <option>MECH</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => onEnter({ academic_year: year, branch })}
            className="w-full inline-flex justify-center items-center rounded-md bg-indigo-600 text-white font-medium py-2.5 hover:bg-indigo-700 transition"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  )
}

function RollNumberList({ year, branch, onSelect }) {
  const [loading, setLoading] = useState(false)
  const [rolls, setRolls] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRolls = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${BACKEND_URL}/roll-numbers?academic_year=${encodeURIComponent(year)}&branch=${encodeURIComponent(branch)}`)
        const data = await res.json()
        setRolls(data.roll_numbers || [])
      } catch (e) {
        setError('Failed to load roll numbers')
      } finally {
        setLoading(false)
      }
    }
    fetchRolls()
  }, [year, branch])

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-white/70 backdrop-blur rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Roll Numbers - {branch} ({year})</h2>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {rolls.map((r) => (
          <button
            key={r}
            onClick={() => onSelect(r)}
            className="px-3 py-2 text-sm rounded-md border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700"
          >
            {r}
          </button>
        ))}
        {!loading && rolls.length === 0 && (
          <p className="col-span-full text-sm text-gray-500">No students found. Add students in the backend to see them here.</p>
        )}
      </div>
    </div>
  )
}

function StudentHeader({ student }) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900">Student Details</h3>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{student?.name || '-'}</span></div>
        <div><span className="text-gray-500">Roll Number:</span> <span className="font-medium text-gray-800">{student?.roll_number}</span></div>
        <div><span className="text-gray-500">Branch:</span> <span className="font-medium text-gray-800">{student?.branch}</span></div>
        <div><span className="text-gray-500">Current Semester:</span> <span className="font-medium text-gray-800">{student?.current_semester}</span></div>
      </div>
    </div>
  )
}

function EventTable({ rollNumber, year }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      if (!rollNumber) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${BACKEND_URL}/stats/${encodeURIComponent(rollNumber)}${year ? `?academic_year=${encodeURIComponent(year)}` : ''}`)
        const data = await res.json()
        setRows(data.summary || [])
      } catch (e) {
        setError('Failed to load event stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [rollNumber, year])

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Details of the Student</h3>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-4">Event Name</th>
              <th className="py-2 pr-4">Held Events</th>
              <th className="py-2 pr-4">Attended Events</th>
              <th className="py-2 pr-4">Missed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.event_name} className="border-b last:border-none">
                <td className="py-2 pr-4 font-medium text-gray-800">{r.event_name}</td>
                <td className="py-2 pr-4">{r.held}</td>
                <td className="py-2 pr-4 text-emerald-700">{r.attended}</td>
                <td className="py-2 pr-4 text-rose-700">{r.missed}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">No participation records available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function App() {
  const [selection, setSelection] = useState(null)
  const [selectedRoll, setSelectedRoll] = useState('')
  const [student, setStudent] = useState(null)

  useEffect(() => {
    if (!selectedRoll) return
    const loadStudent = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/students/${encodeURIComponent(selectedRoll)}`)
        const data = await res.json()
        setStudent(data)
      } catch (e) {
        setStudent(null)
      }
    }
    loadStudent()
  }, [selectedRoll])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-10">
      <div className="px-4">
        {!selection ? (
          <AcademicSelector onEnter={setSelection} />
        ) : (
          <>
            <RollNumberList year={selection.academic_year} branch={selection.branch} onSelect={setSelectedRoll} />
            {selectedRoll && <StudentHeader student={student} />}
            {selectedRoll && (
              <EventTable rollNumber={selectedRoll} year={selection.academic_year} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
