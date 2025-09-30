const Tutorial = () => {
  return (
    <div className="flex items-center justify-center bg-white overflow-hidden rounded-xl h-screen">
      <div style={{ width: '100%', height: '100%' }}>
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/YZ7XoTg4o10"
          title="GPT Image Generator Quickstart"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default Tutorial;
