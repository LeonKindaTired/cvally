const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your information when you use our website
          that helps create cover letters based on your CV, dream job position,
          and dream company.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Information We Collect
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>CV details you provide to generate a cover letter.</li>
          <li>Dream job position and dream company information.</li>
          <li>
            Any optional account information if you register, such as email.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          How We Use Your Information
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            To generate personalized cover letters based on the information you
            provide.
          </li>
          <li>
            To improve the functionality and user experience of our website.
          </li>
          <li>
            To communicate with you regarding updates or changes (only if you
            provide your email).
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Sharing</h2>
        <p className="mb-4">
          We do not sell, trade, or otherwise transfer your personal information
          to outside parties except as required by law or to trusted third-party
          services that assist in delivering our service (e.g., hosting or
          analytics), under strict confidentiality agreements.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies & Tracking</h2>
        <p className="mb-4">
          We may use cookies or similar technologies to enhance your experience
          on our website. These do not store personal information beyond what
          you provide voluntarily.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
        <p className="mb-4">
          We implement reasonable security measures to protect your information.
          However, no method of transmission over the internet is completely
          secure, so we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
        <p className="mb-4">
          You have the right to request access, correction, or deletion of your
          personal data. You can contact us at{" "}
          <a
            href="mailto:cvallysupport@gmail.com"
            className="text-blue-500 underline"
          >
            cvallysupport@gmail.com
          </a>{" "}
          for any inquiries.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated revision date.
        </p>

        <p className="mt-8">Effective date: August 18, 2025</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
