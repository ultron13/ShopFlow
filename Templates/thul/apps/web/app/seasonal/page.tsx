const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CURRENT = new Date().getMonth()

type Season = { name: string; emoji: string; months: number[]; provinces: string[]; note?: string }

// Months are 0-indexed: 0=Jan … 11=Dec
// Seasonality based on SA Agricultural Research Council + DALRRD guidelines
const PRODUCE: Season[] = [
  // ── Fruit ──────────────────────────────────────────────────────────────────
  { name: 'Mango',            emoji: '🥭', months: [11,0,1,2],          provinces: ['Limpopo','Mpumalanga'],                  note: 'Thohoyandou & Tzaneen peak Dec–Feb' },
  { name: 'Watermelon',       emoji: '🍉', months: [11,0,1,2],          provinces: ['Limpopo','North West','Free State'] },
  { name: 'Litchi',           emoji: '🍒', months: [11,0,1],            provinces: ['Limpopo','Mpumalanga'],                  note: 'Tzaneen & Hazyview peak Dec–Jan' },
  { name: 'Marula',           emoji: '🌿', months: [0,1,2],             provinces: ['Limpopo','Mpumalanga','North West'],      note: 'Sacred Venda fruit — Feb at its best; also fermented into beer' },
  { name: 'Peach',            emoji: '🍑', months: [11,0,1],            provinces: ['Western Cape','Northern Cape'] },
  { name: 'Apricot',          emoji: '🟠', months: [11,0,1],            provinces: ['Northern Cape','Western Cape'],           note: 'Keimoes & Kakamas — Jan is peak' },
  { name: 'Plum',             emoji: '🟣', months: [11,0,1,2],          provinces: ['Western Cape'] },
  { name: 'Pineapple',        emoji: '🍍', months: [11,0,1,2,3],        provinces: ['KwaZulu-Natal'],                          note: 'Hluhluwe & South Coast year-tender' },
  { name: 'Papaya',           emoji: '🫐', months: [0,1,2,3,9,10,11],  provinces: ['KwaZulu-Natal','Limpopo'],                note: 'Warm lowveld & KZN coast' },
  { name: 'Banana',           emoji: '🍌', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['KwaZulu-Natal'],               note: 'Year-round from KZN; peak Feb–Apr' },
  { name: 'Avocado',          emoji: '🥑', months: [2,3,4,5,6,7],      provinces: ['Limpopo','KwaZulu-Natal'],                note: 'Haas Mar–Jun; Fuerte May–Aug' },
  { name: 'Guava',            emoji: '🍐', months: [2,3,4,5],           provinces: ['Limpopo','Mpumalanga','KwaZulu-Natal'],   note: 'Pink-flesh variety; great for juice' },
  { name: 'Strawberry',       emoji: '🍓', months: [4,5,6,7,8,9],      provinces: ['Western Cape','Gauteng'],                 note: 'Winter crop — cheapest Jun–Aug' },
  { name: 'Naartjie',         emoji: '🍊', months: [4,5,6,7,8],        provinces: ['Western Cape','Eastern Cape'],            note: 'SA tangerine — sweet and easy-peel' },
  { name: 'Orange',           emoji: '🟡', months: [4,5,6,7,8],        provinces: ['Western Cape','Limpopo','Eastern Cape'],  note: 'Navel & Valencia — winter staple' },
  { name: 'Lemon',            emoji: '🍋', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['Western Cape','Limpopo'],      note: 'Eureka variety; year-round' },
  // ── Vegetables ─────────────────────────────────────────────────────────────
  { name: 'Tomato',           emoji: '🍅', months: [0,1,2,3,9,10,11],  provinces: ['All provinces'],                          note: 'Peak Dec–Feb and Oct–Nov; cheaper in summer' },
  { name: 'Spinach (Kale)',   emoji: '🥬', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['All provinces'],               note: 'Most common market leafy green; year-round' },
  { name: 'Morogo',           emoji: '🌱', months: [0,1,2,3,10,11],    provinces: ['Limpopo','North West','Mpumalanga'],      note: 'Indigenous wild spinach (Amaranthus) — summer staple in Vhembe' },
  { name: 'Cabbage',          emoji: '🫛', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['All provinces'],               note: 'Cheaper Jun–Aug; drumhead variety dominates' },
  { name: 'Maize (Mealies)',  emoji: '🌽', months: [1,2,3,4],           provinces: ['Limpopo','Mpumalanga','Free State'],      note: 'Fresh green mealies Feb–Apr; roasted at market stalls' },
  { name: 'Butternut',        emoji: '🎃', months: [2,3,4,5,6],        provinces: ['Western Cape','Northern Cape','Free State'], note: 'Harvest Apr–May; stores well through winter' },
  { name: 'Gem Squash',       emoji: '🟢', months: [2,3,4,5,6,7],      provinces: ['All provinces'],                          note: 'SA favourite — stuffed with mince or cheese' },
  { name: 'Pumpkin',          emoji: '🧡', months: [2,3,4,5],           provinces: ['All provinces'],                          note: 'Boer pumpkin (Hubbard) — used in pampoenkoekies' },
  { name: 'Sweet Potato',     emoji: '🍠', months: [2,3,4,5,6],        provinces: ['KwaZulu-Natal','Limpopo','Eastern Cape'] },
  { name: 'Amadumbe',         emoji: '🥔', months: [0,1,2,3,4,10,11],  provinces: ['KwaZulu-Natal'],                          note: 'Indigenous taro root — Zulu staple; starchy and nutty' },
  { name: 'Beetroot',         emoji: '🔴', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['All provinces'],               note: 'Year-round; popular at SA braais and school tuck shops' },
  { name: 'Onion',            emoji: '🧅', months: [0,1,2,3,4,5,6,7,8,9,10,11], provinces: ['Western Cape','Northern Cape','Free State'], note: 'Year-round — South Africa is a major exporter' },
  { name: 'Green Pepper',     emoji: '🫑', months: [0,1,2,3,9,10,11],  provinces: ['All provinces'],                          note: 'Peak in summer; also used in chakalaka' },
  { name: 'Garlic',           emoji: '🧄', months: [5,6,7,8,9],        provinces: ['Western Cape','Northern Cape'],            note: 'Harvested Jun–Sep; cures and stores through spring' },
]

function isInSeason(months: number[]) { return months.includes(CURRENT) }
function isComingSoon(months: number[]) { return months.includes((CURRENT + 1) % 12) }

function MonthBar({ months }: { months: number[] }) {
  return (
    <div className="mt-2 flex gap-0.5">
      {MONTHS.map((m, i) => (
        <div
          key={m}
          title={m}
          className={`h-1.5 flex-1 rounded-full ${
            months.includes(i)
              ? i === CURRENT ? 'bg-green-500' : 'bg-green-300'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function ProduceCard({ p, variant }: { p: Season; variant: 'green' | 'yellow' | 'gray' }) {
  const styles = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    gray: 'border-gray-200 bg-gray-50 opacity-70',
  }
  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{p.emoji}</span>
        <span className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</span>
      </div>
      <p className="text-xs text-gray-500">{p.provinces.join(' · ')}</p>
      {p.note && <p className={`mt-1 text-xs italic ${variant === 'green' ? 'text-green-700' : variant === 'yellow' ? 'text-yellow-700' : 'text-gray-400'}`}>{p.note}</p>}
      <MonthBar months={p.months} />
    </div>
  )
}

export default function SeasonalPage() {
  const inSeason  = PRODUCE.filter((p) => isInSeason(p.months))
  const comingSoon = PRODUCE.filter((p) => !isInSeason(p.months) && isComingSoon(p.months))
  const offSeason = PRODUCE.filter((p) => !isInSeason(p.months) && !isComingSoon(p.months))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">SA Seasonal Produce Calendar</h1>
        <p className="mt-2 text-gray-500">
          What's fresh at South African street markets right now —{' '}
          <span className="font-medium text-green-700">{MONTHS[CURRENT]}</span> prices are lowest for in-season produce.
          The bar under each item shows its harvest window across all 12 months.
        </p>
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
          In Season Now — {MONTHS[CURRENT]} ({inSeason.length} items)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inSeason.map((p) => <ProduceCard key={p.name} p={p} variant="green" />)}
        </div>
      </section>

      {comingSoon.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-yellow-700 mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />
            Coming Next Month — {MONTHS[(CURRENT + 1) % 12]} ({comingSoon.length} items)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoon.map((p) => <ProduceCard key={p.name} p={p} variant="yellow" />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-300 inline-block" />
          Out of Season ({offSeason.length} items)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offSeason.map((p) => <ProduceCard key={p.name} p={p} variant="gray" />)}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-gray-400">
        Seasonality based on SA Agricultural Research Council &amp; DALRRD guidelines.
        Availability varies by region, elevation, and season length.
      </p>
    </div>
  )
}
