import React, { useState } from 'react';

const Help = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    feedback: '',
    rating: 0,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (value) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    setSubmitted(true);
    // 🔁 Replace with actual POST request later
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
      <p className="mb-4 text-gray-700">
        Have a question or want to share feedback? Fill out the form below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Your Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Message / Complaint</label>
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Rate Your Experience</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => handleRating(star)}
                className={`text-xl ${
                  formData.rating >= star ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Additional Feedback</label>
          <textarea
            name="feedback"
            rows="3"
            value={formData.feedback}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>

        {submitted && (
          <p className="text-green-600 font-medium mt-3">Thanks for your message. We'll get back to you!</p>
        )}
      </form>
    </div>
  );
};

export default Help;
