import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/students/', {
          withCredentials: true,
        });
        setProfile(res.data.user);
        setStudentDetails(res.data.user.studentDetails);
        setFormData(res.data.user.studentDetails || {});
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const url = studentDetails
        ? `http://localhost:5000/api/students/update/${formData._id}`
        : `http://localhost:5000/api/students/add`;

      const method = studentDetails ? 'put' : 'post';
      const res = await axios[method](url, formData, { withCredentials: true });

      if (res.status === 200 || res.status === 201) {
        setStudentDetails(res.data.studentDetails);
        setEditMode(false);
      } else {
        setFormError('Failed to save details.');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setFormError('Failed to save details.');
    }
  };

  if (loading) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">Student Profile</h2>
        {studentDetails && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {studentDetails ? (
        <div className="space-y-6">
          <Section title="Full Name">
            <ProfileRow label="Name" value={`${studentDetails.firstName} ${studentDetails.middleName || ''} ${studentDetails.lastName}`} />
            <ProfileRow label="Matric Number" value={profile.matricNumber} />
            <ProfileRow label="Email" value={profile.email} />
          </Section>

          <Section title="Contact Info">
            <ProfileRow label="Phone Number" value={studentDetails.phone} />
            <ProfileRow label="Address" value={studentDetails.address} />
          </Section>

          <Section title="Academic Info">
            <ProfileRow label="Department" value={studentDetails.department} />
            <ProfileRow label="Faculty" value={studentDetails.faculty} />
            <ProfileRow label="Hostel" value={studentDetails.hostel} />
            <ProfileRow label="Quota" value={studentDetails.quota} />
          </Section>

          <Section title="Guardian Info">
            <ProfileRow label="Guardian Name" value={studentDetails.guardianName} />
            <ProfileRow label="Guardian Phone" value={studentDetails.guardianPhone} />
            <ProfileRow label="Origin" value={studentDetails.origin} />
          </Section>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-4 text-sm text-yellow-800">
          No student details found. Please complete your profile below.
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(!studentDetails || editMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-[95%] max-w-2xl relative">
            <h3 className="text-xl font-bold mb-4">{studentDetails ? 'Edit' : 'Add'} Student Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'firstName', 'middleName', 'lastName',
                'phone', 'address', 'department',
                'faculty', 'hostel', 'origin',
                'guardianName', 'guardianPhone',
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  />
                </div>
              ))}
            </div>

            {formError && <p className="text-red-600 mt-4">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div className="mb-2">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-base font-medium text-gray-800">{value || '-'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h4 className="text-lg font-semibold text-gray-700 border-b pb-1 mb-3">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

export default StudentProfile;
