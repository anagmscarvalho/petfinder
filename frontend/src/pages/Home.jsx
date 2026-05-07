export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
      <h1 className="text-4xl font-bold text-orange-700 mb-4">🐾 PetFinder</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Encontre seu pet perdido usando inteligência artificial.
      </p>
      <div className="flex gap-4">
        <a href="/perdi" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition">
          Perdi meu pet
        </a>
        <a href="/achei" className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition">
          Achei um animal
        </a>
      </div>
    </div>
  )
}
