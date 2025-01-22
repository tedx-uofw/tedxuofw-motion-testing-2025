import React, { useState } from 'react';
import DotGrid from '../components/LottieTS test 11';


const HeroTestPage = () => {
    return (
        <div>
            <h1>HeroTestPage</h1>

            <div style={{backgroundColor: 'black'}}>
                <DotGrid
                    dotSize={10}
                    dotColor={"white"}
                    maxDotSize={30}
                    distanceThreshold={10}
                    dotSpacing={30}
                    gridRows={55}
                    gridColumns={55}
                    smoothFactor={0.5}
                    shape={"circle"}
                    enableLookAt={true}
                />
            </div>
        </div>
    );
};

export default HeroTestPage;