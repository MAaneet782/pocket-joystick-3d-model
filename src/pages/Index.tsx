import React from 'react';
import ThreeDViewer from '../components/ThreeDViewer';
import { MadeWithDyad } from '@/components/made-with-dyad';

const IndexPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-2 text-center">3D Controller Model Viewer</h1>
      <p className="text-center mb-4 text-gray-600">
        Explore the model using Orbit Controls (drag/scroll), the interactive buttons, and **hover over components to highlight them**.
      </p>
      <div className="flex-grow">
        <ThreeDViewer />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default IndexPage;