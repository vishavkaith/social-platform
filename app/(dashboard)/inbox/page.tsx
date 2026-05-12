export default function InboxPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Unified Inbox
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="border-b pb-4 mb-4">
          <p className="font-semibold">
            Facebook Comment
          </p>

          <p className="text-gray-500 mt-2">
            User comments/messages will appear here.
          </p>
        </div>

        <div>
          <p className="font-semibold">
            LinkedIn Reaction
          </p>

          <p className="text-gray-500 mt-2">
            Notifications and reactions will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}