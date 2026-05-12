export default function MediaPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Media Library
        </h1>

        <button className="bg-black text-white px-6 py-3 rounded-xl">
          Upload Media
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl h-52 shadow-sm flex items-center justify-center text-gray-400">
          No Media
        </div>
      </div>
    </div>
  )
}