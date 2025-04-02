import React from 'react';

const Loading = () => {
    return (

        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal"></div>
        </div>
    );
};

export default Loading;
