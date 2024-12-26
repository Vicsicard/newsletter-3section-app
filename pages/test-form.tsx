export default function TestForm() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Form</h1>
      
      {/* Simple form for testing */}
      <form
        action="/api/onboarding"
        method="POST"
        encType="multipart/form-data"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          
          fetch('/api/onboarding', {
            method: 'POST',
            body: formData,
          })
          .then(async (response) => {
            const text = await response.text();
            console.log('Raw response:', text);
            try {
              const data = JSON.parse(text);
              console.log('Parsed response:', data);
            } catch (err) {
              console.error('Failed to parse response:', err);
            }
          })
          .catch(error => {
            console.error('Fetch error:', error);
          });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block">
              Company Name: *
              <input
                type="text"
                name="company_name"
                required
                className="border p-2 ml-2 w-full mt-1"
              />
            </label>
          </div>
          
          <div>
            <label className="block">
              Email: *
              <input
                type="email"
                name="contact_email"
                required
                className="border p-2 ml-2 w-full mt-1"
              />
            </label>
          </div>

          <div>
            <label className="block">
              Industry: *
              <input
                type="text"
                name="industry"
                required
                className="border p-2 ml-2 w-full mt-1"
              />
            </label>
          </div>

          <div>
            <label className="block">
              Target Audience: *
              <input
                type="text"
                name="target_audience"
                required
                className="border p-2 ml-2 w-full mt-1"
              />
            </label>
          </div>

          <div>
            <label className="block">
              Website URL:
              <input
                type="url"
                name="website_url"
                className="border p-2 ml-2 w-full mt-1"
                placeholder="https://"
              />
            </label>
          </div>

          <div>
            <label className="block">
              Phone Number:
              <input
                type="tel"
                name="phone_number"
                className="border p-2 ml-2 w-full mt-1"
              />
            </label>
          </div>
          
          <div>
            <label className="block">
              Contact List (CSV):
              <input
                type="file"
                name="contact_list"
                accept=".csv"
                className="ml-2 mt-1"
              />
            </label>
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Test Form
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-bold">Response will be shown in browser console (F12)</h3>
        <p>Required fields marked with *</p>
      </div>
    </div>
  );
}
