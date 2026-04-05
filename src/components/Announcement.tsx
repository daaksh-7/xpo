import React from "react";

const Announcement: React.FC = () => (
  <div className="glass border border-primary/40 rounded-lg p-4 mb-6 text-center bg-primary/10">
    <h2 className="text-xl font-bold mb-2 text-primary">
      🚀 GET FREE ORACLE & MICROSOFT CERTIFICATIONS! 🚀
    </h2>
    <p className="mb-2 text-base">
      A FREE E-Certificate of Participation will be provided to all attendees.
    </p>
    <p className="font-medium text-lg mt-2">
      <span className="text-secondary">Speaker:</span> Dr. Rajesh Bingu Ph.D.<br />
      <span className="text-secondary">Join Link:</span> <a href="#" className="underline text-blue-600">Google Meet</a><br />
      <span className="text-secondary">Date:</span> 17-10-2025 (Friday)<br />
      <span className="text-secondary">Time:</span> 07.00 PM<br />
      <span className="text-secondary">Mode:</span> Online (Google Meet)
    </p>
  </div>
);

export default Announcement;
