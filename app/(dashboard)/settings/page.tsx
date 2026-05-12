export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">
        Settings
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div>
          <label className="block mb-2 font-medium">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Your name"
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Your email"
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Timezone
          </label>

          <select className="w-full border rounded-xl px-4 py-3">
            <option>Asia/Kolkata</option>
            <option>UTC</option>
          </select>
        </div>

        <button className="bg-black text-white px-6 py-3 rounded-xl">
          Save Settings
        </button>
      </div>
    </div>
  )
}