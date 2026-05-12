export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Welcome Back 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-gray-500">
            Total Posts
          </h2>

          <p className="text-4xl font-bold mt-4">
            0
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-gray-500">
            Scheduled Posts
          </h2>

          <p className="text-4xl font-bold mt-4">
            0
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-gray-500">
            Connected Accounts
          </h2>

          <p className="text-4xl font-bold mt-4">
            0
          </p>
        </div>
      </div>
    </div>
  )
}