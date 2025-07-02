const About = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-2">getstyled.art</h3>
          <p className="text-gray-700 leading-relaxed">
            We are <strong>getstyled.art</strong>, your creative partner in
            bringing ideas to life through AI-powered image generation. Our
            Google Workspace add-on seamlessly integrates advanced AI technology
            into your workflow, making it easier than ever to create stunning
            visuals directly within your documents, presentations, and sheets.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-3">Get in Touch</h3>
          <p className="text-gray-700 mb-2">
            Have questions, feedback, or need support? We'd love to hear from
            you!
          </p>
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.91l7.997-4.026A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <a
              href="mailto:contact@getstyled.art"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              contact@getstyled.art
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
