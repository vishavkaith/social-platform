export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-gray-500">
            Total Reach
          </h2>

          <p className="text-4xl font-bold mt-4">
            0
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-gray-500">
            Total Likes
          </h2>

          <p className="text-4xl font-bold mt-4">
            0
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-gray-500">
            Total Comments
          </h2>

          <p className="text-4xl font-bold mt-4">
            0
          </p>
        </div>
      </div>
    </div>
  )
}