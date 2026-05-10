import { Suspense } from 'react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CURRENT = new Date().getMonth()

type Season = { name: string; emoji: string; months: number[]; provinces: string[]; note?: string }

const PRODUCE: Season[] = [
  { name: 'Mango',        emoji: '🥭', months: [11,0,1,2],    provinces: ['Limpopo','Mpumalanga'],           note: 'Thohoyandou & Tzaneen peak Dec–Feb' },
  { name: 'Avocado',      emoji: '🥑', months: [2,3,4,5],     provinces: ['Limpopo','KwaZulu-Natal'],        note: 'Haas variety Mar–Jun' },
  { name: 'Butternut',    emoji: '🎃', months: [2,3,4,5,6],   provinces: ['Western Cape','Northern Cape'],   note: 'Best Apr–May' },
  { name: 'Watermelon',   emoji: '🍉', months: [11,0,1,2],    provinces: ['Limpopo','North West','Gauteng'] },
  { name: 'Tomato',       emoji: '🍅', months: [0,1,2,3,10,11], provinces: ['All provinces'] },
  { name: 'Citrus (Oranges)', emoji: '🍊', months: [4,5,6,7,8], provinces: ['Western Cape','Limpopo','Eastern Cape'] },
  { name: 'Peach',        emoji: '🍑', months: [11,0,1],      provinces: ['Western Cape','Northern Cape'] },
  { name: 'Plum',         emoji: '🍈', months: [11,0,1,2],    provinces: ['Western Cape'] },
  { name: 'Banana',       emoji: '🍌', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['KwaZulu-Natal'],  note: 'Year-round, peak Jan–Mar' },
  { name: 'Strawberry',   emoji: '🍓', months: [4,5,6,7,8,9], provinces: ['Western Cape','Gauteng'],        note: 'Winter crop Jun–Sep' },
  { name: 'Spinach',      emoji: '🥬', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['All provinces'],  note: 'Year-round staple' },
  { name: 'Sweet Potato', emoji: '🍠', months: [2,3,4,5,6],   provinces: ['KwaZulu-Natal','Limpopo'] },
  { name: 'Pumpkin',      emoji: '🎃', months: [2,3,4,5],     provinces: ['All provinces'] },
  { name: 'Cabbage',      emoji: '🥦', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['All provinces'],  note: 'Year-round, cheaper Jun–Aug' },
  { name: 'Maize (Mealies)', emoji: '🌽', months: [1,2,3,4],  provinces: ['Limpopo','Mpumalanga','Free State'], note: 'Fresh mealies Feb–Apr' },
  { name: 'Litchi',       emoji: '🍒', months: [11,0,1],      provinces: ['Limpopo','Mpumalanga'],          note: 'Tzaneen & Hazyview Dec–Jan' },
  { name: 'Guava',        emoji: '🍏', months: [2,3,4,5],     provinces: ['Limpopo','Mpumalanga'] },
  { name: 'Papaya',       emoji: '🍈', months: [0,1,2,3,10,11], provinces: ['KwaZulu-Natal','Limpopo'] },
]

function isInSeason(months: number[]) { return months.includes(CURRENT) }

export default function SeasonalPage() {
  const inSeason = PRODUCE.filter((p) => isInSeason(p.months))
  const comingSoon = PRODUCE.filter((p) => !isInSeason(p.months) && p.months.includes((CURRENT + 1) % 12))
  const offSeason = PRODUCE.filter((p) => !isInSeason(p.months) && !p.months.includes((CURRENT + 1) % 12))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Seasonal Produce Calendar</h1>
        <p className="mt-2 text-gray-500">What's fresh across South Africa right now · {MONTHS[CURRENT]} prices are typically lowest for in-season produce</p>
      </div>

      {/* Month strip */}
      <div className="mb-8 flex gap-1 overflow-x-auto pb-1">
        {MONTHS.map((m, i) => (
          <div key={m} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
            i === CURRENT ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>{m}</div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500 inline-block" />
          In Season Now — {MONTHS[CURRENT]}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inSeason.map((p) => (
            <div key={p.name} className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-semibold text-gray-900">{p.name}</span>
              </div>
              <p className="text-xs text-gray-500">{p.provinces.join(', ')}</p>
              {p.note && <p className="mt-1 text-xs text-green-700 italic">{p.note}</p>}
            </div>
          ))}
        </div>
      </section>

      {comingSoon.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-yellow-700 mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />
            Coming Next Month — {MONTHS[(CURRENT + 1) % 12]}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoon.map((p) => (
              <div key={p.name} className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="font-semibold text-gray-900">{p.name}</span>
                </div>
                <p className="text-xs text-gray-500">{p.provinces.join(', ')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-300 inline-block" />
          Out of Season
        </h2>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {offSeason.map((p) => (
            <div key={p.name} className="rounded-xl border bg-gray-50 p-3 opacity-60">
              <span className="text-lg mr-2">{p.emoji}</span>
              <span className="text-sm text-gray-600">{p.name}</span>
              <p className="text-xs text-gray-400 mt-0.5">{MONTHS[p.months[0] ?? 0]}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-gray-400">
        Seasonality data based on South African Agricultural Research Council guidelines.
        Actual availability may vary by region and weather conditions.
      </p>
    </div>
  )
}
