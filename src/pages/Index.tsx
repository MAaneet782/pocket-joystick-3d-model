import React from 'react';
import ThreeDViewer from '../components/ThreeDViewer';

const IndexPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">3D Model Viewer Application</h1>
      <p className="text-center mb-8 text-gray-600">
        Below is the enlarged display area for the 3D model.
      </p>
      <ThreeDViewer />
    </div>
  );
};

export default IndexPage;