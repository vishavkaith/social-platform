export default function ScheduledPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Scheduled Posts
      </h1>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">
                Post
              </th>

              <th className="text-left p-4">
                Platform
              </th>

              <th className="text-left p-4">
                Schedule Time
              </th>

              <th className="text-left p-4">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="p-4">
                No scheduled posts
              </td>

              <td className="p-4">-</td>
              <td className="p-4">-</td>
              <td className="p-4">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}